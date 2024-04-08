const Joi = require('joi');

const createUser = {
  body: Joi.object()
    .keys({
      fullName: Joi.string().required(),
      phone: Joi.string(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      role: Joi.string(),
      country: Joi.string().allow('').optional(),
      volenteerTypeId: Joi.string().allow('').optional(), // Making volenteerTypeId optional
      image: Joi.string(),
    })
    .unknown(true)
    .min(1),
};

const getUsers = {
  query: Joi.object().keys({
    firstName: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string(),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required(),
  }),
  // body: Joi.object()
  //   .keys({
  //     title: Joi.string(),
  //     body: Joi.string(),
  //   })
  //   .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string(),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
