import { Request, ResponseToolkit } from "@hapi/hapi";
import { ethers, InfuraProvider } from "ethers";
import process from "process";
import fs from "fs";

import { deposit, claim } from "../utils/blockchain/project";
import {
  deleteProjectSchema,
  getProjectSchema,
  projectCreateSchema,
  tokenizationProjectSchema,
  uploadDocumentSchema,
  depositProjectSchema,
  claimProjectSchema,
  allowanceProjectSchema,
} from "../validation/project";
import User from "../models/users";
import {
  createProjectSwagger,
  deleteProjectSwagger,
  getAllProjectSwagger,
  getSingleProjectSwagger,
  tokenizationProjectSwagger,
  uploadDocumentsSwagger,
  claimProjectSwagger,
  depositProjectSwagger,
  allowProjectSwagger,
} from "../swagger/project";
import Project from "../models/projects";

import { createNewProject } from "../utils/blockchain/manager";

const options = { abortEarly: false, stripUnknown: true };
const path = process.cwd();
const network = process.env.ETHEREUM_NETWORK;
const provider = new InfuraProvider(network, process.env.INFURA_API_KEY);
const deploy = async (abi, bytecode, payload) => {
  console.log(payload.tokenName, payload.tokenSymbol, payload.tonnage);

  const signer = new ethers.Wallet(process.env.SIGNER_PRIVATE_KEY, provider);

  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy(
    payload.tokenName,
    payload.tokenSymbol,
    payload.tonnage * 1000
  ); // Add constructor arguments if required

  return contract;
};

export let projectRoute = [
  {
    method: "POST",
    path: "/register",
    config: {
      description: "Create Project",
      auth: "jwt",
      plugins: createProjectSwagger,
      payload: {
        maxBytes: 10485760000,
        output: "stream",
        parse: true,
        allow: "multipart/form-data",
        multipart: { output: "stream" },
      },
      tags: ["api", "project"],
      validate: {
        payload: projectCreateSchema,
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

        payload["projectOwner"] = request.auth.credentials.userId;
        // payload["projectOwner"] = "64f229acbd4e645d89dfddaa";
        const projectImage = payload["projectImage"];

        delete payload["projectImage"];

        const newProject = new Project(payload);
        const extension: Array<string> = projectImage.hapi.filename.split(".");
        const databaseFilePath = `/static/uploads/project/${
          newProject.id
        }/projectImage.${extension[extension.length - 1]}`;
        let filePath = path + `/static/uploads/project/${newProject.id}`;
        console.log(databaseFilePath);
        try {
          if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);
          filePath += `/projectImage.${extension[extension.length - 1]}`;
          const projectPipe = fs.createWriteStream(filePath);
          projectImage.pipe(projectPipe);
          newProject.projectImage = databaseFilePath;

          await newProject.save();

          return response.response(newProject).code(201);
        } catch (error) {
          console.log(error);
        }
      },
    },
  },
  {
    method: "POST",
    path: "/{id}/documents",
    config: {
      description: "Upload Project Document",
      auth: "jwt",
      plugins: uploadDocumentsSwagger,
      payload: {
        maxBytes: 10485760000,
        output: "stream",
        parse: true,
        allow: "multipart/form-data",
        multipart: { output: "stream" },
      },
      tags: ["api", "project"],
      validate: {
        payload: uploadDocumentSchema,
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
        const fileNames = [
          "technicalReport",
          "financialReport",
          "commercialReport",
          "risk",
          "community",
          "vesselCertificate",
        ];
        let filePath = path + `/static/uploads/project/${request.params.id}`;
        // console.log(databaseFilePath);
        try {
          if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

          fileNames.map((fileName) => {
            const extension: Array<string> =
              payload[fileName].hapi.filename.split(".");
            const path =
              filePath + `/${fileName}.${extension[extension.length - 1]}`;
            const projectPipe = fs.createWriteStream(path);
            payload[fileName].pipe(projectPipe);
          });
          return response.response("successfully uploaded");
        } catch (error) {
          console.log(error);
        }
      },
    },
  },
  {
    method: "GET",
    path: "/all",
    config: {
      description: "Get all project with filter",
      auth: "jwt",
      plugins: getAllProjectSwagger,
      tags: ["api", "project"],
      validate: {
        query: getProjectSchema,
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
        const user = await User.findById(request.auth.credentials.userId);
        let { tokenized, sto, page, status, allowance } = request.query;
        let result;
        const query = {};
        if (user.role === "prowner") {
          query["projectOwner"] = request.auth.credentials.userId;
        }
        if (tokenized !== undefined) {
          query["tokenized"] = tokenized;
        }
        if (sto !== undefined) {
          query["isSTOLaunched"] = sto;
        }

        query["allowance"] = 0;
        const pendingCount = await Project.countDocuments(query);
        query["allowance"] = 1;
        const approvedCount = await Project.countDocuments(query);
        query["allowance"] = 2;
        const rejectCount = await Project.countDocuments(query);
        delete query["allowance"];

        query["status"] = true;
        const activeCount = await Project.countDocuments(query);
        query["status"] = false;
        const inactiveCount = await Project.countDocuments(query);
        delete query["status"];

        if (status !== undefined) {
          query["status"] = status;
        }
        if (allowance != undefined) {
          query["allowance"] = allowance;
        }
        if (page) {
          page = parseInt(page);
        } else page = 1;
        const total = await Project.countDocuments(query);
        console.log(total);
        result = await Project.find(query)
          .populate({
            path: "projectOwner",
            select: "email firstName lastName",
          })
          .skip((page - 1) * 25)
          .limit(25);
        return {
          total,
          pendingCount,
          approvedCount,
          rejectCount,
          activeCount,
          inactiveCount,
          data: result,
          offset: page * 25,
        };
      },
    },
  },
  {
    method: "POST",
    path: "/{projectId}/tokenization",
    config: {
      description: "Tokenize the Project",
      auth: "jwt",
      plugins: tokenizationProjectSwagger,
      tags: ["api", "project"],
      validate: {
        payload: tokenizationProjectSchema,
        params: deleteProjectSchema,
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
        const project = await Project.findById(request.params.projectId);
        if (project) {
          try {
            const updatedData = await Project.updateOne(
              { _id: request.params.projectId },
              { $set: { tokenization: request.payload } }
            );
            return response
              .response({
                result: "success",
              })
              .code(200);
          } catch (error) {
            return response.response({ msg: "Updated Failed" }).code(404);
          }
        }
        return response.response({ msg: "Project not found" }).code(404);
      },
    },
  },
  {
    method: "POST",
    path: "/{projectId}/submit",
    config: {
      description: "Allow the Project",
      auth: "jwt",
      plugins: allowProjectSwagger,
      tags: ["api", "project"],
      validate: {
        payload: allowanceProjectSchema,
        params: deleteProjectSchema,
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
        const project = await Project.findById(request.params.projectId);
        if (project) {
          try {
            try {
              const {
                tokenName,
                tokenSymbol,
                tonnage,
                offeringPercentage,
                assetValue,
                decimal,
              } = project.tokenization;
              const user = await User.findById(project.projectOwner);
              const result = await createNewProject(
                String(project._id),
                tokenName,
                tokenSymbol,
                tonnage * 10 * offeringPercentage,
                decimal,
                assetValue / (tonnage * 1000),
                String(user.wallet.address)
              );
              if (result.success === true) {
                const updatedData = await Project.updateOne(
                  { _id: request.params.projectId },
                  {
                    $set: {
                      tokenized: true,
                      allowance: request.payload["allowance"],
                      contract: result.contract,
                    },
                  }
                );
                return response.response(updatedData).code(200);
              } else
                return response
                  .response({
                    msg: "Failed to deploy cproject contract",
                  })
                  .code(400);
            } catch (error) {
              console.log(error);
              return response
                .response({ msg: "Failed to deploy project contract" })
                .code(500);
            }
          } catch (error) {
            return response.response({ msg: "Updated Failed" }).code(404);
          }
        }
        return response.response({ msg: "Project not found" }).code(404);
      },
    },
  },
  {
    method: "GET",
    path: "/{projectId}",
    config: {
      description: "Get single project with project ID",
      auth: "jwt",
      plugins: getSingleProjectSwagger,
      tags: ["api", "project"],
      validate: {
        params: deleteProjectSchema,
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
        const project = await Project.findById(
          request.params.projectId
        ).populate({
          path: "projectOwner",
          select: "email firstName lastName phoneNumber",
        });
        if (project) {
          return response.response(project);
        }
        return response.response({ msg: "Project not found" }).code(404);
      },
    },
  },
  {
    method: "POST",
    path: "/deposit",
    config: {
      description: "Deposit on my project",
      auth: "jwt",
      plugins: depositProjectSwagger,
      tags: ["api", "project"],
      validate: {
        payload: depositProjectSchema,
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
        const user = await User.findById(request.auth.credentials.userId);

        if (user.role === "prowner") {
          const result = await deposit(
            request.payload["projectId"],
            user.wallet.id,
            request.payload["amount"]
          );
          return result;
        }

        return response.response({ msg: "No permission" }).code(403);
      },
    },
  },
  {
    method: "POST",
    path: "/claim",
    config: {
      description: "claim on my project",
      auth: "jwt",
      plugins: claimProjectSwagger,
      tags: ["api", "project"],
      validate: {
        payload: claimProjectSchema,
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
        const user = await User.findById(request.auth.credentials.userId);

        if (user.role === "investor") {
          const result = await claim(
            request.payload["projectId"],
            user.wallet.id
          );
          return result;
        }

        return response.response({ msg: "No permission" }).code(403);
      },
    },
  },
  {
    method: "DELETE",
    path: "/{projectId}",
    config: {
      description: "Get single project with project ID",
      auth: "jwt",
      plugins: deleteProjectSwagger,
      tags: ["api", "project"],
      validate: {
        params: deleteProjectSchema,
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
        const user = await User.findById(request.auth.credentials.userId);
        const project = await Project.findById(request.params.projectId);

        if (project) {
          if (
            user.role === "admin" ||
            project.projectOwner.toString() === user._id.toString()
          ) {
            await project.deleteOne();
            return response.response({ msg: "Removed Successfully" });
          }
          return response
            .response({
              msg: "You don't have permission to delete this project",
            })
            .code(403);
        }
        return response.response({ msg: "Project not found" }).code(404);
      },
    },
  },
];
