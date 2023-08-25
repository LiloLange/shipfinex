import { Request, ResponseToolkit } from "@hapi/hapi";
import fs from "fs";

import KYC from "../models/kycs";
import {
  getApplicant,
  getApplicantVerifStep,
  getImage,
  getAccessToken,
} from "../utils/sumsub";
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
    path: "/{applicantId}",
    options: {
      // auth: "jwt",
      description: "Get an KYC by id",
      plugins: getSingleKYCSwagger,
      tags: ["api", "kyc"],
      handler: async (request: Request, response: ResponseToolkit) => {
        try {
          const applicant = await getApplicant(request.params.applicantId);
          const applicantVeriff = await getApplicantVerifStep(
            request.params.applicantId
          );
          console.log(applicantVeriff);
          const res = await getImage(
            applicant.inspectionId,
            applicantVeriff.IDENTITY.imageIds[0]
          );
          const buffer = Buffer.from(res, "binary");
          console.log(buffer.length);
          return response.response(buffer);
        } catch (error) {
          console.log(error);
          return response
            .response({ msg: "KYC not found with given id" })
            .code(404);
        }
      },
    },
  },
  {
    method: "GET",
    path: "/websdk",
    options: {
      auth: "jwt",
      description: "Get an KYC by id",
      plugins: getSingleKYCSwagger,
      tags: ["api", "kyc"],
      handler: async (request: Request, response: ResponseToolkit) => {
        try {
          const accessToken = await getAccessToken(
            request.auth.credentials.userId
          );
          return response.response(accessToken);
        } catch (error) {
          console.log(error);
          return response
            .response({ msg: "KYC not found with given id" })
            .code(404);
        }
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
        return "Update";
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
        return "Delete";
      },
    },
  },
  {
    method: "POST",
    path: "/hook",
    options: {
      description: "Hook KYC Change from Sumsub",
      tags: ["api", "kyc"],
    },
    handler: async (request: Request, response: ResponseToolkit) => {
      console.log(request.payload);
      if (request.payload["type"] === "applicantCreated") {
        const newKYC = new KYC(request.payload);
        newKYC.history.push({
          type: "Creat",
          createdAt: newKYC.createdAtMs,
        });
        try {
          const result = await newKYC.save();
          return response.response(result).code(201);
        } catch (error) {
          console.log(error);
          return response.response({ msg: "Error occurs" }).code(404);
        }
      }
      const kyc = await KYC.findOne({
        applicantId: request.payload["applicantId"],
      });
      if (kyc) {
        kyc.type = request.payload["type"];
        kyc.reviewStatus = request.payload["reviewStatus"];
        kyc.createdAtMs = request.payload["createdAtMs"];
        if (request.payload["reviewResult"])
          kyc.reviewResult = request.payload["reviewResult"];
        kyc.history.push({
          type: kyc.type,
          createdAt: kyc.createdAtMs,
        });
        await kyc.save();
        return response.response(kyc);
      }
      return response.response({ msg: "KYC not found" }).code(404);
    },
  },
];
