"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateKYCSchema = exports.getKYCSchema = exports.kycCreateSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.kycCreateSchema = joi_1.default.object({
    streetAddress: joi_1.default.string().required(),
    streetAddress2: joi_1.default.string().required(),
    city: joi_1.default.string().required(),
    state: joi_1.default.string().required(),
    postalCode: joi_1.default.string().required(),
    country: joi_1.default.string().required(),
    faceImage: joi_1.default.any().meta({ swaggerType: "file" }).required(),
    video: joi_1.default.any().meta({ swaggerType: "file" }).required(),
    frontImage: joi_1.default.any().meta({ swaggerType: "file" }).required(),
    backImage: joi_1.default.any().meta({ swaggerType: "file" }).optional(),
    kycDocument: joi_1.default.object({
        kycType: joi_1.default.boolean().required(),
        // faceMatch: Joi.object({
        //   aiResult: Joi.number().default(0),
        //   mannualResult: Joi.number().default(0),
        // }),
        // liveTest: Joi.object({
        //   aiResult: Joi.number().default(0),
        //   mannualResult: Joi.number().default(0),
        // }),
        pancard: joi_1.default.object({
            name: joi_1.default.string().required(),
            pancardNumber: joi_1.default.string().required(),
            birthday: joi_1.default.date().required(),
        }),
        passport: joi_1.default.object({
            name: joi_1.default.string().required(),
            passportNumber: joi_1.default.string().required(),
            birthday: joi_1.default.date().required(),
            nationality: joi_1.default.string().required(),
            issueDate: joi_1.default.date().required(),
            expiryDate: joi_1.default.date().required(),
            gender: joi_1.default.boolean().required(),
        }),
    }),
    status: joi_1.default.object({
        changedBy: joi_1.default.string().required(),
        kycStatus: joi_1.default.string().valid("Pending", "Approved", "Rejected").required(),
        auditStatus: joi_1.default.string()
            .valid("Pending", "Approved", "Rejected")
            .required(),
    }),
    applicationName: joi_1.default.string().default("KYC"),
    createdAt: joi_1.default.date().default(Date.now()),
    comments: joi_1.default.array()
        .items(joi_1.default.object({
        action: joi_1.default.string().required(),
        actionDate: joi_1.default.date().default(Date.now()),
    }))
        .default([]),
    updatedAt: joi_1.default.date().default(Date.now()),
});
exports.getKYCSchema = joi_1.default.object({
    status: joi_1.default.string().optional().description("KYC status"),
    user: joi_1.default.string().optional().description("Whether to include user data"),
    page: joi_1.default.number().optional().description("Page number"),
});
exports.updateKYCSchema = joi_1.default.object({
    panManual: joi_1.default.number().optional().messages({
        "number.base": "Provide valid number.",
    }),
    liveManual: joi_1.default.number().optional().messages({
        "number.base": "Provide valid number.",
    }),
    status: joi_1.default.string()
        .valid("Pending", "Approved", "Rejected")
        .optional()
        .messages({
        "string.valid": "Provide valid status.",
    }),
});
//# sourceMappingURL=index.js.map