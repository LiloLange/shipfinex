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
const project_1 = require("../utils/blockchain/project");
const investment_1 = require("../validation/investment");
const investment_2 = require("../swagger/investment");
const mongoose_1 = __importDefault(require("mongoose"));
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
                    console.log(payload);
                    const newInvest = new investments_1.default(payload);
                    const result = yield newInvest.save();
                    return response.response(result).code(201);
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
                if (user.role === "admin") {
                    let { status, page } = request.query;
                    const query = {};
                    console.log(page);
                    if (status !== undefined)
                        query["status"] = status;
                    if (!page)
                        page = 1;
                    const total = yield investments_1.default.countDocuments(query);
                    const totalAmount = yield investments_1.default.aggregate([
                        {
                            $group: {
                                _id: null,
                                totalAmount: { $sum: "$amount" },
                            },
                        },
                    ]);
                    const result = yield investments_1.default.find(query)
                        .sort({ createdAt: -1 })
                        .skip((page - 1) * 10)
                        .limit(10);
                    let totalAmountNum = 0;
                    if (totalAmount.length > 0)
                        totalAmountNum = totalAmount[0]["totalAmount"];
                    return {
                        total,
                        totalAmount: totalAmountNum,
                        data: result,
                        offset: page * 10,
                    };
                }
                if (user.role === "investor") {
                    let { status, page } = request.query;
                    const query = { userId: request.auth.credentials.userId };
                    if (status !== undefined)
                        query["status"] = status;
                    if (!page)
                        page = 1;
                    const total = yield investments_1.default.countDocuments(query);
                    const objectId = new mongoose_1.default.Types.ObjectId(request.auth.credentials.userId);
                    const totalAmount = yield investments_1.default.aggregate([
                        {
                            $match: {
                                userId: objectId,
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                totalAmount: { $sum: "$amount" },
                            },
                        },
                    ]);
                    const result = yield investments_1.default.find(query)
                        .sort({ createdAt: -1 })
                        .skip((page - 1) * 25)
                        .limit(25);
                    let totalAmountNum = 0;
                    if (totalAmount.length > 0)
                        totalAmountNum = totalAmount[0]["totalAmount"];
                    return {
                        total,
                        totalAmount: totalAmountNum,
                        data: result,
                        offset: page * 25,
                    };
                }
                if (user.role === "prowner") {
                    let { status, page } = request.query;
                    if (!page)
                        page = 1;
                    let pipeline = [];
                    const tdata = yield investments_1.default.aggregate([
                        {
                            $lookup: {
                                from: "projects",
                                localField: "projectId",
                                foreignField: "_id",
                                as: "project",
                            },
                        },
                        {
                            $unwind: "$project",
                        },
                    ]);
                    console.log(tdata);
                    const lookup = {
                        $lookup: {
                            from: "projects",
                            localField: "projectId",
                            foreignField: "_id",
                            as: "project",
                        },
                    };
                    const unwind = {
                        $unwind: "$project",
                    };
                    let match;
                    const objectId = new mongoose_1.default.Types.ObjectId(request.auth.credentials.userId);
                    console.log(objectId);
                    if (status) {
                        match = {
                            $match: {
                                "project.projectOwner": objectId,
                                status: status,
                            },
                        };
                    }
                    else {
                        match = {
                            $match: {
                                "project.projectOwner": objectId,
                            },
                        };
                    }
                    const group1 = {
                        $group: {
                            _id: null,
                            count: { $sum: 1 },
                        },
                    };
                    const group2 = {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: "$amount" },
                        },
                    };
                    const sort = {
                        $sort: {
                            createdAt: -1,
                        },
                    };
                    const skip = {
                        $skip: (page - 1) * 25,
                    };
                    const limit = {
                        $limit: 25,
                    };
                    pipeline.push(lookup, unwind, match, group1);
                    const total = yield investments_1.default.aggregate(pipeline);
                    console.log(total);
                    pipeline.splice(3, 1);
                    pipeline.push(group2);
                    const totalAmount = yield investments_1.default.aggregate(pipeline);
                    pipeline.splice(3, 1);
                    pipeline.push(sort, skip, limit);
                    console.log(pipeline);
                    const result = yield investments_1.default.aggregate(pipeline);
                    console.log(result);
                    let totalAmountNum = 0;
                    if (totalAmount.length > 0)
                        totalAmountNum = totalAmount[0]["totalAmount"];
                    let totalNum = 0;
                    if (total.length > 0)
                        totalNum = total[0]["count"];
                    return {
                        total: totalNum,
                        totalAmount: totalAmountNum,
                        data: result,
                        offset: page * 25,
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