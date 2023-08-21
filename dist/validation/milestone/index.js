"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.milestoneUpdateSchema = exports.milestoneRegisterSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.milestoneRegisterSchema = joi_1.default.object({
    action: joi_1.default.string().required().messages({
        "any.required": "Please provide action description.",
    }),
    amount: joi_1.default.number().required().min(1).messages({
        "any.required": "Please provide amount.",
        "number.base": "Provide valid number",
        "number.min": "Milestone amount must be at least 1",
    }),
});
exports.milestoneUpdateSchema = joi_1.default.object({
    action: joi_1.default.string(),
    amount: joi_1.default.number().min(1).messages({
        "number.base": "Provide valid number",
        "number.min": "Milestone amount must be at least 1",
    }),
});
//# sourceMappingURL=index.js.map