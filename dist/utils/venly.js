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
exports.executeTransaction = exports.getAccessToken = exports.createWallet = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const qs_1 = __importDefault(require("qs"));
const VENLY_AUTH_BASE_URL = "https://login-staging.venly.io";
const VENLY_WALLET_BASE_URL = "https://api-wallet-sandbox.venly.io";
let config = {};
// const createSignature = async (config) => {
//   console.log("Creating a signature for the request...");
//   var ts = Math.floor(Date.now() / 1000) + 50;
//   const signature = crypto.createHmac("sha256", sumsubSecret);
//   signature.update(ts + config.method.toUpperCase() + config.url);
//   // if (config.data instanceof FormData) {
//   //   signature.update(config.data.getBuffer());
//   // } else if (config.data) {
//   //   signature.update(config.data);
//   // }
//   config.headers["X-App-Access-Ts"] = ts;
//   config.headers["X-App-Access-Sig"] = signature.digest("hex");
//   config.timeout = 6000;
//   return config;
// };
// axios.interceptors.request.use(createSignature, function (error) {
//   return Promise.reject(error);
// });
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
const executeTransaction = (walletId, to, functionName, inputs) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield getAccessToken();
    config.baseURL = VENLY_WALLET_BASE_URL;
    const url = `/api/transactions/execute`;
    const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
    };
    const data = {
        pincode: "177438",
        transactionRequest: {
            type: "CONTRACT_EXECUTION",
            walletId,
            to,
            alias: null,
            secretType: "ETHEREUM",
            functionName,
            value: 0,
            inputs,
        },
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
exports.executeTransaction = executeTransaction;
//# sourceMappingURL=venly.js.map