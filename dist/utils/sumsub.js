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
exports.getAccessToken = exports.getImageHeaders = exports.getImage = exports.getApplicantVerifStep = exports.getApplicant = void 0;
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const sumsubSecret = config_1.default.sumsubSecret;
const sumsubToken = config_1.default.sumsubToken;
const SUMSUB_BASE_URL = "https://api.sumsub.com";
let config = {};
config.baseURL = SUMSUB_BASE_URL;
const createSignature = (config) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Creating a signature for the request...");
    var ts = Math.floor(Date.now() / 1000) + 50;
    const signature = crypto_1.default.createHmac("sha256", sumsubSecret);
    signature.update(ts + config.method.toUpperCase() + config.url);
    // if (config.data instanceof FormData) {
    //   signature.update(config.data.getBuffer());
    // } else if (config.data) {
    //   signature.update(config.data);
    // }
    config.headers["X-App-Access-Ts"] = ts;
    config.headers["X-App-Access-Sig"] = signature.digest("hex");
    return config;
});
axios_1.default.interceptors.request.use(createSignature, function (error) {
    return Promise.reject(error);
});
const getApplicant = (applicantId) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `/resources/applicants/${applicantId}/one`;
    const headers = {
        Accept: "application/json",
        "X-App-Token": sumsubToken,
    };
    config.method = "GET";
    config.url = url;
    config.headers = headers;
    config.responseType = "json";
    try {
        const response = yield (0, axios_1.default)(config);
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
});
exports.getApplicant = getApplicant;
const getAccessToken = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `/resources/accessTokens?userId=${userId}&levelName=basic-kyc-level&ttlInSecs=2000`;
    const headers = {
        Accept: "application/json",
        "X-App-Token": sumsubToken,
    };
    config.method = "POST";
    config.url = url;
    config.headers = headers;
    config.responseType = "json";
    try {
        const response = yield (0, axios_1.default)(config);
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
});
exports.getAccessToken = getAccessToken;
const getApplicantVerifStep = (applicantId) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `/resources/applicants/${applicantId}/requiredIdDocsStatus`;
    const headers = {
        Accept: "application/json",
        "X-App-Token": sumsubToken,
    };
    config.method = "GET";
    config.url = url;
    config.headers = headers;
    config.responseType = "json";
    try {
        const response = yield (0, axios_1.default)(config);
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
});
exports.getApplicantVerifStep = getApplicantVerifStep;
const getImage = (inspectionId, imageId) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `/resources/inspections/${inspectionId}/resources/${imageId}`;
    console.log(inspectionId, imageId);
    const headers = {
        Accept: "application/json",
        "X-App-Token": sumsubToken,
    };
    config.method = "GET";
    config.url = url;
    config.headers = headers;
    config.responseType = "arraybuffer";
    const response = yield (0, axios_1.default)(config);
    console.log(response.headers);
    const buffer = Buffer.from(response.data, "binary");
    const sizeInBytes = buffer.length;
    console.log(sizeInBytes);
    // const blob = new Blob([response.data]);
    return response.data;
});
exports.getImage = getImage;
const getImageHeaders = (inspectionId, imageId) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `/resources/inspections/${inspectionId}/resources/${imageId}`;
    var ts = Math.floor(Date.now() / 1000) + 250;
    const signature = crypto_1.default.createHmac("sha256", sumsubSecret);
    signature.update(ts + "GET" + url);
    const result = {
        ts: ts,
        sig: signature.digest("hex"),
        url: SUMSUB_BASE_URL + url,
        token: sumsubToken,
    };
    return result;
});
exports.getImageHeaders = getImageHeaders;
//# sourceMappingURL=sumsub.js.map