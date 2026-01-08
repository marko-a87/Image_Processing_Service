/**
 * Custom validator that checks if a string contains at least one uppercase letter,
 * one lowercase letter, one digit, and one special character
 */
const passwordComplexity = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.passwordComplexity":
      "{{#label}} must contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
  },

  rules: {
    passwordComplexity: {
      validate(value, helpers) {
        const hasUppercase = /[A-Z]/.test(value);
        const hasLowercase = /[a-z]/.test(value);
        const hasDigit = /\d/.test(value);
        const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);

        if (!(hasUppercase && hasLowercase && hasDigit && hasSpecial)) {
          return helpers.error("string.passwordComplexity");
        }

        return value;
      },
    },
  },
});

export { passwordComplexity };
