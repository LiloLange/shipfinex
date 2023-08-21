"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVesselSwagger = exports.updateVesselSwagger = exports.getSingleVesselSwagger = exports.getAllVesselSwagger = exports.createVesselSwagger = void 0;
exports.createVesselSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            201: {
                description: "Vessel created successfully.",
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
exports.getAllVesselSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Vessel get successfully.",
            },
            400: {
                description: "Get Vessel failed",
            },
            401: {
                description: "Unauthorized",
            },
        },
    },
};
exports.getSingleVesselSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Single Vessel get successfully.",
            },
            400: {
                description: "Get Vessel failed",
            },
            401: {
                description: "Unauthorized",
            },
        },
    },
};
exports.updateVesselSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Update Vessel successfully.",
            },
            400: {
                description: "Update Vessel failed",
            },
            401: {
                description: "Unauthorized",
            },
        },
    },
};
exports.deleteVesselSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Delete Vessel successfully.",
            },
            400: {
                description: "Delete Vessel failed",
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
//# sourceMappingURL=vessel.js.map