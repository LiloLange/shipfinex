"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvestmentSwagger = exports.investSwagger = void 0;
exports.investSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            201: {
                description: "Investment created successfully.",
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
exports.getInvestmentSwagger = {
    "hapi-swagger": {
        security: [{ jwt: [] }],
        responses: {
            200: {
                description: "Get Investment successfully.",
            },
            400: {
                description: "Get investment failed",
            },
            401: {
                description: "Unauthorized",
            },
        },
    },
};
//# sourceMappingURL=investment.js.map