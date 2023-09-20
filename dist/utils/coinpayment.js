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
exports.createTransaction = void 0;
const coinpayments_1 = __importDefault(require("coinpayments"));
const config_1 = __importDefault(require("../config"));
const credential = {
    key: config_1.default.coinpaymentKey,
    secret: config_1.default.coinpaymentSecret,
    sandbox: true,
};
const createTransaction = (ipn_url, email, currency1, currency2, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new coinpayments_1.default(credential);
    try {
        const response = yield client.createTransaction({
            amount: amount,
            currency1: currency1,
            currency2: currency2,
            buyer_email: email,
            ipn_url,
        });
        return response;
    }
    catch (error) {
        console.log(error);
    }
});
exports.createTransaction = createTransaction;
//# sourceMappingURL=coinpayment.js.map