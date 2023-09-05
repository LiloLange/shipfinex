import { Request, ResponseToolkit } from "@hapi/hapi";
import solc from "solc";
import { merge } from "sol-merger";
import { ethers, InfuraProvider } from "ethers";
import process from "process";
import fs from "fs";

import {
  deleteProjectSchema,
  getProjectSchema,
  projectCreateSchema,
  tokenizationProjectSchema,
  uploadDocumentSchema,
} from "../validation/project";
import {
  createProjectSwagger,
  deleteProjectSwagger,
  getAllProjectSwagger,
  getSingleProjectSwagger,
  tokenizationProjectSwagger,
  uploadDocumentsSwagger,
} from "../swagger/project";
import Project from "../models/projects";
import User from "../models/users";

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
        let { tokenized, sto, page, status, allowance } = request.query;
        let result;
        const query = {};
        if (tokenized) {
          query["tokenized"] = tokenized;
        }
        if (sto) {
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
            const mergedCode = await merge("./contracts/ShipToken.sol");
            const input = {
              language: "Solidity",
              sources: {
                "ShipToken.sol": {
                  content: mergedCode,
                },
              },
              settings: {
                outputSelection: {
                  "*": {
                    "*": ["*"],
                  },
                },
              },
            };
            const compiledContract = JSON.parse(
              solc.compile(JSON.stringify(input))
            );
            const bytecode =
              compiledContract.contracts["ShipToken.sol"]["ShipToken"].evm
                .bytecode.object;
            const abi =
              compiledContract.contracts["ShipToken.sol"]["ShipToken"].abi;
            try {
              const deployedContract = await deploy(
                abi,
                bytecode,
                request.payload
              );
              console.log(deployedContract);
              return response
                .response({
                  result: "success",
                  address: deployedContract.target,
                  sentTx: deployedContract["sentTx"],
                })
                .code(200);
            } catch (error) {
              console.log(error);
              return response.response(mergedCode).code(500);
            }

            return response.response({ msg: "Update successfully" });
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
    path: "/{projectId}/allow",
    config: {
      description: "Allow the Project",
      auth: "jwt",
      plugins: tokenizationProjectSwagger,
      tags: ["api", "project"],
      handler: async (request: Request, response: ResponseToolkit) => {
        const project = await Project.findById(request.params.projectId);
        if (project) {
          try {
            const updatedData = await Project.updateOne(
              { _id: request.params.projectId },
              { $set: { tokenized: true, allowance: 1 } }
            );

            const mergedCode = await merge("./contracts/ShipToken.sol");
            const input = {
              language: "Solidity",
              sources: {
                "ShipToken.sol": {
                  content: mergedCode,
                },
              },
              settings: {
                outputSelection: {
                  "*": {
                    "*": ["*"],
                  },
                },
              },
            };
            const compiledContract = JSON.parse(
              solc.compile(JSON.stringify(input))
            );
            const bytecode =
              compiledContract.contracts["ShipToken.sol"]["ShipToken"].evm
                .bytecode.object;
            const abi =
              compiledContract.contracts["ShipToken.sol"]["ShipToken"].abi;
            try {
              const deployedContract = await deploy(
                abi,
                bytecode,
                project.tokenization
              );
              console.log(deployedContract);
              return response
                .response({
                  result: "success",
                  address: deployedContract.target,
                  sentTx: deployedContract["sentTx"],
                })
                .code(200);
            } catch (error) {
              console.log(error);
              return response.response(mergedCode).code(500);
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
        const project = await Project.findById(request.params.projectId);
        if (project) {
          return response.response(project);
        }
        return response.response({ msg: "Project not found" }).code(404);
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
