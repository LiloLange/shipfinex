import Joi from "joi";

export const getTransactionSchema = Joi.object({
  page: Joi.number().optional().description("Page number"),
});
