"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userUpdateSchema = exports.otpSchema = exports.loginUserSchema = exports.createUserSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createUserSchema = joi_1.default.object({
    firstName: joi_1.default.string().required().messages({
        "any.required": "Please provide first name.",
    }),
    lastName: joi_1.default.string().required().messages({
        "any.required": "Please provide last name.",
    }),
    email: joi_1.default.string().email().required().messages({
        "any.required": "Please provide email",
        "string.email": "Please provide a valid email.",
    }),
    phoneNumber: joi_1.default.string().required().messages({
        "any.required": "Please provide phone number.",
    }),
    password: joi_1.default.string().required().min(6).messages({
        "any.required": "Please provide password.",
        "string.min": "Password must be at least 6 characters.",
    }),
    role: joi_1.default.string().required().messages({
        "any.required": "Please provide role.",
    }),
    referralCode: joi_1.default.string().optional(),
});
exports.loginUserSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "any.required": "Please provide email",
        "string.email": "Please provide a valid email.",
    }),
    password: joi_1.default.string().required().min(6).messages({
        "any.required": "Please provide password.",
        "string.min": "Password must be at least 6 characters.",
    }),
});
exports.otpSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "any.required": "Please provide email",
        "string.email": "Please provide a valid email.",
    }),
    otp: joi_1.default.string().required().min(6).max(6).messages({
        "any.required": "Please provide otp.",
        "string.min": "OTP must be exactly 6 characters.",
    }),
});
exports.userUpdateSchema = joi_1.default.object({
    firstName: joi_1.default.string().optional(),
    email: joi_1.default.string().email().messages({
        "string.email": "Please provide a valid email.",
    }),
    password: joi_1.default.string().min(6).messages({
        "string.min": "Password must be at least 6 characters.",
    }),
    lastName: joi_1.default.string().optional(),
    phoneNumber: joi_1.default.string().optional(),
    role: joi_1.default.string().optional(),
    referralCode: joi_1.default.string().optional(),
});
//# sourceMappingURL=index.js.map