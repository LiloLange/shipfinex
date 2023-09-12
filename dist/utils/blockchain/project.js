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
exports.invest = exports.deposit = exports.withdraw = exports.claim = exports.getBalance = exports.getShipTokenPrice = exports.getClaimedRewards = exports.getClaimableAmount = exports.getGivenRewards = exports.getWithdrawal = exports.getFundraising = exports.getShipTokenAddress = void 0;
const web3_1 = __importDefault(require("web3"));
const hdwallet_provider_1 = __importDefault(require("@truffle/hdwallet-provider"));
const venly_1 = require("../venly");
const users_1 = __importDefault(require("../../models/users"));
const AbiManager_json_1 = __importDefault(require("./AbiManager.json"));
const AbiProject_json_1 = __importDefault(require("./AbiProject.json"));
const AbiShipToken_json_1 = __importDefault(require("./AbiShipToken.json"));
const adminPrivateKey = process.env.ADMIN_WALLET_PRIVATE_KEY;
const MUSD_CONTRACT_ADDRESS = process.env.MUSD_CONTRACT_ADDRESS;
const MANAGER_CONTRACT_ADDRESS = process.env.MANAGER_CONTRACT_ADDRESS;
const localKeyProvider = new hdwallet_provider_1.default({
    privateKeys: [adminPrivateKey],
    providerOrUrl: "https://eth-goerli.g.alchemy.com/v2/KqDagOiXKFQ8T_QzPNpKBk1Yn-3Zgtgl",
});
const getShipTokenAddress = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const web3 = new web3_1.default(localKeyProvider);
        const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
        const managerContract = new web3.eth.Contract(AbiManager_json_1.default, MANAGER_CONTRACT_ADDRESS);
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: adminAccount.address });
        const projectContract = new web3.eth.Contract(AbiProject_json_1.default, projectAddress);
        const shipTokenAddress = yield projectContract.methods
            .shipToken()
            .call({ from: adminAccount.address });
        return shipTokenAddress;
    }
    catch (error) {
        console.log(error);
        return 0;
    }
});
exports.getShipTokenAddress = getShipTokenAddress;
const getFundraising = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const web3 = new web3_1.default(localKeyProvider);
        const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
        const managerContract = new web3.eth.Contract(AbiManager_json_1.default, MANAGER_CONTRACT_ADDRESS);
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: adminAccount.address });
        const projectContract = new web3.eth.Contract(AbiProject_json_1.default, projectAddress);
        const result = yield projectContract.methods
            .fundraising()
            .call({ from: adminAccount.address });
        return web3.utils.fromWei(result, "ether").toString();
    }
    catch (error) {
        console.log(error);
        return 0;
    }
});
exports.getFundraising = getFundraising;
const getWithdrawal = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const web3 = new web3_1.default(localKeyProvider);
        const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
        const managerContract = new web3.eth.Contract(AbiManager_json_1.default, MANAGER_CONTRACT_ADDRESS);
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: adminAccount.address });
        const projectContract = new web3.eth.Contract(AbiProject_json_1.default, projectAddress);
        const result = yield projectContract.methods
            .withdrawal()
            .call({ from: adminAccount.address });
        return web3.utils.fromWei(result, "ether").toString();
    }
    catch (error) {
        console.log(error);
        return 0;
    }
});
exports.getWithdrawal = getWithdrawal;
const getGivenRewards = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const web3 = new web3_1.default(localKeyProvider);
        const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
        const managerContract = new web3.eth.Contract(AbiManager_json_1.default, MANAGER_CONTRACT_ADDRESS);
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: adminAccount.address });
        const projectContract = new web3.eth.Contract(AbiProject_json_1.default, projectAddress);
        const result = yield projectContract.methods
            .givenRewards()
            .call({ from: adminAccount.address });
        return web3.utils.fromWei(result, "ether").toString();
    }
    catch (error) {
        console.log(error);
        return 0;
    }
});
exports.getGivenRewards = getGivenRewards;
const getClaimableAmount = (projectId, investorAddress) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const web3 = new web3_1.default(localKeyProvider);
        const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
        const managerContract = new web3.eth.Contract(AbiManager_json_1.default, MANAGER_CONTRACT_ADDRESS);
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: adminAccount.address });
        const projectContract = new web3.eth.Contract(AbiProject_json_1.default, projectAddress);
        const result = yield projectContract.methods
            .claimableAmount(investorAddress)
            .call({ from: adminAccount.address });
        return web3.utils.fromWei(result, "ether").toString();
    }
    catch (error) {
        console.log(error);
        return 0;
    }
});
exports.getClaimableAmount = getClaimableAmount;
const getClaimedRewards = (projectId, investorAddress) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const web3 = new web3_1.default(localKeyProvider);
        const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
        const managerContract = new web3.eth.Contract(AbiManager_json_1.default, MANAGER_CONTRACT_ADDRESS);
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: adminAccount.address });
        const projectContract = new web3.eth.Contract(AbiProject_json_1.default, projectAddress);
        const result = yield projectContract.methods
            .claimed(investorAddress)
            .call({ from: adminAccount.address });
        return web3.utils.fromWei(result, "ether").toString();
    }
    catch (error) {
        console.log(error);
        return 0;
    }
});
exports.getClaimedRewards = getClaimedRewards;
const getShipTokenPrice = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const web3 = new web3_1.default(localKeyProvider);
        const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
        const managerContract = new web3.eth.Contract(AbiManager_json_1.default, MANAGER_CONTRACT_ADDRESS);
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: adminAccount.address });
        const projectContract = new web3.eth.Contract(AbiProject_json_1.default, projectAddress);
        const result = yield projectContract.methods
            .shipTokenPrice()
            .call({ from: adminAccount.address });
        return web3.utils.fromWei(result, "ether").toString();
    }
    catch (error) {
        console.log(error);
        return 0;
    }
});
exports.getShipTokenPrice = getShipTokenPrice;
const getBalance = (projectId, investorAddress) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const web3 = new web3_1.default(localKeyProvider);
        const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
        const shipTokenAddress = yield (0, exports.getShipTokenAddress)(projectId);
        const shipTokenContract = new web3.eth.Contract(AbiShipToken_json_1.default, shipTokenAddress);
        const result = yield shipTokenContract.methods
            .balanceOf(investorAddress)
            .call({ from: adminAccount.address });
        return web3.utils.fromWei(result, "ether").toString();
    }
    catch (error) {
        console.log(error);
        return 0;
    }
});
exports.getBalance = getBalance;
const claim = (projectId, accountId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const web3 = new web3_1.default(localKeyProvider);
        const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
        const managerContract = new web3.eth.Contract(AbiManager_json_1.default, MANAGER_CONTRACT_ADDRESS);
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: adminAccount.address });
        let inputs = [];
        const response = yield (0, venly_1.executeTransaction)(accountId, projectAddress, "claimRewards", inputs);
        if (!response || !response["success"])
            return false;
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
});
exports.claim = claim;
const withdraw = (projectId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const web3 = new web3_1.default(localKeyProvider);
        const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
        console.log(projectId);
        const managerContract = new web3.eth.Contract(AbiManager_json_1.default, MANAGER_CONTRACT_ADDRESS);
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: adminAccount.address });
        console.log("withdraw -->", projectAddress);
        const projectContract = new web3.eth.Contract(AbiProject_json_1.default, projectAddress);
        const fundraising = yield projectContract.methods
            .fundraising()
            .call({ from: adminAccount.address });
        const withdrawals = yield projectContract.methods
            .withdrawal()
            .call({ from: adminAccount.address });
        console.log("withdraw console -->", fundraising, withdrawals);
        yield projectContract.methods
            .withdraw(web3.utils.toBN(fundraising).sub(web3.utils.toBN(withdrawals)))
            .send({ from: adminAccount.address });
        return true;
    }
    catch (err) {
        console.log(err);
        return false;
    }
});
exports.withdraw = withdraw;
const deposit = (projectId, projectOwnerId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const web3 = new web3_1.default(localKeyProvider);
        const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
        const managerContract = new web3.eth.Contract(AbiManager_json_1.default, MANAGER_CONTRACT_ADDRESS);
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: adminAccount.address });
        console.log("project deposit -->", projectAddress);
        let inputs = [
            {
                type: "address",
                value: projectAddress,
            },
            {
                type: "uint256",
                value: web3.utils.toWei(web3.utils.toBN(amount), "ether").toString(),
            },
        ];
        const response = yield (0, venly_1.executeTransaction)(projectOwnerId, MUSD_CONTRACT_ADDRESS, "approve", inputs);
        if (!response || !response["success"])
            return false;
        inputs = [
            {
                type: "uint256",
                value: web3.utils.toWei(web3.utils.toBN(amount), "ether").toString(),
            },
        ];
        const depositResponse = yield (0, venly_1.executeTransaction)(projectOwnerId, projectAddress, "depositRewards", inputs);
        if (!depositResponse || !depositResponse["success"])
            return false;
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
});
exports.deposit = deposit;
const invest = (projectId, investorId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const web3 = new web3_1.default(localKeyProvider);
        const adminAccount = web3.eth.accounts.privateKeyToAccount(adminPrivateKey);
        const managerContract = new web3.eth.Contract(AbiManager_json_1.default, MANAGER_CONTRACT_ADDRESS);
        const projectAddress = yield managerContract.methods
            .projects(projectId)
            .call({ from: adminAccount.address });
        const user = yield users_1.default.findById(investorId);
        let inputs = [
            {
                type: "address",
                value: projectAddress,
            },
            {
                type: "uint256",
                value: web3.utils.toWei(web3.utils.toBN(amount), "ether").toString(),
            },
        ];
        const response = yield (0, venly_1.executeTransaction)(user.wallet.id, MUSD_CONTRACT_ADDRESS, "approve", inputs);
        if (response && response["success"] === true) {
            inputs = [
                {
                    type: "uint256",
                    value: web3.utils.toWei(web3.utils.toBN(amount), "ether").toString(),
                },
            ];
            const investResponse = yield (0, venly_1.executeTransaction)(user.wallet.id, projectAddress, "invest", inputs);
            return investResponse && investResponse["success"] === true;
        }
        return false;
    }
    catch (err) {
        console.log(err);
        return false;
    }
});
exports.invest = invest;
//# sourceMappingURL=project.js.map