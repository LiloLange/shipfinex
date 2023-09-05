"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const depositSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    amount: {
        type: Number,
        required: true,
    },
    callback_url: {
        type: String,
        required: true,
    },
    expire: {
        type: Date,
        expires: 0,
    },
});
const Deposit = mongoose_1.default.model("deposit", depositSchema);
exports.default = Deposit;
//# sourceMappingURL=deposit.js.map