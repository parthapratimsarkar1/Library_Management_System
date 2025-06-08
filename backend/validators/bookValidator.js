import Joi from 'joi';

export const validateBook = (data, isUpdate = false) => {
  const schema = Joi.object({
    title: isUpdate 
      ? Joi.string().min(1).max(255).optional()
      : Joi.string().min(1).max(255).required(),
    author: isUpdate 
      ? Joi.string().min(1).max(255).optional()
      : Joi.string().min(1).max(255).required(),
    isbn: isUpdate 
      ? Joi.string().min(10).max(20).optional()
      : Joi.string().min(10).max(20).required(),
    copies: isUpdate 
      ? Joi.number().integer().min(1).optional()
      : Joi.number().integer().min(1).required(),
    category: isUpdate 
      ? Joi.string().min(1).max(100).optional()
      : Joi.string().min(1).max(100).required()
  });

  return schema.validate(data, { abortEarly: false });
};