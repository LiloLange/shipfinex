import { Request, ResponseToolkit } from "@hapi/hapi";
import fs from "fs";

import {
  deleteProjectSchema,
  getProjectSchema,
  projectCreateSchema,
  tokenizationProjectSchema,
} from "../validation/project";
import {
  createProjectSwagger,
  deleteProjectSwagger,
  getAllProjectSwagger,
  getSingleProjectSwagger,
  tokenizationProjectSwagger,
} from "../swagger/project";
import Project from "../models/projects";
import User from "../models/users";

const options = { abortEarly: false, stripUnknown: true };
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
        const projectImage = payload["projectImage"];

        delete payload["projectImage"];

        const newProject = new Project(payload);
        const databaseFilePath = `/static/uploads/project/${newProject.id}/projectImage.png`;
        let filePath =
          __dirname + `../../static/uploads/project/${newProject.id}`;
        // console.log(databaseFilePath);
        try {
          if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);
          filePath += "/projectImage.jpg";
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
        let { tokenized, sto, page } = request.query;
        let result;
        const query = {};
        if (tokenized) {
          query["tokenized"] = tokenized;
        }
        if (sto) {
          query["isSTOLaunched"] = sto;
        }
        if (page) {
          page = parseInt(page);
        } else page = 1;
        result = await Project.find(query)
          .skip((page - 1) * 10)
          .limit(10);
        return result;
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
              { $set: { tokenization: request.payload, tokenized: true } }
            );
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
