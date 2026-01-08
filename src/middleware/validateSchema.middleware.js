import { signupSchema, loginSchema } from "../validation/schema/auth.schema.js";
import { AppError } from "../utils/appError.js";
const validateSignupInput = (req, res, next) => {
  const { error } = signupSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400, "VALIDATION_ERROR");
  }
  next();
};

const validateLoginInput = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400, "VALIDATION_ERROR");
  }
  next();
};

export { validateSignupInput, validateLoginInput };
