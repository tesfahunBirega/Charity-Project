const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const ApiError = require('../utils/ApiError');
const sortBy = require('../utils/sorter');
const findAll = require('./Plugins/findAll');
const configs = require('../config/config');
const dataSource = require('../utils/createDatabaseConnection');
const { User } = require('../models');
// const { getConnection } = require('typeorm');
const { Voluntery } = require('../models');

const volunteryRepository = dataSource.getRepository(Voluntery).extend({
  findAll,
  sortBy,
});
const userRepository = dataSource.getRepository(User).extend({
  findAll,
  sortBy,
});
// .extend({ sortBy });
//

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<Post>}
 */

const hash = (pass) => {
  return bcrypt.hashSync(pass, 10);
};

const getUserByEmail = async (credentials) => {
  try {
    const { email, password } = credentials;

    // Form Connection
    // const connection = getConnection();
    // const userRepository = connection.getRepository(User);
    const user = await userRepository.findOne({
      where: { email: email },
    });
    if (!user) {
      throw new Error('User not found');
    }

    // Check if the password matches
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new Error('Incorrect password');
    }

    return user;
  } catch (error) {
    throw error;
  }
};

const createUser = async (ReqBody) => {
  const { email } = ReqBody;

  // Check if the email already exists in the database
  const existingUser = await userRepository.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('Email is already in use.');
  }
  const { password } = ReqBody;

  if (password) {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the generated salt
    const hashedPassword = await bcrypt.hash(password, salt);
    // Update the password in the request body
    // eslint-disable-next-line no-param-reassign
    ReqBody.password = hashedPassword;
  }
  // Generate a salt
  const doc = userRepository.create(ReqBody);
  const result = userRepository.save(doc);
  return result;
};

const login = async (credentials, expiresIn = '1h') => {
  const { email, password } = credentials;

  // Retrieve the user from the database based on the email
  const user = await userRepository.findOne({ where: { email } });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify if the provided password matches the stored hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  // Generate JWT token
  const token = jwt.sign({ id: user.id, email: user.email }, configs.secret, { expiresIn });

  // Return the user and token
  return { user, token };
};

const resetPassword = async (restBody) => {
  try {
    // Extract email and newPassword from the request body
    const { email, newPassword } = restBody;

    // Find user by email
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found.');
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const updateResult = await userRepository.update({ id: user.id }, { password: hashedPassword });
    // Update user's password using the repository method

    // Check if update was successful
    if (updateResult[0] === 0) {
      throw new Error('Failed to update password.');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Query for users
 * @param {Object} filter - Filter options
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */

const queryUsers = async () => {
  // Fetch users with role 'user'
  const users = await userRepository.findAll({ where: { role: 'volenteer' } });
  return users;
};

/**
 * Get post by id
 * @param {ObjectId} id
 * @returns {Promise<Post>}
 */
const getAllUsers = async (req, res) => {
  // Fetch users with the 'volunteer' role
  const users = await userRepository.find({ where: { role: 'volenteer' } });

  // Retrieve volunteer information for each user
  const usersWithVolunteerInfo = [];
  for (const user of users) {
    // Perform a query to find the volunteer type based on the volunteerTypeId
    const volunteerInfo = await volunteryRepository.findOne({ where: { id: user.volenteerTypeId } });
    // Add the volunteer information to the user object
    const userWithVolunteerInfo = {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      country: user.country,
      volunteer: volunteerInfo,
    };
    usersWithVolunteerInfo.push(userWithVolunteerInfo);
  }

  return usersWithVolunteerInfo;
};

const getUserById = async (id) => {
  return userRepository.findOneBy({ id });
};

/**
 * Update user by id
 * @param {ObjectId} postId
 * @param {Object} updateBody
 * @returns {Promise<Post>}
 */
const updateUserById = async (userId, updateBody) => {
  const userById = await getUserById(userId);
  if (!userById) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const updateResult = await userRepository.update({ id: userId }, updateBody); // Use updateBody to specify updated values
  let updateResultUser;
  if (updateResult) {
    updateResultUser = await getUserById(userId);
  } else {
    return 'none updated';
  }
  return { updateResultUser };
};
/**
 * Delete user by id
 * @param {ObjectId} postId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  try {
    // Retrieve the user data before deletion
    const userToDelete = await getUserById(userId);
    if (!userToDelete) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Attempt to delete the user
    const deletionResult = await userRepository.delete({ id: userId });

    // Check if the user was successfully deleted
    if (!deletionResult || deletionResult.affected === 0) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete user');
    }

    // Return the user data after deletion
    return userToDelete;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

// Function to generate a random password reset token
const generateResetToken = () => {
  const tokenLength = 20; // Length of the reset token
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < tokenLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters[randomIndex];
  }
  return token;
};

const forgetPassword = async (email) => {
  try {
    // Find user by email
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found.');
    }

    // Generate password reset token
    const resetToken = generateResetToken(); // Implement your reset token generation logic

    // Store reset token in the database or send it via email to the user
    // For simplicity, assume the token is stored in the user object
    user.resetToken = resetToken;
    await userRepository.update({ resetToken }, { id: user.id });

    // Return the reset token
    return resetToken;
  } catch (error) {
    throw error;
  }
};

const findRole = async () => {
  const resultAdmin = await userRepository.find({ where: { role: 'admin' } });
  const resultSuperAdmin = await userRepository.find({ where: { role: 'superadmin' } });
  const result = [...resultAdmin, ...resultSuperAdmin];
  return result;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  login,
  getAllUsers,
  findRole,
  getUserByEmail,
  hash,
  resetPassword,
  forgetPassword,
};
