"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.depositRoute = void 0;
const deposit_1 = require("../swagger/deposit");
const deposit_2 = __importDefault(require("../models/deposit"));
const users_1 = __importDefault(require("../models/users"));
const deposit_3 = require("../validation/deposit");
const coinpayment_1 = require("../utils/coinpayment");
const options = { abortEarly: false, stripUnknown: true };
const client = require("stripe")(process.env.STRIPE_SECRET_KEY);
exports.depositRoute = [
    {
        method: "POST",
        path: "/",
        options: {
            auth: "jwt",
            description: "Create deposit",
            plugins: deposit_1.createDepositSwagger,
            tags: ["api", "vessel"],
            validate: {
                payload: deposit_3.depositSchema,
                options,
                failAction: (request, h, error) => {
                    const details = error.details.map((d) => {
                        return {
                            message: d.message,
                            path: d.path,
                        };
                    });
                    return h.response(details).code(400).takeover();
                },
            },
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const user = yield users_1.default.findById(request.auth.credentials.userId);
                // const user = await User.findById("64f5ba3786d7cb9d929bed60");
                const query = {
                    userId: user._id,
                    amount: request.payload["amount"],
                };
                const traHistory = yield deposit_2.default.find(query);
                if (traHistory.length !== 0) {
                    return traHistory[0];
                }
                const baseUrl = `${request.server.info.protocol}://${request.info.host}`;
                const ipn_url = `${baseUrl}/api/v1/deposit/ipn/${user._id}/${query.amount}`;
                console.log(ipn_url);
                const transaction = yield (0, coinpayment_1.createTransaction)(ipn_url, user.email, "USD", "ETH", query.amount);
                console.log(transaction);
                const newDeposit = new deposit_2.default({
                    userId: user._id,
                    amount: request.payload["amount"],
                    callback_url: transaction["checkout_url"],
                    expire: Date.now() + transaction["timeout"] * 1000,
                });
                yield newDeposit.save();
                return newDeposit;
            }),
        },
    },
    {
        method: "POST",
        path: "/ipn/{userId}/{amount}",
        options: {
            description: "Handle IPN",
            plugins: deposit_1.ipnSwagger,
            tags: ["api", "vessel"],
            validate: {
                params: deposit_3.ipnSchema,
                options,
                failAction: (request, h, error) => {
                    const details = error.details.map((d) => {
                        return {
                            message: d.message,
                            path: d.path,
                        };
                    });
                    return h.response(details).code(400).takeover();
                },
            },
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const query = {
                    userId: request.params["userId"],
                    amount: request.params["amount"],
                };
                const traHistory = yield deposit_2.default.find(query);
                if (traHistory.length !== 0) {
                    if (request.payload["status"] == 100) {
                        yield traHistory[0].deleteOne();
                        return response.response("Deposit Success");
                    }
                    return response.response({ msg: "Deposit failed" }).code(400);
                }
                return response.response({ msg: "Deposit can't find" }).code(404);
            }),
        },
    },
    {
        method: "POST",
        path: "/stripe/webhook",
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(request.payload["type"]);
            const sig = request.headers["stripe-signature"];
            let event;
            try {
                event = client.webhooks.constructEvent(request.payload, sig, "whsec_tJG83GCYYqPehdBfLcfkPlwcfdZSMb3d");
                if (request.payload["type"] === "charge.succeeded") {
                    const cus_id = request.payload["data"]["object"]["customer"];
                    const amount = request.payload["data"]["object"]["amount"];
                    console.log(cus_id);
                    const user = yield users_1.default.findOne({ cus_id: cus_id });
                    console.log(user.wallet.address);
                    console.log(request.payload["data"]["object"]["receipt_url"]);
                    return response.response("Success");
                }
            }
            catch (err) {
                return response.response(`Webhook Error: ${err.message}`).code(400);
            }
            // Handle the event
            console.log(`Unhandled event type ${event.type}`);
            // Return a 200 response to acknowledge receipt of the event
            return response.response({ msg: "Deposit can't find" }).code(404);
        }),
    },
];
//# sourceMappingURL=deposit.js.map