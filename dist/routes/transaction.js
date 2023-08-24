"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionRoute = void 0;
exports.transactionRoute = [
    {
        method: "POST",
        path: "/register",
        handler: (request, response) => {
            return "KYC Hello World!";
        },
    },
    {
        method: "GET",
        path: "/all",
        handler: (request, response) => {
            return "Hello World!";
        },
    },
];
//# sourceMappingURL=transaction.js.map