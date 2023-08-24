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
exports.vesselRoute = void 0;
const vessel_1 = require("../swagger/vessel");
const vessels_1 = __importDefault(require("../models/vessels"));
const users_1 = __importDefault(require("../models/users"));
const vessel_2 = require("../validation/vessel");
const options = { abortEarly: false, stripUnknown: true };
exports.vesselRoute = [
    {
        method: "POST",
        path: "/register",
        options: {
            auth: "jwt",
            description: "Create vessel.",
            plugins: vessel_1.createVesselSwagger,
            tags: ["api", "vessel"],
            validate: {
                payload: vessel_2.vesselRegisterSchema,
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
                    const vessel = new vessels_1.default(request.payload);
                    const saved = yield vessel.save();
                    return response
                        .response({ msg: "Vessel created successfully." })
                        .code(201);
                }
                return response.response({ msg: "Cannot create vessel" }).code(400);
            }),
        },
    },
    {
        method: "GET",
        path: "/all",
        options: {
            auth: "jwt",
            description: "Get all vessel.",
            plugins: vessel_1.getAllVesselSwagger,
            tags: ["api", "vessel"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const vessels = yield vessels_1.default.find();
                return response.response(vessels);
            }),
        },
    },
    {
        method: "GET",
        path: "/{id}",
        options: {
            auth: "jwt",
            description: "Get a single vessel.",
            plugins: vessel_1.getSingleVesselSwagger,
            tags: ["api", "vessel"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const vessel = yield vessels_1.default.findById(request.params.id);
                return response.response(vessel);
            }),
        },
    },
    {
        method: "PUT",
        path: "/{id}",
        options: {
            auth: "jwt",
            description: "Update a single vessel.",
            plugins: vessel_1.updateVesselSwagger,
            tags: ["api", "vessel"],
            validate: {
                payload: vessel_2.vesselUpdateSchema,
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
                    const vessel = yield vessels_1.default.findById(request.params.id);
                    if (vessel) {
                        const result = yield vessels_1.default.findOneAndUpdate({ _id: request.params.id }, { $set: payload }, { new: true });
                        return response.response({ msg: "Successfully updated." });
                    }
                    return response.response({ msg: "Cannot update vessel" }).code(400);
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
            description: "Delete a single vessel.",
            plugins: vessel_1.deleteVesselSwagger,
            tags: ["api", "vessel"],
            handler: (request, response) => __awaiter(void 0, void 0, void 0, function* () {
                const user = yield users_1.default.findById(request.auth.credentials.userId);
                if (user.role === "admin") {
                    const vessel = yield vessels_1.default.findOneAndDelete(request.params.id);
                    return response.response({ msg: "Vessel deleted successfully" });
                }
                return response
                    .response({ msg: "You don't have permission to delete." })
                    .code(403);
            }),
        },
    },
];
//# sourceMappingURL=vessel.js.map