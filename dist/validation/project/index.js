"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimProjectSchema = exports.allowanceProjectSchema = exports.investProjectSchema = exports.depositProjectSchema = exports.withdrawSubmitProjectSchema = exports.withdrawProjectSchema = exports.deleteProjectSchema = exports.tokenizationProjectSchema = exports.getProjectSchema = exports.uploadDocumentSchema = exports.projectCreateSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.projectCreateSchema = joi_1.default.object({
    projectName: joi_1.default.string().required(),
    projectImage: joi_1.default.any().meta({ swaggerType: "file" }).required(),
    description: joi_1.default.string().required(),
    imoNumber: joi_1.default.number().required(),
    vesselType: joi_1.default.string().required(),
    builtYear: joi_1.default.date().required(),
    flag: joi_1.default.string().required(),
    estimatedEarning: joi_1.default.number().required(),
});
exports.uploadDocumentSchema = joi_1.default.object({
    technicalReport: joi_1.default.any().meta({ swaggerType: "file" }).required(),
    financialReport: joi_1.default.any().meta({ swaggerType: "file" }).required(),
    commercialReport: joi_1.default.any().meta({ swaggerType: "file" }).required(),
    risk: joi_1.default.any().meta({ swaggerType: "file" }).required(),
    community: joi_1.default.any().meta({ swaggerType: "file" }).required(),
    vesselCertificate: joi_1.default.any().meta({ swaggerType: "file" }).required(),
});
exports.getProjectSchema = joi_1.default.object({
    tokenized: joi_1.default.boolean().optional().description("Project tokenized"),
    sto: joi_1.default.boolean().optional().description("Whether to include user data"),
    page: joi_1.default.number().optional().description("Page number"),
    status: joi_1.default.boolean().optional().description("Status"),
    allowance: joi_1.default.number().optional().description("Allowance"),
});
exports.tokenizationProjectSchema = joi_1.default.object({
    tokenName: joi_1.default.string().required(),
    tokenSymbol: joi_1.default.string().required(),
    decimal: joi_1.default.number().required(),
    tonnage: joi_1.default.number().required(),
    assetValue: joi_1.default.number().required(),
    tokenizingPercentage: joi_1.default.number().required(),
    offeringPercentage: joi_1.default.number().required(),
    minimumInvestment: joi_1.default.number().required(),
});
exports.deleteProjectSchema = joi_1.default.object({
    projectId: joi_1.default.string().required().description("Project Id required"),
});
exports.withdrawProjectSchema = joi_1.default.object({
    projectId: joi_1.default.string().required().description("Project Id required"),
});
exports.withdrawSubmitProjectSchema = joi_1.default.object({
    projectId: joi_1.default.string().required().description("Project Id required"),
    status: joi_1.default.boolean().required().description("Status"),
});
exports.depositProjectSchema = joi_1.default.object({
    projectId: joi_1.default.string().required().description("Project Id required"),
    amount: joi_1.default.number().required().description("Deposit amount is required"),
});
exports.investProjectSchema = joi_1.default.object({
    projectId: joi_1.default.string().required().description("Project Id required"),
    amount: joi_1.default.number().required().description("Deposit amount is required"),
});
exports.allowanceProjectSchema = joi_1.default.object({
    allowance: joi_1.default.number().required().description("Allowance required"),
});
exports.claimProjectSchema = joi_1.default.object({
    projectId: joi_1.default.string().required().description("Project Id required"),
});
//# sourceMappingURL=index.js.map