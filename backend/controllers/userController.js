const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { sendNewUserEmail } = require('../services/emailService');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Create a user (Staff)
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, hospitalName, phone, lat, lng, address } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'STAFF',
    hospitalName,
    phone,
    lat,
    lng,
    address,
    status: 'active',
  });

  if (user) {
    // Send Welcome Email with credentials
    sendNewUserEmail(user.email, user.name, user.email, password, user.role);

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hospitalName: user.hospitalName,
        phone: user.phone,
        lat: user.lat,
        lng: user.lng,
        address: user.address,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name !== undefined ? req.body.name : user.name;
    user.email = req.body.email !== undefined ? req.body.email : user.email;
    user.role = req.body.role !== undefined ? req.body.role : user.role;
    user.hospitalName = req.body.hospitalName !== undefined ? req.body.hospitalName : user.hospitalName;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.status = req.body.status !== undefined ? req.body.status : user.status;
    user.lat = req.body.lat !== undefined ? req.body.lat : user.lat;
    user.lng = req.body.lng !== undefined ? req.body.lng : user.lng;
    user.address = req.body.address !== undefined ? req.body.address : user.address;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        hospitalName: updatedUser.hospitalName,
        phone: updatedUser.phone,
        status: updatedUser.status,
        lat: updatedUser.lat,
        lng: updatedUser.lng,
        address: updatedUser.address,
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.deleteOne();
    res.json({
      success: true,
      message: 'User removed',
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
