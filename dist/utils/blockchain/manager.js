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
exports.createNewProject = exports.getProjectAddress = void 0;
const AbiManager_json_1 = __importDefault(require("./AbiManager.json"));
const utils_1 = require("./utils");
const localKeys_1 = require("./localKeys");
const MANAGER_CONTRACT_ADDRESS = process.env.MANAGER_CONTRACT_ADDRESS;
const FORWARDER_CONTRACT_ADDRESS = process.env.FORWARDER_CONTRACT_ADDRESS;
const ADMIN_WALLET_VENLY_ID = process.env.ADMIN_WALLET_VENLY_ID;
const managerContract = new localKeys_1.web3.eth.Contract(AbiManager_json_1.default, MANAGER_CONTRACT_ADDRESS);
const getProjectAddress = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("getProjectAddress-->");
        return yield managerContract.methods
            .projects(projectId)
            .call({ from: localKeys_1.adminAccount.address });
    }
    catch (error) {
        console.log(error);
        return { success: false };
    }
});
exports.getProjectAddress = getProjectAddress;
const createNewProject = (projectId, tokenName, tokenSymbol, supply, decimals, price, projectOwner) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("createNewProject-->");
        yield (0, utils_1.executeMetaTransaction)({
            name: "createNewProject",
            type: "function",
            inputs: [
                {
                    internalType: "string",
                    name: "projectId",
                    type: "string",
                },
                {
                    internalType: "string",
                    name: "tokenName",
                    type: "string",
                },
                {
                    internalType: "string",
                    name: "tokenSymbol",
                    type: "string",
                },
                {
                    internalType: "uint256",
                    name: "supply",
                    type: "uint256",
                },
                {
                    internalType: "uint8",
                    name: "decimals",
                    type: "uint8",
                },
                {
                    internalType: "uint256",
                    name: "_shipTokenPrice",
                    type: "uint256",
                },
                {
                    internalType: "address",
                    name: "_projectOwner",
                    type: "address",
                },
            ],
        }, [
            projectId,
            tokenName,
            tokenSymbol,
            localKeys_1.web3.utils.toWei(localKeys_1.web3.utils.toBN(supply), "ether").toString(),
            decimals,
            localKeys_1.web3.utils.toWei(localKeys_1.web3.utils.toBN(price), "ether").toString(),
            projectOwner,
        ], localKeys_1.adminAccount.address, FORWARDER_CONTRACT_ADDRESS, ADMIN_WALLET_VENLY_ID);
        const projectContract = yield managerContract.methods
            .projects(projectId)
            .call({ from: localKeys_1.adminAccount.address });
        return { success: true, contract: projectContract };
    }
    catch (err) {
        console.log(err);
        return { success: false };
    }
});
exports.createNewProject = createNewProject;
//# sourceMappingURL=manager.js.map