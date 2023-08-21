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
exports.mileStoneRoute = void 0;
const milestone_1 = require("../swagger/milestone");
const milestones_1 = __importDefault(require("../models/milestones"));
const users_1 = __importDefault(require("../models/users"));
const milestone_2 = require("../validation/milestone");
const options = { abortEarly: false, stripUnknown: true };
exports.mileStoneRoute = [
    {
        method: "POST",
        path: "/register",
        options: {
            auth: "jwt",
            description: "Create milestone.",
            plugins: milestone_1.createMileStoneSwagger,
            tags: ["api", "milestone"],
            validate: {
                payload: milestone_2.milestoneRegisterSchema,
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
                const userId = request.auth.credentials.userId;
                const authUser = yield users_1.default.findById(userId);
                if (authUser.role === "admin") {
                    const milestone = new milestones_1.default(request.payload);
                    const saved = yield milestone.save();
                    return response
                        .response({ msg: "Milestone created successfully." })
                        .code(201);
                }
                return response.response({ msg: "Cannot create milestone" }).code(400);
            }),
        },
    },
    {
        method: "GET",
        path: "/all",
        options: {
            auth: "jwt",
            description: "Get all milestone.",
            plugins: milestone_1.getAllMilestoneSwagger,
            tags: ["api", "milestone"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const milestones = yield milestones_1.default.find();
                return response.response(milestones);
            }),
        },
    },
    {
        method: "GET",
        path: "/{id}",
        options: {
            auth: "jwt",
            description: "Get a single milestone.",
            plugins: milestone_1.getSingleMilestoneSwagger,
            tags: ["api", "milestone"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const milestones = yield milestones_1.default.findById(request.params.id);
                return response.response(milestones);
            }),
        },
    },
    {
        method: "PUT",
        path: "/{id}",
        options: {
            auth: "jwt",
            description: "Update a single milestone.",
            plugins: milestone_1.updateMileStoneSwagger,
            tags: ["api", "milestone"],
            validate: {
                payload: milestone_2.milestoneUpdateSchema,
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
                if (user.role === "admin") {
                    const payload = request.payload;
                    const milestone = yield milestones_1.default.findById(request.params.id);
                    if (milestone) {
                        const result = yield milestones_1.default.findOneAndUpdate({ _id: request.params.id }, { $set: payload }, { new: true });
                        return response.response({ msg: "Successfully updated." });
                    }
                    return response
                        .response({ msg: "Cannot update milestone" })
                        .code(400);
                }
                return response
                    .response({ msg: "You don't have permission to update." })
                    .code(403);
            }),
        },
    },
    {
        method: "DELETE",
        path: "/{id}",
        options: {
            auth: "jwt",
            description: "Delete a single milestone.",
            plugins: milestone_1.deleteMileStoneSwagger,
            tags: ["api", "milestone"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const user = yield users_1.default.findById(request.auth.credentials.userId);
                if (user.role === "admin") {
                    const milestone = yield milestones_1.default.findOneAndDelete(request.params.id);
                    return response.response({ msg: "Milestone deleted successfully" });
                }
                return response
                    .response({ msg: "You don't have permission to delete." })
                    .code(403);
            }),
        },
    },
];
//# sourceMappingURL=milestone.js.map