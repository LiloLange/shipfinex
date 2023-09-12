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
exports.investmentRoute = void 0;
const investments_1 = __importDefault(require("../models/investments"));
const users_1 = __importDefault(require("../models/users"));
const projects_1 = __importDefault(require("../models/projects"));
const project_1 = require("../utils/blockchain/project");
const investment_1 = require("../validation/investment");
const investment_2 = require("../swagger/investment");
const options = { abortEarly: false, stripUnknown: true };
exports.investmentRoute = [
    {
        method: "POST",
        path: "/",
        options: {
            auth: "jwt",
            description: "Investment on project",
            plugins: investment_2.investSwagger,
            tags: ["api", "user"],
            validate: {
                payload: investment_1.investSchema,
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
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const payload = {
                    userId: request.auth.credentials.userId,
                    projectId: request.payload["projectId"],
                    amount: request.payload["amount"],
                };
                const investResult = yield (0, project_1.invest)(payload.projectId, payload.userId, payload.amount);
                if (investResult) {
                    console.log("investment payload -->", payload);
                    const project = yield investments_1.default.findOne({
                        userId: payload.userId,
                        projectId: payload.projectId,
                    });
                    if (project) {
                        project.amount += payload.amount;
                        yield project.save();
                    }
                    else {
                        const newInvest = new investments_1.default(payload);
                        yield newInvest.save();
                    }
                    return response.response({ msg: "Invest success" }).code(201);
                }
                else {
                    return response.response({ msg: "Invest failed." }).code(400);
                }
            }
            catch (error) {
                console.log(error);
                return response.response({ msg: "Invest failed" }).code(500);
            }
        }),
    },
    {
        method: "GET",
        path: "/",
        options: {
            auth: "jwt",
            description: "Get investment with pagination, userId, projectId, status, page",
            plugins: investment_2.getInvestmentSwagger,
            tags: ["api", "kyc"],
            validate: {
                query: investment_1.getInvestmentSchema,
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
                const userId = request.auth.credentials.userId;
                const user = yield users_1.default.findById(userId);
                var totalAmount = 0;
                var totalClaimed = 0;
                var totalClaimable = 0;
                if (user.role === "investor") {
                    const projectIds = yield projects_1.default.find({});
                    const investorAddress = user.wallet.address;
                    const result = [];
                    for (let i = 0; i < projectIds.length; i++) {
                        const row = projectIds[i];
                        const amount = yield (0, project_1.getBalance)(row._id.toString(), investorAddress);
                        if (Number(amount) === 0)
                            continue;
                        const price = yield (0, project_1.getShipTokenPrice)(row._id.toString());
                        const claimed = yield (0, project_1.getClaimedRewards)(row._id.toString(), investorAddress);
                        const claimable = yield (0, project_1.getClaimableAmount)(row._id.toString(), investorAddress);
                        totalAmount += Number(amount) * Number(price);
                        totalClaimed += Number(claimed);
                        totalClaimable += Number(claimable);
                        result.push({
                            project: row,
                            amount,
                            price,
                            claimedRewards: claimed,
                            claimableRewards: claimable,
                        });
                    }
                    return {
                        total: {
                            investment: totalAmount,
                            claimed: totalClaimed,
                            claimable: totalClaimable,
                        },
                        data: result,
                    };
                }
                if (user.role === "prowner") {
                    const projectIds = yield projects_1.default.find({ projectOwner: userId });
                    var totalFundraising = 0;
                    var totalRewards = 0;
                    const result = [];
                    for (let i = 0; i < projectIds.length; i++) {
                        const project = projectIds[i];
                        const fundraising = yield (0, project_1.getFundraising)(project._id.toString());
                        const givenRewards = yield (0, project_1.getGivenRewards)(project._id.toString());
                        totalFundraising += Number(fundraising);
                        totalRewards += Number(givenRewards);
                        result.push({
                            project,
                            fundraising,
                            givenRewards,
                        });
                    }
                    return {
                        data: result,
                        total: { fundraising: totalFundraising, rewards: totalRewards },
                    };
                }
                return response
                    .response({ msg: "You have no permission to access." })
                    .code(403);
            }),
        },
    },
    // {
    //   method: "GET",
    //   path: "/{userId}",
    //   options: {
    //     auth: "jwt",
    //     description: "Get signle user's information",
    //     plugins: getSingleUserSwagger,
    //     tags: ["api", "user"],
    //     handler: async (request: Request, response: ResponseToolkit) => {
    //       const userId = request.auth.credentials.userId;
    //       const authUser = await User.findById(userId);
    //       if (authUser.role === "admin") {
    //         const user = await User.findById(request.params.userId);
    //         if (user) return user;
    //         return response
    //           .response({ msg: "Cannot find the specific user's information." })
    //           .code(400);
    //       }
    //       return response
    //         .response({ msg: "You have no permission to access." })
    //         .code(403);
    //     },
    //   },
    // },
    // {
    //   method: "PUT",
    //   path: "/{userId}",
    //   options: {
    //     auth: "jwt",
    //     description: "Get single user's information",
    //     plugins: getSingleUserSwagger,
    //     tags: ["api", "user"],
    //     validate: {
    //       payload: userUpdateSchema,
    //       options,
    //       failAction: (request, h, error) => {
    //         const details = error.details.map((d) => {
    //           return {
    //             message: d.message,
    //             path: d.path,
    //           };
    //         });
    //         return h.response(details).code(400).takeover();
    //       },
    //     },
    //     handler: async (request: Request, response: ResponseToolkit) => {
    //       const payload = request.payload as UpdateUserPayload;
    //       if (payload.password) {
    //         const hash = await bcrypt.hash(payload.password, 10);
    //         payload.password = hash;
    //       }
    //       const userId = request.auth.credentials.userId;
    //       const authUser = await User.findById(userId);
    //       if (authUser.role === "admin" || request.params.userId === userId) {
    //         const user = await User.findOneAndUpdate(
    //           { _id: request.params.userId },
    //           { $set: payload },
    //           { new: true }
    //         );
    //         return user;
    //       }
    //       return response.response({ msg: "Cannot update" }).code(400);
    //     },
    //   },
    // },
];
//# sourceMappingURL=investment.js.map