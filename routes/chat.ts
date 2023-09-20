import { Request, ResponseToolkit } from "@hapi/hapi";

import { getAllChatUserSwagger } from "../swagger/chat";

import User from "../models/users";
import Chat from "../models/chat";

const options = { abortEarly: false, stripUnknown: true };
export let chatRoute = [
  {
    method: "GET",
    path: "/users",
    options: {
      // auth: "jwt",
      description: "Get all chat user.",
      plugins: getAllChatUserSwagger,
      tags: ["api", "chat"],
      handler: async (request: Request, response: ResponseToolkit) => {
        const users = await User.find({ role: "investor" });
        return response.response({ users });
      },
    },
  },
  {
    method: "POST",
    path: "/insert",
    options: {
      // auth: "jwt",
      description: "Get all chat user.",
      plugins: getAllChatUserSwagger,
      tags: ["api", "chat"],
      handler: async (request: Request, response: ResponseToolkit) => {
        const admin = await User.findOne({ role: "admin" });
        console.log("chat sent", request.payload);
        let savedData = Object.assign({}, request.payload["chat"]);
        if (savedData["from"] === "admin") savedData["from"] = admin.email;
        if (savedData["to"] === "admin") savedData["to"] = admin.email;

        const newChat = new Chat(savedData);
        await newChat.save();
        return response.response(newChat);
      },
    },
  },
  {
    method: "POST",
    path: "/filter",
    options: {
      // auth: "jwt",
      description: "Get all chat user.",
      plugins: getAllChatUserSwagger,
      tags: ["api", "chat"],
      handler: async (request: Request, response: ResponseToolkit) => {
        const chatList = await Chat.find({
          $or: [
            { from: request.payload["user"] },
            { to: request.payload["user"] },
          ],
        });
        return chatList;
      },
    },
  },
];
