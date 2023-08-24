"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vesselUpdateSchema = exports.vesselRegisterSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.vesselRegisterSchema = joi_1.default.object({
    name: joi_1.default.string().required().messages({
        "any.required": "Please provide vessel name.",
    }),
    description: joi_1.default.string().required().messages({
        "any.required": "Please provide description.",
    }),
});
exports.vesselUpdateSchema = joi_1.default.object({
    name: joi_1.default.string().optional(),
    description: joi_1.default.string().optional(),
});
//# sourceMappingURL=index.js.map