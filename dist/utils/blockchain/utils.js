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
exports.executeMetaTransaction = void 0;
const AbiForwarder_json_1 = __importDefault(require("./AbiForwarder.json"));
const localKeys_1 = require("./localKeys");
const venly_1 = require("../venly");
const FORWARDER_CONTRACT_ADDRESS = process.env.FORWARDER_CONTRACT_ADDRESS;
const EIP712Domain = [
    { name: "name", type: "string" },
    { name: "version", type: "string" },
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
];
const types = {
    EIP712Domain,
    ForwardRequest: [
        {
            name: "from",
            type: "address",
        },
        {
            name: "to",
            type: "address",
        },
        {
            name: "value",
            type: "uint256",
        },
        {
            name: "gas",
            type: "uint256",
        },
        {
            name: "nonce",
            type: "uint256",
        },
        {
            name: "data",
            type: "bytes",
        },
    ],
};
const domain = {
    name: "Forwarder",
    version: 1,
    chainId: "5",
    verifyingContract: FORWARDER_CONTRACT_ADDRESS,
};
function executeMetaTransaction(abi, params, from, to, walletId) {
    return __awaiter(this, void 0, void 0, function* () {
        const forwardContract = new localKeys_1.web3.eth.Contract(AbiForwarder_json_1.default, FORWARDER_CONTRACT_ADDRESS);
        const encodedFunctionData = localKeys_1.web3.eth.abi.encodeFunctionCall(abi, params);
        const req = {
            from,
            to,
            value: "0",
            gas: "100000",
            nonce: yield forwardContract.methods.getNonce(from).call({ from: from }),
            data: encodedFunctionData,
        };
        try {
            const signature = yield (0, venly_1.getSignature)(walletId, req);
            console.log("execution signature", signature);
            yield forwardContract.methods
                .execute(req, signature)
                .send({ from: localKeys_1.adminAccount.address });
        }
        catch (error) {
            console.log(error);
            throw new Error("Execution failed" + error);
        }
    });
}
exports.executeMetaTransaction = executeMetaTransaction;
/**
 * {
      name: "myMethod",
      type: "function",
      inputs: [
        {
          type: "uint256",
          name: "myNumber",
        },
        {
          type: "string",
          name: "myString",
        },
      ],
    },
    ["2345675643", "Hello!%"]
 */
//# sourceMappingURL=utils.js.map