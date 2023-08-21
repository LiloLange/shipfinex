"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const kycSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    streetAddress: {
        type: String,
        required: true,
    },
    streetAddress2: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    postalCode: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    kycDocument: {
        type: Object,
        required: false,
        kycType: {
            type: Boolean,
            default: true,
        },
        faceMatch: {
            image: {
                type: String,
                required: true,
            },
            aiResult: {
                type: Number,
                default: 0,
            },
            mannualResult: {
                type: Number,
                default: 0,
            },
        },
        liveTest: {
            video: {
                type: String,
                required: true,
            },
            aiResult: {
                type: Number,
                default: 0,
            },
            mannualResult: {
                type: Number,
                default: 0,
            },
        },
        pancard: {
            name: {
                type: String,
                required: true,
            },
            pancardNumber: {
                type: String,
                required: true,
            },
            birthday: {
                type: Date,
                required: true,
            },
            image: {
                type: String,
                required: true,
            },
        },
        passport: {
            name: {
                type: String,
                required: true,
            },
            passportNumber: {
                type: String,
                required: true,
            },
            birthday: {
                type: Date,
                required: true,
            },
            nationality: {
                type: String,
                required: true,
            },
            issueDate: {
                type: Date,
                required: true,
            },
            expiryDate: {
                type: Date,
                required: true,
            },
            gender: {
                type: Boolean,
                required: true,
            },
            frontImage: {
                type: String,
                required: true,
            },
            backImage: {
                type: String,
                required: true,
            },
        },
    },
    status: {
        changedBy: {
            type: String,
            default: "Admin",
        },
        kycStatus: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
        auditStatus: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending",
        },
    },
    applicationName: {
        type: String,
        default: "KYC",
    },
    createdAt: {
        type: Date,
        required: true,
    },
    comments: [
        {
            action: {
                type: String,
                required: true,
            },
            actionDate: {
                type: Date,
                default: Date.now(),
            },
        },
    ],
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
});
const KYC = mongoose_1.default.model("kyc", kycSchema);
exports.default = KYC;
//# sourceMappingURL=kycs.js.map