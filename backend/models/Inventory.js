const mongoose = require('mongoose');

const inventorySchema = mongoose.Schema(
  {
    hospitalName: {
      type: String,
      required: true,
    },
    bloodType: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    units: {
      type: Number,
      required: true,
      min: 0,
    },
    collectionDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: String,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'LOW', 'EXPIRING'],
      default: 'AVAILABLE',
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index
inventorySchema.index({ location: '2dsphere' });

// Pre-save hook to set status based on units and expiry date
inventorySchema.pre('save', function() {
  const lowStockThreshold = 10;
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  if (this.expiryDate <= new Date()) {
    this.status = 'EXPIRING'; 
  } else if (this.expiryDate <= threeDaysFromNow) {
    this.status = 'EXPIRING';
  } else if (this.units < lowStockThreshold) {
    this.status = 'LOW';
  } else {
    this.status = 'AVAILABLE';
  }
});

module.exports = mongoose.model('Inventory', inventorySchema);
