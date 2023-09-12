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
exports.getTransaction = void 0;
const axios_1 = __importDefault(require("axios"));
const ETHERSCAN_API_URL = "https://api-goerli.etherscan.io";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
let config = {};
const getTransaction = (address, page) => __awaiter(void 0, void 0, void 0, function* () {
    config.baseURL = ETHERSCAN_API_URL;
    const url = `/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=25&sort=asc&apikey=${ETHERSCAN_API_KEY}`;
    const headers = {
        Accept: "application/json",
    };
    config.method = "GET";
    config.url = url;
    config.headers = headers;
    try {
        const response = yield (0, axios_1.default)(config);
        return response.data.result;
    }
    catch (error) {
        console.log(error);
    }
});
exports.getTransaction = getTransaction;
//# sourceMappingURL=etherscan.js.map