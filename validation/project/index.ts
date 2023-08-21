import Joi from "joi";

export const projectCreateSchema = Joi.object({
  projectName: Joi.string().required(),
  projectImage: Joi.any().meta({ swaggerType: "file" }).required(),
  description: Joi.string().required(),
  imoNumber: Joi.number().required(),
  vesselType: Joi.string().required(),
  builtYear: Joi.number().required(),
  flag: Joi.string().required(),
  estimatedEarning: Joi.number().required(),
});

export const getProjectSchema = Joi.object({
  tokenized: Joi.boolean().optional().description("Project tokenized"),
  sto: Joi.boolean().optional().description("Whether to include user data"),
  page: Joi.number().optional().description("Page number"),
});

export const tokenizationProjectSchema = Joi.object({
  tokenName: Joi.string().required(),
  tokenSymbol: Joi.string().required(),
  decimal: Joi.number().required(),
  tonnage: Joi.number().required(),
  assetValue: Joi.number().required(),
  tokenizingPercentage: Joi.number().required(),
  offeringPercentage: Joi.number().required(),
  minimumInvestment: Joi.number().required(),
});

export const deleteProjectSchema = Joi.object({
  projectId: Joi.string().required().description("Project Id required"),
});
