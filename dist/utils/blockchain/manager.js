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
exports.createNewProject = void 0;
const web3_1 = __importDefault(require("web3"));
const hdwallet_provider_1 = __importDefault(require("@truffle/hdwallet-provider"));
const Manager_json_1 = __importDefault(require("./Manager.json"));
const adminPrivateKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
const MUSD_CONTRACT_ADDRESS = process.env.MUSD_CONTRACT_ADDRESS;
const MANAGER_CONTRACT_ADDRESS = process.env.MANAGER_CONTRACT_ADDRESS;
const localKeyProvider = new hdwallet_provider_1.default({
    privateKeys: [adminPrivateKey],
    providerOrUrl: "https://eth-goerli.g.alchemy.com/v2/KqDagOiXKFQ8T_QzPNpKBk1Yn-3Zgtgl",
});
const createNewProject = (projectId, tokenName, tokenSymbol, supply, decimals, price, projectOwner) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const web3 = new web3_1.default(localKeyProvider);
        const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
        const managerContract = new web3.eth.Contract(Manager_json_1.default, MANAGER_CONTRACT_ADDRESS);
        yield managerContract.methods
            .createNewProject(projectId, tokenName, tokenSymbol, web3.utils.toWei(web3.utils.toBN(supply), "ether").toString(), decimals, web3.utils.toWei(web3.utils.toBN(price), "ether").toString(), projectOwner)
            .send({ from: adminAccount.address });
        const projectContract = yield managerContract.methods
            .projects(projectId)
            .call({ from: adminAccount.address });
        return { success: true, contract: projectContract };
    }
    catch (err) {
        console.log(err);
        return { success: false };
    }
});
exports.createNewProject = createNewProject;
//# sourceMappingURL=manager.js.map