import { Request, ResponseToolkit } from "@hapi/hapi";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import fs from "fs";

import User from "../models/users";
import config from "../config";
import {
  createUserSchema,
  loginUserSchema,
  otpSchema,
  userUpdateSchema,
  getAllUserSchema,
} from "../validation/user";

import {
  createUserSwagger,
  loginUserSwagger,
  otpSwagger,
  verifyEmailSwagger,
  currentUserSwagger,
  getAllUserSwawgger,
  getSingleUserSwagger,
  deleteSingleUserSwagger,
} from "../swagger/user";

import { UpdateUserPayload } from "../interfaces";

import GenerateOTP from "../utils/otp";
import sendMail from "../utils/sendMail";

const options = { abortEarly: false, stripUnknown: true };
export let userRoute = [
  {
    method: "POST",
    path: "/register",
    options: {
      description: "Register User",
      plugins: createUserSwagger,
      tags: ["api", "user"],
      validate: {
        payload: createUserSchema,
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
        const email = request.payload["email"];
        const user = await User.findOne({ email });
        if (user) {
          return response.response([ {message: "User already exists", path: ["email"]}]).code(409);
        }
        const newUser: any = new User(request.payload);
        const { password } = newUser;
        const hash = await bcrypt.hash(password, 10);
        newUser.password = hash;
        const result = await newUser.save();
        const token = Jwt.sign(
          { userId: result._id, email: result.email },
          config.jwtSecret,
          {
            expiresIn: "3m",
          }
        );
        const baseUrl = `${request.server.info.protocol}://${request.info.host}`;
        console.log(baseUrl);
        const content = `<div style="background-color: #f2f2f2; padding: 20px; border-radius: 10px;"><h1 style="font-size: 36px; color: #333; margin-bottom: 20px;">Hello</h1><p style="font-size: 18px; color: #666; margin-bottom: 20px;">Welcome To ShipFinex Homepage</p><p style="font-size: 18px; color: #666; margin-bottom: 40px;">This is your email verification link. Please click the button below to verify your email:</p><a href="${baseUrl}/api/v1/user/verify-email/${token}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 10px; font-size: 18px;">Verify Email</a></div>`;
        sendMail(result.email, content);

        return response
          .response({
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName,
          })
          .code(201);
        // return token;
      } catch (error) {
        return response.response(error).code(500);
      }
    },
  },
  {
    method: "POST",
    path: "/login",
    options: {
      description: "Login",
      plugins: loginUserSwagger,
      tags: ["api", "user"],
      validate: {
        payload: loginUserSchema,
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
      const user = await User.findOne({ email: request.payload["email"] });
      if (user) {
        const hpass = await bcrypt.compare(
          request.payload["password"],
          user.password
        );

        if (hpass) {
          if (user.emailVerified) {
            const otp = GenerateOTP();
            user.otp = otp;
            const result = await user.save();
            const content = `<div style="background-color: #f2f2f2; padding: 20px; border-radius: 10px;"><h1 style="font-size: 36px; color: #333; margin-bottom: 20px;">Hello</h1><p style="font-size: 18px; color: #666; margin-bottom: 20px;">Welcome To ShipFinex Homepage</p><p style="font-size: 18px; color: #666; margin-bottom: 40px;">This is your OTP code :</p><button style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 10px; font-size: 18px;">${result.otp}</button></div>`;
            sendMail(result.email, content);
            return response.response({
              msg: "OTP Code has just sent to your email.",
              // otp: result.otp,
            });

            //Generate and send OTP
          } else {
            const token = Jwt.sign(
              { userId: user._id, email: user.email },
              config.jwtSecret,
              {
                expiresIn: "3m",
              }
            );
            // sendMail(user.email, token);
            const baseUrl = `${request.server.info.protocol}://${request.info.host}`;
            const content = `<div style="background-color: #f2f2f2; padding: 20px; border-radius: 10px;"><h1 style="font-size: 36px; color: #333; margin-bottom: 20px;">Hello</h1><p style="font-size: 18px; color: #666; margin-bottom: 20px;">Welcome To ShipFinex Homepage</p><p style="font-size: 18px; color: #666; margin-bottom: 40px;">This is your email verification link. Please click the button below to verify your email:</p><a href="${baseUrl}/api/v1/user/verify-email/${token}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 10px; font-size: 18px;">Verify Email</a></div>`;
            sendMail(user.email, content);
            return response.response({
              msg: "Email verification has sent to your email",
            });
          }
        } else {
          return response.response({ msg: "Password is incorrect." }).code(400);
        }
      }
      return response.response({ msg: "User not found." }).code(404);
    },
  },
  {
    method: "POST",
    path: "/verify-otp",
    options: {
      description: "Verify OTP",
      plugins: otpSwagger,
      tags: ["api", "user"],
      validate: {
        payload: otpSchema,
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
      const user = await User.findOne({ email: request.payload["email"] });
      if (user) {
        if (user.otp === request.payload["otp"]) {
          const token = Jwt.sign(
            { userId: user._id, email: user.email },
            config.jwtSecret,
            {
              expiresIn: "1h",
            }
          );
          const fullName = user.firstName + " " + user.lastName;
          return response
            .response({ token, fullName, role: user.role })
            .code(200);
        }
      }
      return response.response({ msg: "OTP Verification Failed." }).code(400);
    },
  },
  {
    method: "GET",
    path: "/verify-email/{token}",
    options: {
      description: "Verify Email",
      plugins: verifyEmailSwagger,
      tags: ["api", "user"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      const success = fs.readFileSync("./utils/emailVeriffSucess.txt");
      const failed = fs.readFileSync("./utils/emailVeriffFail.txt");
      const decoded = Jwt.decode(request.params.token);
      if (decoded === null) {
        return failed.toLocaleString();
      }
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        return failed.toLocaleString();
      }
      const user = await User.findById(decoded.userId);
      if (user) {
        user.emailVerified = true;
        await user.save();
        return success.toLocaleString();
      }
      return failed.toLocaleString();
    },
  },
  {
    method: "GET",
    path: "/current",
    options: {
      auth: "jwt",
      description: "Get current user by token",
      plugins: currentUserSwagger,
      tags: ["api", "user"],
      handler: async (request: Request, response: ResponseToolkit) => {
        const userId = request.auth.credentials.userId;
        const user = await User.findById(userId);
        const userData = {
          _id: userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          doneMilestones: user.doneMilestones,
          transactions: user.transactions,
        };
        return userData;
      },
    },
  },
  {
    method: "GET",
    path: "/all",
    options: {
      auth: "jwt",
      description:
        "Get all user with pagination, firstName, middleName, lastName, email, referralCode, role, emailVerified",
      plugins: getAllUserSwawgger,
      tags: ["api", "kyc"],
      validate: {
        query: getAllUserSchema,
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
          let {
            id,
            firstName,
            lastName,
            middleName,
            email,
            emailVerified,
            role,
            kycVerified,
            page,
          } = request.query;
          const query = {};
          if (id) query["_id"] = id;
          if (firstName) query["firstName"] = firstName;
          if (lastName) query["lastName"] = lastName;
          if (middleName) query["middleName"] = middleName;
          if (email) query["email"] = email;
          if (emailVerified !== undefined)
            query["emailVerified"] = emailVerified;
          if (role) query["role"] = role;
          if (kycVerified !== undefined) query["kycVerified"] = kycVerified;
          if (!page) page = 1;
          const result = User.find(query)
            .skip((page - 1) * 10)
            .limit(10);
          return result;
        }
        return response
          .response({ msg: "You have no permission to access." })
          .code(403);
      },
    },
  },
  {
    method: "GET",
    path: "/{userId}",
    options: {
      auth: "jwt",
      description: "Get signle user's information",
      plugins: getSingleUserSwagger,
      tags: ["api", "user"],
      handler: async (request: Request, response: ResponseToolkit) => {
        const userId = request.auth.credentials.userId;
        const authUser = await User.findById(userId);
        if (authUser.role === "admin") {
          const user = await User.findById(request.params.userId);
          if (user) return user;
          return response
            .response({ msg: "Cannot find the specific user's information." })
            .code(400);
        }
        return response
          .response({ msg: "You have no permission to access." })
          .code(403);
      },
    },
  },
  {
    method: "PUT",
    path: "/{userId}",
    options: {
      auth: "jwt",
      description: "Get single user's information",
      plugins: getSingleUserSwagger,
      tags: ["api", "user"],
      validate: {
        payload: userUpdateSchema,
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
        const payload = request.payload as UpdateUserPayload;
        if (payload.password) {
          const hash = await bcrypt.hash(payload.password, 10);
          payload.password = hash;
        }
        const userId = request.auth.credentials.userId;
        const authUser = await User.findById(userId);
        if (authUser.role === "admin" || request.params.userId === userId) {
          const user = await User.findOneAndUpdate(
            { _id: request.params.userId },
            { $set: payload },
            { new: true }
          );
          return user;
        }
        return response.response({ msg: "Cannot update" }).code(400);
      },
    },
  },
  {
    method: "DELETE",
    path: "/{userId}",
    options: {
      auth: "jwt",
      description: "Delete single user",
      plugins: deleteSingleUserSwagger,
      tags: ["api", "user"],
      handler: async (request: Request, response: ResponseToolkit) => {
        const userId = request.auth.credentials.userId;
        const authUser = await User.findById(userId);
        console.log(authUser.role);
        if (authUser.role === "admin" || request.params.userId === userId) {
          await User.findOneAndRemove({ _id: request.params.userId });
          return response.response({ msg: "User deleted successfully." });
        }
        return response.response({ msg: "Cannot delete user." }).code(400);
      },
    },
  },
  {
    method: "GET",
    path: "/milestone/:completeId",
    handler: (request: Request, response: ResponseToolkit) => {
      return "Hello World!";
    },
  },
];
