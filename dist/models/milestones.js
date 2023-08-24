"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const milestoneSchema = new Schema({
    action: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
});
const MileStone = mongoose_1.default.model("milestone", milestoneSchema);
exports.default = MileStone;
//# sourceMappingURL=milestones.js.map