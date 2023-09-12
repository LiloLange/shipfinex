"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const withdrawSchema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: "project",
    },
    allowance: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
const WithDraw = mongoose_1.default.model("withDraw", withdrawSchema);
exports.default = WithDraw;
//# sourceMappingURL=withdraw.js.map