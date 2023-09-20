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
const AbiMUSD_json_1 = __importDefault(require("./AbiMUSD.json"));
const localKeys_1 = require("./localKeys");
const utils_1 = require("./utils");
const MUSD_CONTRACT_ADDRESS = process.env.MUSD_CONTRACT_ADDRESS;
const ADMIN_WALLET_VENLY_ID = process.env.ADMIN_WALLET_VENLY_ID;
const musdContract = new localKeys_1.web3.eth.Contract(AbiMUSD_json_1.default, MUSD_CONTRACT_ADDRESS);
const mint = (to, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("mint-->");
        yield (0, utils_1.executeMetaTransaction)({
            name: "mint",
            type: "function",
            inputs: [
                {
                    internalType: "address",
                    name: "_to",
                    type: "address",
                },
                {
                    internalType: "uint256",
                    name: "_amount",
                    type: "uint256",
                },
            ],
        }, [to, localKeys_1.web3.utils.toWei(localKeys_1.web3.utils.toBN(amount), "ether").toString()], localKeys_1.adminAccount.address, MUSD_CONTRACT_ADDRESS, ADMIN_WALLET_VENLY_ID);
    }
    catch (err) {
        console.log("mint error->", err);
    }
});
exports.mint = mint;
const burn = (from, amount, type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("burn-->");
        yield (0, utils_1.executeMetaTransaction)({
            name: "burn",
            type: "function",
            inputs: [
                {
                    internalType: "address",
                    name: "_from",
                    type: "address",
                },
                {
                    internalType: "uint256",
                    name: "_amount",
                    type: "uint256",
                },
            ],
        }, [from, localKeys_1.web3.utils.toWei(localKeys_1.web3.utils.toBN(amount), "ether").toString()], localKeys_1.adminAccount.address, MUSD_CONTRACT_ADDRESS, ADMIN_WALLET_VENLY_ID);
    }
    catch (err) {
        console.log(err);
    }
});
exports.burn = burn;
const getBalance = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("getBalance-->");
        const totalBalance = yield musdContract.methods
            .balanceOf(address)
            .call({ from: localKeys_1.adminAccount.address });
        return totalBalance;
    }
    catch (error) {
        console.log(error);
    }
});
exports.getBalance = getBalance;
//# sourceMappingURL=musd.js.map