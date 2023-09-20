"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const chatSchema = new Schema({
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    deleted: {
        from: {
            type: Boolean,
            default: false,
        },
        to: {
            type: Boolean,
            default: false,
        },
    },
    time: {
        type: Date,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
});
const Chat = mongoose_1.default.model("chat", chatSchema);
exports.default = Chat;
//# sourceMappingURL=chat.js.map