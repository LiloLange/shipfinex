"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const projectSchema = new Schema({
    projectOwner: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    projectName: {
        type: String,
        required: true,
    },
    projectImage: {
        type: String,
        // required: true,
    },
    description: {
        type: String,
        required: true,
    },
    imoNumber: {
        type: Number,
        required: true,
    },
    vesselType: {
        type: String,
        required: true,
    },
    builtYear: {
        type: Date,
        required: true,
    },
    flag: {
        type: String,
        required: true,
    },
    estimatedEarning: {
        type: Number,
        required: true,
    },
    tokenized: {
        type: Boolean,
        default: false,
    },
    tokenization: {
        type: Object,
        required: false,
        tokenName: {
            type: String,
            required: true,
        },
        tokenSymbol: {
            type: String,
            required: true,
        },
        decimal: {
            type: Number,
            required: true,
        },
        tonnage: {
            type: Number,
            required: true,
        },
        assetValue: {
            type: Number,
            required: true,
        },
        tokenizingPercentage: {
            type: Number,
            required: true,
        },
        offeringPercentage: {
            type: Number,
            required: true,
        },
        minimumInvestment: {
            type: Number,
            required: true,
        },
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    isSTOLaunched: {
        type: Boolean,
        default: false,
    },
    status: {
        type: Boolean,
        default: true,
    },
    allowance: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });
const Project = mongoose_1.default.model("project", projectSchema);
exports.default = Project;
//# sourceMappingURL=projects.js.map