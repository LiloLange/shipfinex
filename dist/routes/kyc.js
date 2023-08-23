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
const fs_1 = __importDefault(require("fs"));
const kycs_1 = __importDefault(require("../models/kycs"));
const kyc_1 = require("../swagger/kyc");
const kyc_2 = require("../validation/kyc");
const getCurrentLoalTime_1 = __importDefault(require("../utils/getCurrentLoalTime"));
const users_1 = __importDefault(require("../models/users"));
const options = { abortEarly: false, stripUnknown: true };
exports.kycRoute = [
    {
        method: "POST",
        path: "/register",
        config: {
            description: "Create KYC",
            auth: "jwt",
            plugins: kyc_1.createKYCSwagger,
            payload: {
                maxBytes: 10485760000,
                output: "stream",
                parse: true,
                allow: "multipart/form-data",
                multipart: { output: "stream" },
            },
            tags: ["api"],
            validate: {
                payload: kyc_2.kycCreateSchema,
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
                const payload = request.payload;
                const facefile = payload["faceImage"];
                const video = payload["video"];
                const frontImage = payload["frontImage"];
                let backImage = payload["backImage"];
                let savePathDatabase = "/static/uploads/kyc/";
                let folder = __dirname + `../../static/uploads/kyc/`;
                folder += request.auth.credentials.userId + "/";
                savePathDatabase += request.auth.credentials.userId + "/";
                if (!fs_1.default.existsSync(folder)) {
                    fs_1.default.mkdirSync(folder);
                }
                const timeString = (0, getCurrentLoalTime_1.default)()
                    .toISOString()
                    .replace(/:/g, ".");
                folder += timeString;
                savePathDatabase += timeString;
                if (!fs_1.default.existsSync(folder)) {
                    fs_1.default.mkdirSync(folder);
                }
                const faceImageFileName = "/faceImage." + facefile["hapi"]["filename"].split(".")[1];
                const path1 = folder + faceImageFileName;
                const videoFileName = "/video." + video["hapi"]["filename"].split(".")[1];
                const path2 = folder + videoFileName;
                const frontImageFileName = "/frontImage." + frontImage["hapi"]["filename"].split(".")[1];
                const path3 = folder + frontImageFileName;
                let backImageFileName, path4;
                if (backImage) {
                    backImageFileName =
                        "/backImage." + frontImage["hapi"]["filename"].split(".")[1];
                    path4 = folder + backImageFileName;
                }
                const req = Object.assign({}, request.payload);
                const comment = [];
                comment.push({
                    action: "Register KYC",
                    actionDate: (0, getCurrentLoalTime_1.default)(),
                });
                const savePayload = Object.assign({}, req, {
                    userId: request.auth.credentials["userId"],
                    createdAt: (0, getCurrentLoalTime_1.default)(),
                    updatedAt: (0, getCurrentLoalTime_1.default)(),
                    comments: comment,
                });
                savePayload["kycDocument"] = {};
                savePayload["kycDocument"]["faceMatch"] = {};
                savePayload["kycDocument"]["faceMatch"]["image"] =
                    savePathDatabase + faceImageFileName;
                console.log(savePathDatabase + faceImageFileName);
                savePayload["kycDocument"]["faceMatch"]["aiResult"] = 0;
                savePayload["kycDocument"]["faceMatch"]["mannualResult"] = 0;
                savePayload["kycDocument"]["liveTest"] = {};
                savePayload["kycDocument"]["liveTest"]["video"] =
                    savePathDatabase + videoFileName;
                savePayload["kycDocument"]["liveTest"]["aiResult"] = 0;
                savePayload["kycDocument"]["liveTest"]["mannualResult"] = 0;
                if (backImage) {
                    savePayload["kycDocument"]["passport"] = {};
                    savePayload["kycDocument"]["passport"]["frontImage"] =
                        savePathDatabase + frontImageFileName;
                    savePayload["kycDocument"]["passport"]["backImage"] =
                        savePathDatabase + backImageFileName;
                }
                else {
                    savePayload["kycDocument"]["pancard"] = {};
                    savePayload["kycDocument"]["pancard"]["image"] =
                        savePathDatabase + frontImageFileName;
                }
                const newKYC = new kycs_1.default(savePayload);
                try {
                    const saveData = yield newKYC.save();
                    const saveFaceImage = fs_1.default.createWriteStream(path1);
                    const saveVideo = fs_1.default.createWriteStream(path2);
                    const saveFrontImage = fs_1.default.createWriteStream(path3);
                    if (backImage) {
                        const saveBackImage = fs_1.default.createWriteStream(path4);
                        backImage.pipe(saveBackImage);
                    }
                    console.log(path1);
                    facefile.pipe(saveFaceImage);
                    video.pipe(saveVideo);
                    frontImage.pipe(saveFrontImage);
                    return response.response(saveData).code(201);
                }
                catch (error) {
                    console.log(error);
                }
            }),
        },
    },
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
        path: "/{kycId}",
        options: {
            auth: "jwt",
            description: "Get an KYC by id",
            plugins: kyc_1.getSingleKYCSwagger,
            tags: ["api", "kyc"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const user = yield users_1.default.findById(request.auth.credentials.userId);
                const result = yield kycs_1.default.findById(request.params.kycId);
                if (result) {
                    if (user.role === "admin" || user._id === result.userId)
                        return response.response(result).code(200);
                    return response.response({ msg: "Permission Error" }).code(403);
                }
                return response.response({ msg: "KYC not found." }).code(404);
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
                const payload = request.payload;
                const user = yield users_1.default.findById(request.auth.credentials.userId);
                const result = yield kycs_1.default.findById(request.params.kycId);
                console.log(payload);
                if (result) {
                    if (user.role === "admin") {
                        if (payload.panManual)
                            result.kycDocument.faceMatch.mannualResult = payload.panManual;
                        if (payload.liveManual)
                            result.kycDocument.liveTest.mannualResult = payload.liveManual;
                        if (payload.status)
                            result.status.kycStatus = payload.status;
                    }
                    try {
                        yield result.save();
                    }
                    catch (error) {
                        console.log(error);
                    }
                    return response.response({ msg: "Permission Error" }).code(403);
                }
                return response.response({ msg: "KYC not found." }).code(404);
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
                const user = yield users_1.default.findById(request.auth.credentials.userId);
                const result = yield kycs_1.default.findById(request.params.kycId);
                if (result) {
                    if (user.role === "admin" ||
                        user._id.toString() === result.userId.toString()) {
                        yield result.deleteOne();
                        return response
                            .response({ msg: "KYC removed successfully" })
                            .code(200);
                    }
                    return response.response({ msg: "Permission Error" }).code(403);
                }
                return response.response({ msg: "KYC not found." }).code(404);
            }),
        },
    },
    {
        method: "POST",
        path: "/register1",
        options: {
            description: "Register User",
            tags: ["api", "kyc"],
        },
        handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(request.payload);
        }),
    },
];
//# sourceMappingURL=kyc.js.map