"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const kycSchema = new Schema({
    applicantId: {
        type: String,
        required: true,
    },
    inspectionId: {
        type: String,
        required: true,
    },
    correlationId: {
        type: String,
        required: true,
    },
    externalUserId: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    type: {
        type: String,
        required: true,
    },
    reviewStatus: {
        type: String,
        required: true,
    },
    createdAtMs: {
        type: Date,
        required: true,
    },
    reviewResult: {
        type: Object,
    },
    history: [
        {
            type: {
                type: String,
                required: true,
            },
            createdAt: {
                type: Date,
                required: true,
            },
        },
    ],
    status: {
        type: Number,
        default: 0,
    },
});
const KYC = mongoose_1.default.model("kyc", kycSchema);
exports.default = KYC;
//# sourceMappingURL=kycs.js.map