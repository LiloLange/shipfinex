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
exports.getAccessToken = exports.createWallet = exports.getSignature = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const qs_1 = __importDefault(require("qs"));
const VENLY_AUTH_BASE_URL = "https://login-staging.venly.io";
const VENLY_WALLET_BASE_URL = "https://api-wallet-sandbox.venly.io";
let config = {};
const getAccessToken = () => __awaiter(void 0, void 0, void 0, function* () {
    config.baseURL = VENLY_AUTH_BASE_URL;
    const url = `/auth/realms/Arkane/protocol/openid-connect/token`;
    const headers = {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
    };
    const data = {
        grant_type: "client_credentials",
        client_id: config_1.default.venlyclientId,
        client_secret: config_1.default.venlyclientSecret,
    };
    config.method = "POST";
    config.url = url;
    config.headers = headers;
    config.data = qs_1.default.stringify(data);
    try {
        const response = yield (0, axios_1.default)(config);
        return response.data.access_token;
    }
    catch (error) {
        // console.log(error);
    }
});
exports.getAccessToken = getAccessToken;
const getSignature = (walletId, reqData) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield getAccessToken();
    config.baseURL = VENLY_WALLET_BASE_URL;
    const url = `/api/signatures`;
    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
    };
    const data = {
        pincode: "177438",
        signatureRequest: {
            type: "EIP712",
            secretType: "ETHEREUM",
            walletId,
            data: reqData,
        },
    };
    console.log(reqData);
    config.method = "POST";
    config.url = url;
    config.headers = headers;
    config.responseType = "json";
    config.data = data;
    try {
        const response = yield (0, axios_1.default)(config);
        if (response.data.success) {
            return response.data.result.signature;
        }
        else {
            throw new Error("Failed to sign");
        }
    }
    catch (error) {
        console.log(error);
        throw new Error("Failed to sign");
    }
});
exports.getSignature = getSignature;
const createWallet = () => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield getAccessToken();
    config.baseURL = VENLY_WALLET_BASE_URL;
    const url = `/api/wallets`;
    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
    };
    const data = {
        pincode: "177438",
        secretType: "ETHEREUM",
        walletType: "WHITE_LABEL",
    };
    config.method = "POST";
    config.url = url;
    config.headers = headers;
    config.responseType = "json";
    config.data = data;
    try {
        const response = yield (0, axios_1.default)(config);
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
});
exports.createWallet = createWallet;
//# sourceMappingURL=venly.js.map