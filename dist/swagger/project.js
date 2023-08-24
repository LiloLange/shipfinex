"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProjectSwagger = exports.updateProjectSwagger = exports.getSingleProjectSwagger = exports.tokenizationProjectSwagger = exports.getAllProjectSwagger = exports.createProjectSwagger = void 0;
exports.createProjectSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        payloadType: "form",
        responses: {
            201: {
                description: "Project successfully created.",
            },
            400: {
                description: "Input fields error.",
            },
            401: {
                description: "Unauthorized",
            },
        },
    },
};
exports.getAllProjectSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Get KYCs successfully",
            },
            400: {
                description: "Request Param Error",
            },
            401: {
                description: "Unauthorized",
            },
        },
    },
};
exports.tokenizationProjectSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Get KYCs successfully",
            },
            400: {
                description: "Request Param Error",
            },
            401: {
                description: "Unauthorized",
            },
        },
    },
};
exports.getSingleProjectSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Get single project successfully",
            },
            400: {
                description: "Request Param Error",
            },
            401: {
                description: "Unauthorized",
            },
            403: {
                description: "Permission Error",
            },
            404: {
                description: "Project cannot find",
            },
        },
    },
};
exports.updateProjectSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Project update successfully.",
            },
            400: {
                description: "Cannot update",
            },
            401: {
                description: "Unauthorized",
            },
            403: {
                description: "Permission error",
            },
            404: {
                description: "Project cannot find",
            },
        },
    },
};
exports.deleteProjectSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Delete Project successfully",
            },
            400: {
                description: "Request Param Error",
            },
            401: {
                description: "Unauthorized",
            },
            403: {
                description: "Permission Error",
            },
            404: {
                description: "Project cannot find",
            },
        },
    },
};
//# sourceMappingURL=project.js.map