const asyncHandler = require('express-async-handler');
const Inventory = require('../models/Inventory');
const Request = require('../models/Request');
const User = require('../models/User');

// @desc    Get dashboard summary
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardSummary = asyncHandler(async (req, res) => {
  const totalUnits = await Inventory.aggregate([
    { $group: { _id: null, total: { $sum: '$units' } } },
  ]);

  const bloodTypeSummary = await Inventory.aggregate([
    { $group: { _id: '$bloodType', total: { $sum: '$units' } } },
  ]);

  const requestStats = await Request.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const recentActivity = await Request.find({})
    .populate('requestedBy', 'name hospitalName')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      totalUnits: totalUnits[0] ? totalUnits[0].total : 0,
      bloodTypeSummary,
      requestStats,
      recentActivity,
    },
  });
});

// @desc    Get monthly usage trends
// @route   GET /api/reports/monthly
// @access  Private
const getMonthlyTrends = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const trends = await Inventory.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
        units: { $sum: '$units' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    success: true,
    data: trends,
  });
});

// @desc    Get expiry statistics
// @route   GET /api/reports/expiry
// @access  Private
const getExpiryStats = asyncHandler(async (req, res) => {
  const totalExpired = await Inventory.countDocuments({
    expiryDate: { $lt: new Date() },
  });

  const expiringSoon = await Inventory.countDocuments({
    expiryDate: {
      $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      $gt: new Date(),
    },
  });

  res.json({
    success: true,
    data: {
      totalExpired,
      expiringSoon,
    },
  });
});

module.exports = {
  getDashboardSummary,
  getMonthlyTrends,
  getExpiryStats,
};
