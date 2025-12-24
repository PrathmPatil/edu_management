const  Joi =require("joi");

exports.studentSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  age: Joi.number().optional(),
  course: Joi.string().valid("React", "Node", "Java", "Python").required(),
  status: Joi.string().valid("Active", "Inactive").optional(),
});
