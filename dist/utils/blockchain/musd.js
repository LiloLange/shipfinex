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
exports.getBalance = exports.burn = exports.mint = void 0;
const web3_1 = __importDefault(require("web3"));
const hdwallet_provider_1 = __importDefault(require("@truffle/hdwallet-provider"));
const MUSD_json_1 = __importDefault(require("./MUSD.json"));
const adminPrivateKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
const MUSD_CONTRACT_ADDRESS = process.env.MUSD_CONTRACT_ADDRESS;
const localKeyProvider = new hdwallet_provider_1.default({
    privateKeys: [adminPrivateKey],
    providerOrUrl: "https://eth-goerli.g.alchemy.com/v2/KqDagOiXKFQ8T_QzPNpKBk1Yn-3Zgtgl",
});
const mint = (to, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const web3 = new web3_1.default(localKeyProvider);
        const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
        const musdContract = new web3.eth.Contract(MUSD_json_1.default, MUSD_CONTRACT_ADDRESS);
        yield musdContract.methods
            .mint(to, web3.utils.toWei(web3.utils.toBN(amount), "ether").toString())
            .send({ from: adminAccount.address });
    }
    catch (err) {
        console.log("mint error->", err);
    }
});
exports.mint = mint;
const burn = (from, amount, type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const web3 = new web3_1.default(localKeyProvider);
        const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
        const musdContract = new web3.eth.Contract(MUSD_json_1.default, MUSD_CONTRACT_ADDRESS);
        yield musdContract.methods
            .burn(from, web3.utils.toWei(web3.utils.toBN(amount), "ether").toString(), type)
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
    try {
        const web3 = new web3_1.default(localKeyProvider);
        const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
        const musdContract = new web3.eth.Contract(MUSD_json_1.default, MUSD_CONTRACT_ADDRESS);
        const totalBalance = yield musdContract.methods
            .balanceOf(address)
            .call({ from: adminAccount.address });
        return totalBalance;
    }
    catch (error) {
        console.log(error);
    }
});
exports.getBalance = getBalance;
//# sourceMappingURL=musd.js.map