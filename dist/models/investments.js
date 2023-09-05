"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const investmentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    projectId: {
        type: Schema.Types.ObjectId,
        ref: "project",
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });
const Investment = mongoose_1.default.model("investment", investmentSchema);
exports.default = Investment;
//# sourceMappingURL=investments.js.map