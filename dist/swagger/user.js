"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSingleUserSwagger = exports.updateSingleUserSwagger = exports.getSingleUserSwagger = exports.getAllUserSwawgger = exports.currentUserSwagger = exports.verifyEmailSwagger = exports.otpSwagger = exports.loginUserSwagger = exports.createUserSwagger = void 0;
exports.createUserSwagger = {
    "hapi-swagger": {
        responses: {
            201: {
                description: "User created successfully.",
            },
            400: {
                description: "Input Fields Required.",
            },
            409: {
                description: "User already exists.",
            },
        },
    },
};
exports.loginUserSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Successfully logged in.",
            },
            400: {
                description: "Input Fields Required.",
            },
            404: {
                description: "User not found.",
            },
        },
    },
};
exports.otpSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Successfully logged in with OTP.",
            },
            400: {
                description: "OTP Verification Failed.",
            },
        },
    },
};
exports.verifyEmailSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Email Verified Successfully.",
            },
            400: {
                description: "Email Verification Failed.",
            },
        },
    },
};
exports.currentUserSwagger = {
    "hapi-swagger": {
        securityDefinitions: {
            jwt: {
                type: "apiKey",
                name: "Authorization",
                in: "header",
            },
        },
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Get current user successfully.",
            },
            401: {
                description: "Unauthorized",
            },
        },
    },
};
exports.getAllUserSwawgger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Get all user successfully.",
            },
            401: {
                description: "Unauthorized",
            },
            403: {
                description: "Permission error",
            },
        },
    },
};
exports.getSingleUserSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Get signle user successfully.",
            },
            401: {
                description: "Unauthorized",
            },
            403: {
                description: "Permission error",
            },
        },
    },
};
exports.updateSingleUserSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Update single user successfully.",
            },
            400: {
                description: "Cannot update",
            },
            401: {
                description: "Unauthorized",
            },
        },
    },
};
exports.deleteSingleUserSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Delete single user successfully.",
            },
            400: {
                description: "Cannot Delete",
            },
            401: {
                description: "Unauthorized",
            },
        },
    },
};
//# sourceMappingURL=user.js.map