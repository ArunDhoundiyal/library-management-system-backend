const Joi = require("joi");

const checkUserRegisteredData = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email cannot be empty.It can not be left empty",
  }),
  name: Joi.string()
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      "string.pattern.base": "Name must only contain letters and spaces.",
    }),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!]).{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must include uppercase, lowercase, number, special character, and be at least 8 characters long.",
    }),
  role: Joi.string().valid("User", "Librarian").required().messages({
    "any.only": "Role must be either 'User' or 'Librarian'.",
  }),
  id: Joi.string().uuid({ version: "uuidv4" }).required().messages({
    "string.uuid": "The provided id as uuidv4 is not a valid id.",
  }),
});

const checkUserLoginData = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address.",
  }),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!]).{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must include uppercase, lowercase, number, special character, and be at least 8 characters long.",
    }),
});

module.exports = { checkUserRegisteredData, checkUserLoginData };
