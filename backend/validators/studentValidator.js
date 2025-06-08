import Joi from 'joi';

export const validateStudent = (data, isUpdate = false) => {
  const schema = Joi.object({
    name: isUpdate 
      ? Joi.string().min(1).max(255).optional()
      : Joi.string().min(1).max(255).required(),
    roll_number: isUpdate 
      ? Joi.string().min(1).max(20).optional()
      : Joi.string().min(1).max(20).required(),
    department: isUpdate 
      ? Joi.string().min(1).max(100).optional()
      : Joi.string().min(1).max(100).required(),
    semester: isUpdate 
      ? Joi.number().integer().min(1).max(12).optional()
      : Joi.number().integer().min(1).max(12).required(),
    phone: isUpdate 
      ? Joi.string().min(10).max(20).pattern(/^[0-9\+\-\s]+$/).optional()
      : Joi.string().min(10).max(20).pattern(/^[0-9\+\-\s]+$/).required(),
    email: isUpdate 
      ? Joi.string().email().max(255).optional()
      : Joi.string().email().max(255).required()
  });

  return schema.validate(data, { abortEarly: false });
};