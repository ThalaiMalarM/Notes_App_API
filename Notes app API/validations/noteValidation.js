const Joi = require("joi");

const createNoteSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  content: Joi.string().min(1).required(),
});

const updateNoteSchema = Joi.object({
  title: Joi.string().min(1).max(100),
  content: Joi.string().min(1),
});

module.exports = { createNoteSchema, updateNoteSchema };
