import { Request, ResponseToolkit } from "@hapi/hapi";
import fs from "fs";

import KYC from "../models/kycs";
import {
  createKYCSwagger,
  getAllKYCSwagger,
  getSingleKYCSwagger,
  deleteKYCSwagger,
  updateKYCSwagger,
} from "../swagger/kyc";
import {
  getKYCSchema,
  kycCreateSchema,
  updateKYCSchema,
} from "../validation/kyc";
import getCurrentLoalTime from "../utils/getCurrentLoalTime";
import User from "../models/users";
import { UpdateKYCPayload } from "../interfaces";

const options = { abortEarly: false, stripUnknown: true };
export let kycRoute = [
  {
    method: "POST",
    path: "/register",
    config: {
      description: "Create KYC",
      auth: "jwt",
      plugins: createKYCSwagger,
      payload: {
        maxBytes: 10485760000,
        output: "stream",
        parse: true,
        allow: "multipart/form-data",
        multipart: { output: "stream" },
      },
      tags: ["api"],
      validate: {
        payload: kycCreateSchema,
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
        const payload = request.payload;

        const facefile = payload["faceImage"];
        const video = payload["video"];
        const frontImage = payload["frontImage"];
        let backImage = payload["backImage"];

        let savePathDatabase = "/static/uploads/kyc/";
        let folder = __dirname + `../../static/uploads/kyc/`;

        folder += request.auth.credentials.userId + "/";
        savePathDatabase += request.auth.credentials.userId + "/";
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder);
        }
        const timeString = getCurrentLoalTime()
          .toISOString()
          .replace(/:/g, ".");
        folder += timeString;
        savePathDatabase += timeString;

        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder);
        }

        const faceImageFileName =
          "/faceImage." + facefile["hapi"]["filename"].split(".")[1];
        const path1 = folder + faceImageFileName;
        const videoFileName =
          "/video." + video["hapi"]["filename"].split(".")[1];
        const path2 = folder + videoFileName;
        const frontImageFileName =
          "/frontImage." + frontImage["hapi"]["filename"].split(".")[1];
        const path3 = folder + frontImageFileName;

        let backImageFileName, path4;
        if (backImage) {
          backImageFileName =
            "/backImage." + frontImage["hapi"]["filename"].split(".")[1];
          path4 = folder + backImageFileName;
        }
        const req = Object.assign({}, request.payload);

        const comment = [];

        comment.push({
          action: "Register KYC",
          actionDate: getCurrentLoalTime(),
        });
        const savePayload = Object.assign({}, req, {
          userId: request.auth.credentials["userId"],
          createdAt: getCurrentLoalTime(),
          updatedAt: getCurrentLoalTime(),
          comments: comment,
        });
        savePayload["kycDocument"] = {};
        savePayload["kycDocument"]["faceMatch"] = {};
        savePayload["kycDocument"]["faceMatch"]["image"] =
          savePathDatabase + faceImageFileName;
        console.log(savePathDatabase + faceImageFileName);
        savePayload["kycDocument"]["faceMatch"]["aiResult"] = 0;
        savePayload["kycDocument"]["faceMatch"]["mannualResult"] = 0;

        savePayload["kycDocument"]["liveTest"] = {};
        savePayload["kycDocument"]["liveTest"]["video"] =
          savePathDatabase + videoFileName;
        savePayload["kycDocument"]["liveTest"]["aiResult"] = 0;
        savePayload["kycDocument"]["liveTest"]["mannualResult"] = 0;

        if (backImage) {
          savePayload["kycDocument"]["passport"] = {};
          savePayload["kycDocument"]["passport"]["frontImage"] =
            savePathDatabase + frontImageFileName;

          savePayload["kycDocument"]["passport"]["backImage"] =
            savePathDatabase + backImageFileName;
        } else {
          savePayload["kycDocument"]["pancard"] = {};
          savePayload["kycDocument"]["pancard"]["image"] =
            savePathDatabase + frontImageFileName;
        }
        const newKYC = new KYC(savePayload);
        try {
          const saveData = await newKYC.save();

          const saveFaceImage = fs.createWriteStream(path1);
          const saveVideo = fs.createWriteStream(path2);
          const saveFrontImage = fs.createWriteStream(path3);
          if (backImage) {
            const saveBackImage = fs.createWriteStream(path4);
            backImage.pipe(saveBackImage);
          }
          console.log(path1);
          facefile.pipe(saveFaceImage);
          video.pipe(saveVideo);
          frontImage.pipe(saveFrontImage);
          return response.response(saveData).code(201);
        } catch (error) {
          console.log(error);
        }
      },
    },
  },
  {
    method: "GET",
    path: "/all",
    options: {
      auth: "jwt",
      description: "Get all KYC with pagination, status and role",
      plugins: getAllKYCSwagger,
      tags: ["api", "kyc"],
      validate: {
        query: getKYCSchema,
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
        const authUser = await User.findById(request.auth.credentials.userId);

        if (authUser.role !== "admin")
          return response.response({ msg: "Permission Error" }).code(403);
        let { status, user, page } = request.query;
        let result;
        const query = {
          "user.role": user,
        };
        if (status) {
          query["status.kycStatus"] = status;
        }
        if (page) {
          page = parseInt(page);
        } else page = 1;
        if (user) {
          const pipeline = [
            {
              $match: { userId: { $ne: null } },
            },
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $match: query,
            },
            {
              $project: {
                user: 0,
              },
            },
            {
              $skip: (page - 1) * 10,
            },
            {
              $limit: 10,
            },
          ];

          result = await KYC.aggregate(pipeline);
        } else {
          result = await KYC.find(query)
            .skip((page - 1) * 10)
            .limit(10);
        }
        return result;
      },
    },
  },
  {
    method: "GET",
    path: "/{kycId}",
    options: {
      auth: "jwt",
      description: "Get an KYC by id",
      plugins: getSingleKYCSwagger,
      tags: ["api", "kyc"],
      handler: async (request: Request, response: ResponseToolkit) => {
        const user = await User.findById(request.auth.credentials.userId);
        const result = await KYC.findById(request.params.kycId);

        if (result) {
          if (user.role === "admin" || user._id === result.userId)
            return response.response(result).code(200);
          return response.response({ msg: "Permission Error" }).code(403);
        }
        return response.response({ msg: "KYC not found." }).code(404);
      },
    },
  },
  {
    method: "PUT",
    path: "/{kycId}",
    options: {
      auth: "jwt",
      description: "Update KYC by ID",
      plugins: updateKYCSwagger,
      tags: ["api", "kyc"],
      validate: {
        payload: updateKYCSchema,
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
        const payload = request.payload as UpdateKYCPayload;
        const user = await User.findById(request.auth.credentials.userId);
        const result = await KYC.findById(request.params.kycId);

        console.log(payload);

        if (result) {
          if (user.role === "admin") {
            if (payload.panManual)
              result.kycDocument.faceMatch.mannualResult = payload.panManual;
            if (payload.liveManual)
              result.kycDocument.liveTest.mannualResult = payload.liveManual;
            if (payload.status) result.status.kycStatus = payload.status;
          }
          try {
            await result.save();
          } catch (error) {
            console.log(error);
          }
          return response.response({ msg: "Permission Error" }).code(403);
        }
        return response.response({ msg: "KYC not found." }).code(404);
      },
    },
  },
  {
    method: "DELETE",
    path: "/{kycId}",
    options: {
      auth: "jwt",
      description: "Delete KYC by ID",
      plugins: deleteKYCSwagger,
      tags: ["api", "kyc"],
      handler: async (request: Request, response: ResponseToolkit) => {
        const user = await User.findById(request.auth.credentials.userId);
        const result = await KYC.findById(request.params.kycId);

        if (result) {
          if (
            user.role === "admin" ||
            user._id.toString() === result.userId.toString()
          ) {
            await result.deleteOne();
            return response
              .response({ msg: "KYC removed successfully" })
              .code(200);
          }
          return response.response({ msg: "Permission Error" }).code(403);
        }
        return response.response({ msg: "KYC not found." }).code(404);
      },
    },
  },
  {
    method: "POST",
    path: "/register1",
    options: {
      description: "Register User",
      tags: ["api", "kyc"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      console.log(request.payload);
      return "Hello";
    },
  },
];
