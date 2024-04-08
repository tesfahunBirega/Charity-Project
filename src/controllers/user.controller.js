const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const { emailService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  try {
    const image = req.file ? req.file.filename : null;
    const { fullName, phone, email, password, role, country, volenteerTypeId } = req.body;
    const user = await userService.createUser({ fullName, phone, email, password, role, country, volenteerTypeId, image });
    const imageUrl = `${req.protocol}://${req.get('host')}/v1/public/${image}`;
    // return [user, imageUrl];
    res.status(httpStatus.CREATED).json({
      status: 'Success',
      user: {
        imageUrl: imageUrl,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        password: user.password,
        role: user.role,
        country: user.country,
        volenteerTypeId: user.volenteerTypeId,
        id: user.id,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // Handle any errors that occur during authentication
    res.status(httpStatus.UNAUTHORIZED).send({ error: error.message });
  }
});

const login = catchAsync(async (req, res) => {
  try {
    // Extract email and password from the request body
    const { email, password } = req.body;

    // Call the login service function to authenticate the user
    const { user, token } = await userService.login({ email, password });

    // If authentication is successful, send the user and token in the response
    res.status(httpStatus.OK).send({ user, token });
  } catch (error) {
    // Handle authentication errors
    res.status(httpStatus.UNAUTHORIZED).send({ error: error.message });
  }
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['title']);

  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const post = await userService.getUserById(req.params.postId);
  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found');
  }
  res.send(post);
});

const getAllUsers = catchAsync(async (req, res) => {
  const users = await userService.getAllUsers();
  res.send(users);
});

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const restBody = { email, newPassword };

    // Call the resetPassword method from the userService
    await userService.resetPassword(restBody);

    // Respond with success message
    res.status(httpStatus.OK).json({
      status: 'Success',
      message: 'Password reset successfully.',
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const updateUser = catchAsync(async (req, res) => {
  const { fullName, phone, email, password, role, country } = req.body;
  const updateBody = { fullName, phone, email, password, role, country }; // Create an object containing update values
  const updatedUser = await userService.updateUserById(req.params.userId, updateBody);
  res.send(updatedUser);
});

const deleteUser = catchAsync(async (req, res) => {
  const user = await userService.deleteUserById(req.params.userId);
  res.send(user);
});

const findRole = catchAsync(async (req, res) => {
  const users = await userService.findRole();
  const usersWithImageUrl = users.map((user) => {
    const imageUrl = `${req.protocol}://${req.get('host')}/v1/public/${user.image}`;
    return {
      id: user.id,
      fullName: user.createdAt,
      email: user.name,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
      imageUrl: imageUrl,
    };
  });
  res.send(usersWithImageUrl);
});

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Call the forgetPassword method from the userService
    const resetToken = await userService.forgetPassword(email);

    // Send reset password email to the user
    await emailService.sendResetPasswordEmail(email, resetToken);

    // Respond with success message
    res.status(httpStatus.OK).json({
      status: 'Success',
      message: 'Password reset token sent to your email.',
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  login,
  getAllUsers,
  findRole,
  resetPassword,
  forgetPassword,
};
