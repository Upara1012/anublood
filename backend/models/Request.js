const mongoose = require('mongoose');

const requestSchema = mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetHospital: {
      type: String, // Or ObjectId if we have a Hospital model, but here it seems hospitalName is used
      required: true,
    },
    targetHospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Usually requested from another staff member's hospital
    },
    bloodType: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    unitsRequired: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
    },
    urgency: {
      type: String,
      enum: ['NORMAL', 'HIGH', 'CRITICAL'],
      default: 'NORMAL',
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'FULFILLED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Request', requestSchema);
