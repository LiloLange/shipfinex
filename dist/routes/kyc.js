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
exports.kycRoute = void 0;
const kycs_1 = __importDefault(require("../models/kycs"));
const sumsub_1 = require("../utils/sumsub");
const kyc_1 = require("../swagger/kyc");
const kyc_2 = require("../validation/kyc");
const users_1 = __importDefault(require("../models/users"));
const options = { abortEarly: false, stripUnknown: true };
exports.kycRoute = [
    {
        method: "GET",
        path: "/all",
        options: {
            auth: "jwt",
            description: "Get all KYC with pagination, status and role",
            plugins: kyc_1.getAllKYCSwagger,
            tags: ["api", "kyc"],
            validate: {
                query: kyc_2.getKYCSchema,
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
                const authUser = yield users_1.default.findById(request.auth.credentials.userId);
                if (authUser.role !== "admin")
                    return response.response({ msg: "Permission Error" }).code(403);
                let { status, user, page } = request.query;
                let result, query = {};
                if (user)
                    query["user.role"] = user;
                if (status) {
                    query["reviewStatus"] = status;
                }
                if (page) {
                    page = parseInt(page);
                }
                else
                    page = 1;
                const lookup = {
                    $lookup: {
                        from: "users",
                        localField: "externalUserId",
                        foreignField: "_id",
                        as: "user",
                    },
                };
                const unwind = {
                    $unwind: "$user",
                };
                const match = {
                    $match: query,
                };
                const project = {
                    $project: {
                        "user.middleName": 0,
                        "user._id": 0,
                        "user.password": 0,
                        "user.emailVerified": 0,
                        "user.doneMilestones": 0,
                        "user.transactions": 0,
                        "user.otp": 0,
                    },
                };
                const sort = {
                    $sort: {
                        createdAtMs: -1,
                    },
                };
                const skip = {
                    $skip: (page - 1) * 25,
                };
                const limit = {
                    $limit: 25,
                };
                const group = {
                    $group: {
                        _id: null,
                        count: { $sum: 1 },
                    },
                };
                const pipeline = [];
                pipeline.push(lookup, unwind);
                if (query)
                    pipeline.push(match);
                pipeline.push(group);
                const countTotal = yield kycs_1.default.aggregate(pipeline);
                let total = 0;
                if (countTotal.length > 0)
                    total = countTotal[0]["count"];
                pipeline.splice(3, 1);
                pipeline.push(sort, project, skip, limit);
                result = yield kycs_1.default.aggregate(pipeline);
                return { total: total, data: result, offset: 25 * page };
            }),
        },
    },
    {
        method: "GET",
        path: "/{applicantId}",
        options: {
            auth: "jwt",
            description: "Get an KYC by id",
            plugins: kyc_1.getSingleKYCSwagger,
            tags: ["api", "kyc"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const applicant = yield (0, sumsub_1.getApplicant)(request.params.applicantId);
                    const applicantVeriff = yield (0, sumsub_1.getApplicantVerifStep)(request.params.applicantId);
                    try {
                        return response.response({
                            applicant,
                            applicantVeriff,
                        });
                    }
                    catch (error) {
                        console.log(error);
                    }
                }
                catch (error) {
                    //console.log(error);
                    return response
                        .response({ msg: "KYC not found with given id" })
                        .code(404);
                }
            }),
        },
    },
    {
        method: "GET",
        path: "/image/{inspectionId}/{imageId}",
        options: {
            auth: "jwt",
            description: "Get an KYC image",
            plugins: kyc_1.getSingleKYCSwagger,
            tags: ["api", "kyc"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    let image, buffer;
                    const { inspectionId, imageId } = request.params;
                    try {
                        image = yield (0, sumsub_1.getImage)(inspectionId, imageId);
                        buffer = Buffer.from(image, "binary");
                        return response.response(buffer).type("arrayBuffer");
                    }
                    catch (error) {
                        console.log(error);
                    }
                }
                catch (error) {
                    //console.log(error);
                    return response
                        .response({ msg: "KYC image not found with given id" })
                        .code(404);
                }
            }),
        },
    },
    {
        method: "GET",
        path: "/websdk",
        options: {
            // auth: "jwt",
            description: "Get an KYC by id",
            // plugins: getSingleKYCSwagger,
            tags: ["api", "kyc"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                console.log("HERE");
                try {
                    const accessToken = yield (0, sumsub_1.getAccessToken)("64f6f3f648493e8818bc2095");
                    return response.response(accessToken);
                }
                catch (error) {
                    console.log(error);
                    return response
                        .response({ msg: "KYC not found with given id" })
                        .code(404);
                }
            }),
        },
    },
    {
        method: "PUT",
        path: "/{kycId}",
        options: {
            auth: "jwt",
            description: "Update KYC by ID",
            plugins: kyc_1.updateKYCSwagger,
            tags: ["api", "kyc"],
            validate: {
                payload: kyc_2.updateKYCSchema,
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
                return "Update";
            }),
        },
    },
    {
        method: "DELETE",
        path: "/{kycId}",
        options: {
            auth: "jwt",
            description: "Delete KYC by ID",
            plugins: kyc_1.deleteKYCSwagger,
            tags: ["api", "kyc"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                return "Delete";
            }),
        },
    },
    {
        method: "POST",
        path: "/hook",
        options: {
            description: "Hook KYC Change from Sumsub",
            tags: ["api", "kyc"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(request.payload);
            if (request.payload["type"] === "applicantCreated") {
                const newKYC = new kycs_1.default(request.payload);
                newKYC.history.push({
                    type: "Create",
                    createdAt: newKYC.createdAtMs,
                });
                try {
                    const result = yield newKYC.save();
                    return response.response(result).code(201);
                }
                catch (error) {
                    console.log(error);
                    return response.response({ msg: "Error occurs" }).code(404);
                }
            }
            const kyc = yield kycs_1.default.findOne({
                applicantId: request.payload["applicantId"],
            });
            if (kyc) {
                kyc.type = request.payload["type"];
                kyc.reviewStatus = request.payload["reviewStatus"];
                kyc.createdAtMs = request.payload["createdAtMs"];
                if (request.payload["reviewResult"])
                    kyc.reviewResult = request.payload["reviewResult"];
                kyc.history.push({
                    type: kyc.type,
                    createdAt: kyc.createdAtMs,
                });
                yield kyc.save();
                return response.response(kyc);
            }
            return response.response({ msg: "KYC not found" }).code(404);
        }),
    },
];
//# sourceMappingURL=kyc.js.map