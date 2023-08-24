"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteKYCSwagger = exports.updateKYCSwagger = exports.getSingleKYCSwagger = exports.getAllKYCSwagger = exports.createKYCSwagger = void 0;
exports.createKYCSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        payloadType: "form",
        responses: {
            201: {
                description: "KYC successfully requested.",
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
exports.getAllKYCSwagger = {
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
exports.getSingleKYCSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Get single KYC successfully",
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
                description: "KYC cannot find",
            },
        },
    },
};
exports.updateKYCSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "KYC update successfully.",
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
                description: "KYC cannot find",
            },
        },
    },
};
exports.deleteKYCSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Delete KYC successfully",
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
                description: "KYC cannot find",
            },
        },
    },
};
//# sourceMappingURL=kyc.js.map