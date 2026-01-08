import BaseJoi from "joi";
import { passwordComplexity } from "../validators/passwordValidator.js";

// Create extended Joi instance with custom validators
const Joi = BaseJoi.extend(passwordComplexity);

export default Joi;
