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
const solc_1 = __importDefault(require("solc"));
const sol_merger_1 = require("sol-merger");
const ethers_1 = require("ethers");
const process_1 = __importDefault(require("process"));
const fs_1 = __importDefault(require("fs"));
const project_1 = require("../validation/project");
const project_2 = require("../swagger/project");
const projects_1 = __importDefault(require("../models/projects"));
const users_1 = __importDefault(require("../models/users"));
const options = { abortEarly: false, stripUnknown: true };
const path = process_1.default.cwd();
const network = process_1.default.env.ETHEREUM_NETWORK;
const provider = new ethers_1.InfuraProvider(network, process_1.default.env.INFURA_API_KEY);
const deploy = (abi, bytecode, payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(payload.tokenName, payload.tokenSymbol, payload.tonnage);
    const signer = new ethers_1.ethers.Wallet(process_1.default.env.SIGNER_PRIVATE_KEY, provider);
    const factory = new ethers_1.ethers.ContractFactory(abi, bytecode, signer);
    const contract = yield factory.deploy(payload.tokenName, payload.tokenSymbol, payload.tonnage * 1000); // Add constructor arguments if required
    return contract;
});
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
                // payload["projectOwner"] = "64f229acbd4e645d89dfddaa";
                const projectImage = payload["projectImage"];
                delete payload["projectImage"];
                const newProject = new projects_1.default(payload);
                const extension = projectImage.hapi.filename.split(".");
                const databaseFilePath = `/static/uploads/project/${newProject.id}/projectImage.${extension[extension.length - 1]}`;
                let filePath = path + `/static/uploads/project/${newProject.id}`;
                console.log(databaseFilePath);
                try {
                    if (!fs_1.default.existsSync(filePath))
                        fs_1.default.mkdirSync(filePath);
                    filePath += `/projectImage.${extension[extension.length - 1]}`;
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
        method: "POST",
        path: "/{id}/documents",
        config: {
            description: "Upload Project Document",
            auth: "jwt",
            plugins: project_2.uploadDocumentsSwagger,
            payload: {
                maxBytes: 10485760000,
                output: "stream",
                parse: true,
                allow: "multipart/form-data",
                multipart: { output: "stream" },
            },
            tags: ["api", "project"],
            validate: {
                payload: project_1.uploadDocumentSchema,
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
                    if (!fs_1.default.existsSync(filePath))
                        fs_1.default.mkdirSync(filePath);
                    fileNames.map((fileName) => {
                        const extension = payload[fileName].hapi.filename.split(".");
                        const path = filePath + `/${fileName}.${extension[extension.length - 1]}`;
                        const projectPipe = fs_1.default.createWriteStream(path);
                        payload[fileName].pipe(projectPipe);
                    });
                    return response.response("successfully uploaded");
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
            // auth: "jwt",
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
                const pendingCount = yield projects_1.default.countDocuments(query);
                query["allowance"] = 1;
                const approvedCount = yield projects_1.default.countDocuments(query);
                query["allowance"] = 2;
                const rejectCount = yield projects_1.default.countDocuments(query);
                delete query["allowance"];
                query["status"] = true;
                const activeCount = yield projects_1.default.countDocuments(query);
                query["status"] = false;
                const inactiveCount = yield projects_1.default.countDocuments(query);
                delete query["status"];
                if (status !== undefined) {
                    query["status"] = status;
                }
                if (allowance != undefined) {
                    query["allowance"] = allowance;
                }
                if (page) {
                    page = parseInt(page);
                }
                else
                    page = 1;
                const total = yield projects_1.default.countDocuments(query);
                console.log(total);
                result = yield projects_1.default.find(query)
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
            }),
        },
    },
    {
        method: "POST",
        path: "/{projectId}/tokenization",
        config: {
            description: "Tokenize the Project",
            // auth: "jwt",
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
                        const updatedData = yield projects_1.default.updateOne({ _id: request.params.projectId }, { $set: { tokenization: request.payload } });
                        const mergedCode = yield (0, sol_merger_1.merge)("./contracts/ShipToken.sol");
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
                        const compiledContract = JSON.parse(solc_1.default.compile(JSON.stringify(input)));
                        const bytecode = compiledContract.contracts["ShipToken.sol"]["ShipToken"].evm
                            .bytecode.object;
                        const abi = compiledContract.contracts["ShipToken.sol"]["ShipToken"].abi;
                        try {
                            const deployedContract = yield deploy(abi, bytecode, request.payload);
                            console.log(deployedContract);
                            return response
                                .response({
                                result: "success",
                                address: deployedContract.target,
                                sentTx: deployedContract["sentTx"],
                            })
                                .code(200);
                        }
                        catch (error) {
                            console.log(error);
                            return response.response(mergedCode).code(500);
                        }
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
        path: "/{projectId}/allow",
        config: {
            description: "Allow the Project",
            // auth: "jwt",
            plugins: project_2.tokenizationProjectSwagger,
            tags: ["api", "project"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const project = yield projects_1.default.findById(request.params.projectId);
                if (project) {
                    try {
                        const updatedData = yield projects_1.default.updateOne({ _id: request.params.projectId }, { $set: { tokenized: true, allowance: 1 } });
                        const mergedCode = yield (0, sol_merger_1.merge)("./contracts/ShipToken.sol");
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
                        const compiledContract = JSON.parse(solc_1.default.compile(JSON.stringify(input)));
                        const bytecode = compiledContract.contracts["ShipToken.sol"]["ShipToken"].evm
                            .bytecode.object;
                        const abi = compiledContract.contracts["ShipToken.sol"]["ShipToken"].abi;
                        try {
                            const deployedContract = yield deploy(abi, bytecode, project.tokenization);
                            console.log(deployedContract);
                            return response
                                .response({
                                result: "success",
                                address: deployedContract.target,
                                sentTx: deployedContract["sentTx"],
                            })
                                .code(200);
                        }
                        catch (error) {
                            console.log(error);
                            return response.response(mergedCode).code(500);
                        }
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