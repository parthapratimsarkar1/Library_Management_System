import Joi from 'joi';

export const validateIssue = (data) => {
  const schema = Joi.object({
    book_id: Joi.number().integer().required(),
    student_id: Joi.number().integer().required(),
    due_date: Joi.date().iso().min('now').required()
  });

  return schema.validate(data, { abortEarly: false });
};