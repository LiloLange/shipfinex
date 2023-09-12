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
exports.transactionRoute = void 0;
const transaction_1 = require("../validation/transaction");
const transaction_2 = require("../swagger/transaction");
const etherscan_1 = require("../utils/etherscan");
const projects_1 = __importDefault(require("../models/projects"));
const project_1 = require("../utils/blockchain/project");
const options = { abortEarly: false, stripUnknown: true };
exports.transactionRoute = [
    {
        method: "GET",
        path: "/all",
        options: {
            // auth: "jwt",
            description: "Get all transactions by role with pagination",
            plugins: transaction_2.getTransactionSwagger,
            tags: ["api", "transaction"],
            validate: {
                query: transaction_1.getTransactionSchema,
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
                // const user = await User.findById(request.auth.credentials.userId);
                // const shipTokenAddress = await getShipTokenAddress(
                //   "64fada16159fdbf1e3628d42"
                // );
                const user = {
                    role: "prowner",
                    _id: "64fad47a159fdbf1e3628cf2",
                    wallet: {
                        address: "0xbdeb0d56293ca73532457df0ab4d768fcb0957ed",
                    },
                };
                let { page } = request.query;
                if (page === undefined) {
                    page = 1;
                }
                if (user.role === "investor") {
                    const result = yield (0, etherscan_1.getTransaction)(user.wallet.address, page);
                    return response.response(result).code(200);
                }
                else if (user.role === "prowner") {
                    const projects = yield projects_1.default.find({ projectOwner: user._id });
                    console.log("prowner project count", projects.length);
                    for (let i = 0; i < projects.length; i++) {
                        const project = projects[i];
                        const shipTokenAddress = yield (0, project_1.getShipTokenAddress)(project._id.toString());
                        const result = yield (0, etherscan_1.getTransaction)(shipTokenAddress, page);
                        console.log("prowner's project shiptoken address", shipTokenAddress, result);
                        return response.response(result).code(200);
                    }
                }
                return response.response({ msg: "failed" }).code(400);
            }),
        },
    },
];
//# sourceMappingURL=transaction.js.map