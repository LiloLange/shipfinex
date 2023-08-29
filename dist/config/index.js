"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.default = {
    mongoURI: process.env.DATABASE_URI,
    jwtSecret: process.env.JWT_SECRET,
    apiVersion: process.env.API_VERSION,
    sumsubToken: process.env.SUMSUB_TOKEN,
    sumsubSecret: process.env.SUMSUB_SECRET,
};
//# sourceMappingURL=index.js.map