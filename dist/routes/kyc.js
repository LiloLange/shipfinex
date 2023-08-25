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
                let result;
                const query = {
                    "user.role": user,
                };
                if (status) {
                    query["status.kycStatus"] = status;
                }
                if (page) {
                    page = parseInt(page);
                }
                else
                    page = 1;
                if (user) {
                    const pipeline = [
                        {
                            $match: { userId: { $ne: null } },
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "userId",
                                foreignField: "_id",
                                as: "user",
                            },
                        },
                        {
                            $match: query,
                        },
                        {
                            $project: {
                                user: 0,
                            },
                        },
                        {
                            $skip: (page - 1) * 10,
                        },
                        {
                            $limit: 10,
                        },
                    ];
                    result = yield kycs_1.default.aggregate(pipeline);
                }
                else {
                    result = yield kycs_1.default.find(query)
                        .skip((page - 1) * 10)
                        .limit(10);
                }
                return result;
            }),
        },
    },
    {
        method: "GET",
        path: "/{applicantId}",
        options: {
            // auth: "jwt",
            description: "Get an KYC by id",
            plugins: kyc_1.getSingleKYCSwagger,
            tags: ["api", "kyc"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const applicant = yield (0, sumsub_1.getApplicant)(request.params.applicantId);
                    const applicantVeriff = yield (0, sumsub_1.getApplicantVerifStep)(request.params.applicantId);
                    const res = yield (0, sumsub_1.getImage)(applicant.inspectionId, applicantVeriff.IDENTITY.imageIds[0]);
                    // const buffer = Buffer.from(res, "binary");
                    return response.response({
                        applicant,
                        applicantVeriff,
                        // image: buffer,
                    });
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
        path: "/websdk",
        options: {
            auth: "jwt",
            description: "Get an KYC by id",
            plugins: kyc_1.getSingleKYCSwagger,
            tags: ["api", "kyc"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const accessToken = yield (0, sumsub_1.getAccessToken)(request.auth.credentials.userId);
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
                    type: "Creat",
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