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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomer = void 0;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const createCustomer = (name, email, phone) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customer = yield stripe.customers.create({
            name: name,
            email: email,
            phone: phone,
        });
        console.log(customer);
        return customer;
    }
    catch (error) {
        console.log(error);
    }
});
exports.createCustomer = createCustomer;
//# sourceMappingURL=stripepayment.js.map