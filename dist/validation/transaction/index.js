"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.getTransactionSchema = joi_1.default.object({
    page: joi_1.default.number().optional().description("Page number"),
});
//# sourceMappingURL=index.js.map