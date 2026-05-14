const asyncHandler = require('express-async-handler');
const Request = require('../models/Request');
const Notification = require('../models/Notification');
const { sendNotification } = require('../services/socketService');
const { sendRequestEmail, sendRequestResponseEmail } = require('../services/emailService');

// @desc    Create a blood request
// @route   POST /api/requests
// @access  Private
const createRequest = asyncHandler(async (req, res) => {
  const { targetHospital, targetHospitalId, bloodType, unitsRequired, units, message, urgency } = req.body;
  const finalUnits = unitsRequired || units;

  const request = await Request.create({
    requestedBy: req.user._id,
    targetHospital: targetHospital || 'Broadcast',
    targetHospitalId,
    bloodType,
    unitsRequired: finalUnits,
    message,
    urgency,
  });

  // Notify target hospital or broadcast to all
  if (targetHospital) {
    const User = require('../models/User');
    const notifyQuery = targetHospital === 'Broadcast' 
      ? { hospitalName: { $ne: req.user.hospitalName } } 
      : { hospitalName: targetHospital };
      
    const targetStaff = await User.find(notifyQuery);
    
    for (const staff of targetStaff) {
      const notification = await Notification.create({
        user: staff._id,
        title: 'New Blood Request',
        message: `${req.user.hospitalName} is requesting ${finalUnits} units of ${bloodType} blood.`,
        type: 'ALERT',
      });

      sendNotification(staff._id.toString(), notification);
      
      // Send Email Notification
      if (staff.email) {
        sendRequestEmail(staff.email, req.user.hospitalName, bloodType, finalUnits, message);
      }
    }
  }

  res.status(201).json({
    success: true,
    data: request,
  });
});

// @desc    Get all requests (related to user's hospital)
// @route   GET /api/requests
// @access  Private
const getRequests = asyncHandler(async (req, res) => {
  // If admin, get all. If staff, get requests made by them OR sent to their hospital.
  let query = {};
  if (req.user.role !== 'ADMIN') {
    query = {
      $or: [
        { requestedBy: req.user._id },
        { targetHospital: req.user.hospitalName },
        { targetHospital: 'Broadcast' }
      ]
    };
  }

  const requests = await Request.find(query)
    .populate('requestedBy', 'name hospitalName')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: requests.length,
    data: requests,
  });
});

// @desc    Respond to blood request
// @route   PUT /api/requests/:id/respond
// @access  Private
const respondToRequest = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const request = await Request.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  // Check if user belongs to the target hospital or it's a broadcast
  if (request.targetHospital !== req.user.hospitalName && request.targetHospital !== 'Broadcast' && req.user.role !== 'ADMIN') {
    res.status(401);
    throw new Error('Not authorized to respond to this request');
  }

  request.status = status;
  await request.save();

  // Notify the requester
  const populatedRequest = await Request.findById(request._id).populate('requestedBy', 'email');
  
  const notification = await Notification.create({
    user: request.requestedBy,
    title: 'Blood Request Update',
    message: `Your request for ${request.bloodType} blood has been ${status.toLowerCase()} by ${req.user.hospitalName}.`,
    type: status === 'ACCEPTED' ? 'INFO' : 'WARNING',
  });

  sendNotification(request.requestedBy.toString(), notification);

  if (populatedRequest.requestedBy && populatedRequest.requestedBy.email) {
    sendRequestResponseEmail(populatedRequest.requestedBy.email, req.user.hospitalName, status, request.bloodType);
  }

  res.json({
    success: true,
    data: request,
  });
});

// @desc    Delete a request
// @route   DELETE /api/requests/:id
// @access  Private
const deleteRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id);

  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  if (request.requestedBy.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    res.status(401);
    throw new Error('Not authorized to delete this request');
  }

  await request.deleteOne();

  res.json({
    success: true,
    message: 'Request removed',
  });
});

module.exports = {
  createRequest,
  getRequests,
  respondToRequest,
  deleteRequest,
};
