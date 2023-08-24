"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    middleName: {
        type: String,
        default: "",
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    referralCode: {
        type: String,
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    kycVerified: {
        type: Boolean,
        default: false,
    },
    status: {
        type: Boolean,
        default: true,
    },
    role: {
        type: String,
        enum: ["investor", "prowner", "admin"],
    },
    doneMilestones: [
        {
            milestoneId: {
                type: Schema.Types.ObjectId,
                ref: "milestone",
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
    otp: {
        type: String,
    },
    transactions: [
        {
            transactionId: {
                type: Schema.Types.ObjectId,
                ref: "transaction",
            },
        },
    ],
});
const User = mongoose_1.default.model("user", userSchema);
exports.default = User;
//# sourceMappingURL=users.js.map