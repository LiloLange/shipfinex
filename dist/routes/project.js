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
exports.projectRoute = void 0;
const fs_1 = __importDefault(require("fs"));
const project_1 = require("../validation/project");
const project_2 = require("../swagger/project");
const projects_1 = __importDefault(require("../models/projects"));
const users_1 = __importDefault(require("../models/users"));
const options = { abortEarly: false, stripUnknown: true };
exports.projectRoute = [
    {
        method: "POST",
        path: "/register",
        config: {
            description: "Create Project",
            auth: "jwt",
            plugins: project_2.createProjectSwagger,
            payload: {
                maxBytes: 10485760000,
                output: "stream",
                parse: true,
                allow: "multipart/form-data",
                multipart: { output: "stream" },
            },
            tags: ["api", "project"],
            validate: {
                payload: project_1.projectCreateSchema,
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
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const payload = request.payload;
                payload["projectOwner"] = request.auth.credentials.userId;
                const projectImage = payload["projectImage"];
                delete payload["projectImage"];
                const newProject = new projects_1.default(payload);
                const databaseFilePath = `/static/uploads/project/${newProject.id}/projectImage.png`;
                let filePath = __dirname + `../../static/uploads/project/${newProject.id}`;
                // console.log(databaseFilePath);
                try {
                    if (!fs_1.default.existsSync(filePath))
                        fs_1.default.mkdirSync(filePath);
                    filePath += "/projectImage.jpg";
                    const projectPipe = fs_1.default.createWriteStream(filePath);
                    projectImage.pipe(projectPipe);
                    newProject.projectImage = databaseFilePath;
                    yield newProject.save();
                    return response.response(newProject).code(201);
                }
                catch (error) {
                    console.log(error);
                }
            }),
        },
    },
    {
        method: "GET",
        path: "/all",
        config: {
            description: "Get all project with filter",
            auth: "jwt",
            plugins: project_2.getAllProjectSwagger,
            tags: ["api", "project"],
            validate: {
                query: project_1.getProjectSchema,
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
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
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
                }
                else
                    page = 1;
                result = yield projects_1.default.find(query)
                    .skip((page - 1) * 10)
                    .limit(10);
                return result;
            }),
        },
    },
    {
        method: "POST",
        path: "/{projectId}/tokenization",
        config: {
            description: "Tokenize the Project",
            auth: "jwt",
            plugins: project_2.tokenizationProjectSwagger,
            tags: ["api", "project"],
            validate: {
                payload: project_1.tokenizationProjectSchema,
                params: project_1.deleteProjectSchema,
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
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const project = yield projects_1.default.findById(request.params.projectId);
                if (project) {
                    try {
                        const updatedData = yield projects_1.default.updateOne({ _id: request.params.projectId }, { $set: { tokenization: request.payload, tokenized: true } });
                        return response.response({ msg: "Update successfully" });
                    }
                    catch (error) {
                        return response.response({ msg: "Updated Failed" }).code(404);
                    }
                }
                return response.response({ msg: "Project not found" }).code(404);
            }),
        },
    },
    {
        method: "GET",
        path: "/{projectId}",
        config: {
            description: "Get single project with project ID",
            auth: "jwt",
            plugins: project_2.getSingleProjectSwagger,
            tags: ["api", "project"],
            validate: {
                params: project_1.deleteProjectSchema,
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
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const project = yield projects_1.default.findById(request.params.projectId);
                if (project) {
                    return response.response(project);
                }
                return response.response({ msg: "Project not found" }).code(404);
            }),
        },
    },
    {
        method: "DELETE",
        path: "/{projectId}",
        config: {
            description: "Get single project with project ID",
            auth: "jwt",
            plugins: project_2.deleteProjectSwagger,
            tags: ["api", "project"],
            validate: {
                params: project_1.deleteProjectSchema,
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
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const user = yield users_1.default.findById(request.auth.credentials.userId);
                const project = yield projects_1.default.findById(request.params.projectId);
                if (project) {
                    if (user.role === "admin" ||
                        project.projectOwner.toString() === user._id.toString()) {
                        yield project.deleteOne();
                        return response.response({ msg: "Removed Successfully" });
                    }
                    return response
                        .response({
                        msg: "You don't have permission to delete this project",
                    })
                        .code(403);
                }
                return response.response({ msg: "Project not found" }).code(404);
            }),
        },
    },
];
//# sourceMappingURL=project.js.map