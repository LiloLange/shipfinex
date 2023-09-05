"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipnSchema = exports.depositSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.depositSchema = joi_1.default.object({
    amount: joi_1.default.number().required().min(1).messages({
        "any.required": "Please provide amount.",
        "number.base": "Provide valid number",
        "number.min": "Invest amount must be at least 1",
    }),
});
exports.ipnSchema = joi_1.default.object({
    userId: joi_1.default.string().required().messages({
        "any.required": "Please provide userId.",
    }),
    amount: joi_1.default.number().required().min(1).messages({
        "any.required": "Please provide amount.",
        "number.base": "Provide valid number",
        "number.min": "Invest amount must be at least 1",
    }),
});
//# sourceMappingURL=index.js.map