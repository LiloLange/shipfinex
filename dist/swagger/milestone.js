"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMileStoneSwagger = exports.updateMileStoneSwagger = exports.getSingleMilestoneSwagger = exports.getAllMilestoneSwagger = exports.createMileStoneSwagger = void 0;
exports.createMileStoneSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            201: {
                description: "Milestone created successfully.",
            },
            400: {
                description: "Input Fields Required.",
            },
            401: {
                description: "Unauthorized",
            },
        },
    },
};
exports.getAllMilestoneSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Milestone get successfully.",
            },
            400: {
                description: "Get milestone failed",
            },
            401: {
                description: "Unauthorized",
            },
        },
    },
};
exports.getSingleMilestoneSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Single Milestone get successfully.",
            },
            400: {
                description: "Get milestone failed",
            },
            401: {
                description: "Unauthorized",
            },
        },
    },
};
exports.updateMileStoneSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Update milestone successfully.",
            },
            400: {
                description: "Update milestone failed",
            },
            401: {
                description: "Unauthorized",
            },
        },
    },
};
exports.deleteMileStoneSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Delete milestone successfully.",
            },
            400: {
                description: "Delete milestone failed",
            },
            401: {
                description: "Unauthorized",
            },
            403: {
                description: "Permission denied",
            },
        },
    },
};
//# sourceMappingURL=milestone.js.map