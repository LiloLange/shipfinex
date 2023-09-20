"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoute = void 0;
const chat_1 = require("../swagger/chat");
const users_1 = __importDefault(require("../models/users"));
const chat_2 = __importDefault(require("../models/chat"));
const options = { abortEarly: false, stripUnknown: true };
exports.chatRoute = [
    {
        method: "GET",
        path: "/users",
        options: {
            // auth: "jwt",
            description: "Get all chat user.",
            plugins: chat_1.getAllChatUserSwagger,
            tags: ["api", "chat"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const users = yield users_1.default.find({ role: "investor" });
                return response.response({ users });
            }),
        },
    },
    {
        method: "POST",
        path: "/insert",
        options: {
            // auth: "jwt",
            description: "Get all chat user.",
            plugins: chat_1.getAllChatUserSwagger,
            tags: ["api", "chat"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const admin = yield users_1.default.findOne({ role: "admin" });
                console.log("chat sent", request.payload);
                let savedData = Object.assign({}, request.payload["chat"]);
                if (savedData["from"] === "admin")
                    savedData["from"] = admin.email;
                if (savedData["to"] === "admin")
                    savedData["to"] = admin.email;
                const newChat = new chat_2.default(savedData);
                yield newChat.save();
                return response.response(newChat);
            }),
        },
    },
    {
        method: "POST",
        path: "/filter",
        options: {
            // auth: "jwt",
            description: "Get all chat user.",
            plugins: chat_1.getAllChatUserSwagger,
            tags: ["api", "chat"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const chatList = yield chat_2.default.find({
                    $or: [
                        { from: request.payload["user"] },
                        { to: request.payload["user"] },
                    ],
                });
                return chatList;
            }),
        },
    },
];
//# sourceMappingURL=chat.js.map