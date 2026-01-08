import Joi from "../extensions/joi-extension.js";

// Validation schema for user signup
const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().passwordComplexity().min(8).max(30).required(),
});

// Validation schema for user login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export { signupSchema, loginSchema };
