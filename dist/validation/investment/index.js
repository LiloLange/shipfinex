"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvestmentSchema = exports.investSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.investSchema = joi_1.default.object({
    projectId: joi_1.default.string().required().messages({
        "any.required": "Please provide projectId.",
    }),
    amount: joi_1.default.number().required().min(1).messages({
        "any.required": "Please provide amount.",
        "number.base": "Provide valid number",
        "number.min": "Invest amount must be at least 1",
    }),
});
exports.getInvestmentSchema = joi_1.default.object({
    status: joi_1.default.boolean().optional().description("Status of project"),
    page: joi_1.default.number().optional().description("Page number for pagination"),
});
//# sourceMappingURL=index.js.map