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
exports.getAccessToken = exports.createWallet = exports.getBalance = exports.burn = exports.mint = void 0;
const axios_1 = __importDefault(require("axios"));
const web3_1 = __importDefault(require("web3"));
const hdwallet_provider_1 = __importDefault(require("@truffle/hdwallet-provider"));
const MRN_json_1 = __importDefault(require("./MRN.json"));
const config_1 = __importDefault(require("../config"));
const qs_1 = __importDefault(require("qs"));
const sumsubSecret = config_1.default.sumsubSecret;
const sumsubToken = config_1.default.sumsubToken;
const VENLY_AUTH_BASE_URL = "https://login-staging.venly.io";
const VENLY_WALLET_BASE_URL = "https://api-wallet-sandbox.venly.io";
const adminPrivateKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
const MRN_CONTRACT_ADDRESS = process.env.MRN_CONTRACT_ADDRESS;
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
const localKeyProvider = new hdwallet_provider_1.default({
    privateKeys: [adminPrivateKey],
    providerOrUrl: "https://eth-goerli.g.alchemy.com/v2/KqDagOiXKFQ8T_QzPNpKBk1Yn-3Zgtgl",
});
const web3 = new web3_1.default(localKeyProvider);
const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
const mrnContract = new web3.eth.Contract(MRN_json_1.default, MRN_CONTRACT_ADDRESS);
const mint = (to, amount, type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mrnContract.methods
            .mint(to, web3.utils.toWei(web3.utils.toBN(amount), "ether"), type)
            .send({ from: adminAccount.address });
    }
    catch (err) {
        console.log(err);
    }
});
exports.mint = mint;
const burn = (from, amount, type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mrnContract.methods
            .burn(from, web3.utils.toWei(web3.utils.toBN(amount), "ether"), type)
            .send({ from: adminAccount.address })
            .on("transactionHash", (hash) => { })
            .on("confirmation", (confirmationNumber, recepit) => { })
            .on("error", (error) => { });
    }
    catch (err) {
        console.log(err);
    }
});
exports.burn = burn;
const getBalance = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const totalBalance = yield mrnContract.methods
        .balanceOf(address)
        .call({ from: adminAccount.address });
    const cryptoBalance = yield mrnContract.methods
        .cryptoBalances(address)
        .call({ from: adminAccount.address });
    const stripeBalance = yield mrnContract.methods
        .stripeBalances(address)
        .call({ from: adminAccount.address });
    return { totalBalance, cryptoBalance, stripeBalance };
});
exports.getBalance = getBalance;
//# sourceMappingURL=venly.js.map