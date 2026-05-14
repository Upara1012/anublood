const asyncHandler = require('express-async-handler');
const Inventory = require('../models/Inventory');
const Notification = require('../models/Notification');
const { sendNotification } = require('../services/socketService');

// @desc    Get all inventory items with filtering and search
// @route   GET /api/inventory
// @access  Private
const getInventory = asyncHandler(async (req, res) => {
  const { bloodType, expiry, hospitalName, lat, lng, distance } = req.query;

  let query = {};

  if (bloodType) {
    query.bloodType = bloodType;
  }

  if (hospitalName) {
    query.hospitalName = { $regex: hospitalName, $options: 'i' };
  }

  if (expiry === 'near') {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    query.expiryDate = { $lte: threeDaysFromNow, $gt: new Date() };
  }

  // Geolocation search
  if (lat && lng) {
    const radius = distance ? parseInt(distance) / 6371 : 10 / 6371; // Default 10km
    query.location = {
      $geoWithin: {
        $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius],
      },
    };
  }

  const inventory = await Inventory.find(query)
    .populate('addedBy', 'lat lng address phone')
    .sort({ expiryDate: 1 });

  res.json({
    success: true,
    count: inventory.length,
    data: inventory,
  });
});

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
const getInventoryItem = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);

  if (item) {
    res.json({
      success: true,
      data: item,
    });
  } else {
    res.status(404);
    throw new Error('Inventory item not found');
  }
});

// @desc    Add blood inventory
// @route   POST /api/inventory
// @access  Private
const addInventory = asyncHandler(async (req, res) => {
  try {
    const { bloodType, units, collectionDate, expiryDate, lat, lng, address } = req.body;

    const item = await Inventory.create({
      hospitalName: req.user.hospitalName,
      bloodType,
      units: parseInt(units),
      collectionDate,
      expiryDate,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
        address,
      },
      addedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: item,
    });

    // Check if we need to send immediate notification
    if (item.status && item.status !== 'AVAILABLE') {
      const notification = await Notification.create({
        user: req.user._id,
        title: item.status === 'LOW' ? 'Low Stock Alert' : 'Expiry Alert',
        message: `${item.bloodType} blood stock is ${item.status.toLowerCase()} at your hospital.`,
        type: 'WARNING',
      });
      sendNotification(req.user._id.toString(), notification);
    }
  } catch (error) {
    console.error('Add Inventory Error:', error);
    res.status(400);
    throw error;
  }
});

// @desc    Update inventory
// @route   PUT /api/inventory/:id
// @access  Private
const updateInventory = asyncHandler(async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);

    if (item) {
      // Only the hospital that added it or an Admin can update
      if (item.addedBy.toString() !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(401);
        throw new Error('User not authorized to update this item');
      }

      // Update fields
      const { bloodType, units, collectionDate, expiryDate, status } = req.body;
      
      if (bloodType) item.bloodType = bloodType;
      if (units !== undefined) item.units = parseInt(units);
      if (collectionDate) item.collectionDate = collectionDate;
      if (expiryDate) item.expiryDate = expiryDate;
      if (status) item.status = status;

      const updatedItem = await item.save();

      res.json({
        success: true,
        data: updatedItem,
      });

      if (updatedItem.status && updatedItem.status !== 'AVAILABLE') {
        const notification = await Notification.create({
          user: req.user._id,
          title: updatedItem.status === 'LOW' ? 'Low Stock Alert' : 'Expiry Alert',
          message: `${updatedItem.bloodType} blood stock is ${updatedItem.status.toLowerCase()} at your hospital.`,
          type: 'WARNING',
        });
        sendNotification(req.user._id.toString(), notification);
      }
    } else {
      res.status(404);
      throw new Error('Inventory item not found');
    }
  } catch (error) {
    console.error('Update Inventory Error:', error);
    res.status(400);
    throw error;
  }
});

// @desc    Delete inventory
// @route   DELETE /api/inventory/:id
// @access  Private
const deleteInventory = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);

  if (item) {
    if (item.addedBy.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(401);
      throw new Error('User not authorized to delete this item');
    }

    await item.deleteOne();
    res.json({
      success: true,
      message: 'Inventory item removed',
    });
  } else {
    res.status(404);
    throw new Error('Inventory item not found');
  }
});

module.exports = {
  getInventory,
  getInventoryItem,
  addInventory,
  updateInventory,
  deleteInventory,
};
