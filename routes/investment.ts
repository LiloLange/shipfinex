import { Request, ResponseToolkit } from "@hapi/hapi";
import fs from "fs";
import Investment from "../models/investments";
import User from "../models/users";
import config from "../config";

import { investSchema, getInvestmentSchema } from "../validation/investment";

import { investSwagger, getInvestmentSwagger } from "../swagger/investment";
import mongoose, { Schema } from "mongoose";

const options = { abortEarly: false, stripUnknown: true };
export let investmentRoute = [
  {
    method: "POST",
    path: "/",
    options: {
      auth: "jwt",
      description: "Investment on project",
      plugins: investSwagger,
      tags: ["api", "user"],
      validate: {
        payload: investSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return {
              message: d.message,
              path: d.path,
            };
          });
          return h.response(details).code(400).takeover();
        },
      },
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      try {
        const payload = {
          userId: request.auth.credentials.userId,
          projectId: request.payload["projectId"],
          amount: request.payload["amount"],
        };
        console.log(payload);
        const newInvest = new Investment(payload);
        const result = await newInvest.save();
        return response.response({ msg: "Invest successfully" }).code(201);
      } catch (error) {
        console.log(error);
      }
    },
  },
  {
    method: "GET",
    path: "/",
    options: {
      auth: "jwt",
      description:
        "Get investment with pagination, userId, projectId, status, page",
      plugins: getInvestmentSwagger,
      tags: ["api", "kyc"],
      validate: {
        query: getInvestmentSchema,
        options,
        failAction: (request, h, error) => {
          const details = error.details.map((d) => {
            return {
              message: d.message,
              path: d.path,
            };
          });
          return h.response(details).code(400).takeover();
        },
      },
      handler: async (request: Request, response: ResponseToolkit) => {
        const userId = request.auth.credentials.userId;
        const user = await User.findById(userId);
        if (user.role === "admin") {
          let { status, page } = request.query;
          const query = {};
          console.log(page);
          if (status !== undefined) query["status"] = status;
          if (!page) page = 1;
          const total = await Investment.countDocuments(query);
          const totalAmount: Array<Object> = await Investment.aggregate([
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$amount" },
              },
            },
          ]);
          const result = await Investment.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * 10)
            .limit(10);
          return {
            total,
            totalAmount: totalAmount[0]["totalAmount"],
            data: result,
            offset: page * 10,
          };
        }
        if (user.role === "investor") {
          let { status, page } = request.query;
          const query = { userId: request.auth.credentials.userId };
          if (status !== undefined) query["status"] = status;
          if (!page) page = 1;
          const total = await Investment.countDocuments(query);
          const objectId = new mongoose.Types.ObjectId(
            request.auth.credentials.userId as string
          );
          const totalAmount = await Investment.aggregate([
            {
              $match: {
                userId: objectId,
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$amount" },
              },
            },
          ]);
          const result = await Investment.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * 25)
            .limit(25);
          console.log(result);
          return { total, totalAmount, data: result, offset: page * 25 };
        }
        if (user.role === "prowner") {
          let { status, page } = request.query;
          if (!page) page = 1;
          let pipeline = [];
          const tdata = await Investment.aggregate([
            {
              $lookup: {
                from: "projects",
                localField: "projectId",
                foreignField: "_id",
                as: "project",
              },
            },
            {
              $unwind: "$project",
            },
          ]);
          console.log(tdata);
          const lookup = {
            $lookup: {
              from: "projects",
              localField: "projectId",
              foreignField: "_id",
              as: "project",
            },
          };
          const unwind = {
            $unwind: "$project",
          };
          let match;
          const objectId = new mongoose.Types.ObjectId(
            request.auth.credentials.userId as string
          );
          console.log(objectId);
          if (status) {
            match = {
              $match: {
                "project.projectOwner": objectId,
                status: status,
              },
            };
          } else {
            match = {
              $match: {
                "project.projectOwner": objectId,
              },
            };
          }
          const group1 = {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          };
          const group2 = {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" },
            },
          };
          const sort = {
            $sort: {
              createdAt: -1,
            },
          };
          const skip = {
            $skip: (page - 1) * 25,
          };
          const limit = {
            $limit: 25,
          };
          pipeline.push(lookup, unwind, match, group1);
          const total = await Investment.aggregate(pipeline);
          console.log(total);
          pipeline.splice(3, 1);
          pipeline.push(group2);
          const totalAmount = await Investment.aggregate(pipeline);
          pipeline.splice(3, 1);
          pipeline.push(sort, skip, limit);
          console.log(pipeline);
          const result = await Investment.aggregate(pipeline);
          console.log(result);
          return {
            total: total[0]["count"],
            totalAmount: totalAmount[0]["totalAmount"],
            data: result,
            offset: page * 25,
          };
        }
        return response
          .response({ msg: "You have no permission to access." })
          .code(403);
      },
    },
  },
  // {
  //   method: "GET",
  //   path: "/{userId}",
  //   options: {
  //     auth: "jwt",
  //     description: "Get signle user's information",
  //     plugins: getSingleUserSwagger,
  //     tags: ["api", "user"],
  //     handler: async (request: Request, response: ResponseToolkit) => {
  //       const userId = request.auth.credentials.userId;
  //       const authUser = await User.findById(userId);
  //       if (authUser.role === "admin") {
  //         const user = await User.findById(request.params.userId);
  //         if (user) return user;
  //         return response
  //           .response({ msg: "Cannot find the specific user's information." })
  //           .code(400);
  //       }
  //       return response
  //         .response({ msg: "You have no permission to access." })
  //         .code(403);
  //     },
  //   },
  // },
  // {
  //   method: "PUT",
  //   path: "/{userId}",
  //   options: {
  //     auth: "jwt",
  //     description: "Get single user's information",
  //     plugins: getSingleUserSwagger,
  //     tags: ["api", "user"],
  //     validate: {
  //       payload: userUpdateSchema,
  //       options,
  //       failAction: (request, h, error) => {
  //         const details = error.details.map((d) => {
  //           return {
  //             message: d.message,
  //             path: d.path,
  //           };
  //         });
  //         return h.response(details).code(400).takeover();
  //       },
  //     },
  //     handler: async (request: Request, response: ResponseToolkit) => {
  //       const payload = request.payload as UpdateUserPayload;
  //       if (payload.password) {
  //         const hash = await bcrypt.hash(payload.password, 10);
  //         payload.password = hash;
  //       }
  //       const userId = request.auth.credentials.userId;
  //       const authUser = await User.findById(userId);
  //       if (authUser.role === "admin" || request.params.userId === userId) {
  //         const user = await User.findOneAndUpdate(
  //           { _id: request.params.userId },
  //           { $set: payload },
  //           { new: true }
  //         );
  //         return user;
  //       }
  //       return response.response({ msg: "Cannot update" }).code(400);
  //     },
  //   },
  // },
];
