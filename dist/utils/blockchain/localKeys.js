"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAccount = exports.web3 = void 0;
const web3_1 = __importDefault(require("web3"));
const hdwallet_provider_1 = __importDefault(require("@truffle/hdwallet-provider"));
const adminPrivateKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
const localKeyProvider = new hdwallet_provider_1.default({
    privateKeys: [adminPrivateKey],
    providerOrUrl: "https://eth-goerli.g.alchemy.com/v2/KqDagOiXKFQ8T_QzPNpKBk1Yn-3Zgtgl",
});
const web3 = new web3_1.default(localKeyProvider);
exports.web3 = web3;
const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
exports.adminAccount = adminAccount;
//# sourceMappingURL=localKeys.js.map