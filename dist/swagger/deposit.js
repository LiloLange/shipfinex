"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipnSwagger = exports.createDepositSwagger = void 0;
exports.createDepositSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Deposit created successfully.",
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
exports.ipnSwagger = {
    "hapi-swagger": {
        responses: {
            200: {
                description: "Handle IPN Successfully",
            },
            400: {
                description: "Input Fields Required.",
            },
        },
    },
};
//# sourceMappingURL=deposit.js.map