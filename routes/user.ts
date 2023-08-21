import { Request, ResponseToolkit } from "@hapi/hapi";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import User from "../models/users";
import config from "../config";
import {
  createUserSchema,
  loginUserSchema,
  otpSchema,
  userUpdateSchema,
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
// import sendMail from "../utils/sendMail";

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
          return response.response({ msg: "User already exists." }).code(409);
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
        // sendMail(result.email, token);
        // return response.response(result).code(201);
        return token;
      } catch (error) {
        throw error;
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

            return response.response({
              msg: "OTP Code has just sent to your email.",
              otp: result.otp,
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
            return response.response({
              msg: "Email Verification has just sent to your email.",
              token,
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
          return response.response({ msg: token }).code(200);
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
      const decoded = Jwt.decode(request.params.token);
      if (decoded === null) {
        return response
          .response({ msg: "Email Verification Failed" })
          .code(400);
      }
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        return response
          .response({ msg: "Email Verification Failed" })
          .code(400);
      }
      const user = await User.findById(decoded.userId);
      if (user) {
        user.emailVerified = true;
        await user.save();
        return response
          .response({ msg: "Email Verified Successfully." })
          .code(200);
      }
      return response.response({ msg: "Email Verification Failed" }).code(400);
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
      description: "Get all user information",
      plugins: getAllUserSwawgger,
      tags: ["api", "user"],
      handler: async (request: Request, response: ResponseToolkit) => {
        const userId = request.auth.credentials.userId;
        const user = await User.findById(userId);
        if (user.role === "admin") {
          const allUser = await User.find({ role: { $ne: "admin" } });
          return allUser;
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
