const cron = require('node-cron');
const Inventory = require('../models/Inventory');
const Notification = require('../models/Notification');
const { sendNotification } = require('../services/socketService');

const initCronJobs = () => {
  // Check for low stock and expiring blood every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily stock and expiry check...');
    
    const lowStockThreshold = process.env.LOW_STOCK_THRESHOLD || 10;
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // 1. Check for expiring blood
    const expiringItems = await Inventory.find({
      expiryDate: { $lte: threeDaysFromNow, $gt: new Date() },
      status: { $ne: 'EXPIRING' }
    });

    for (const item of expiringItems) {
      item.status = 'EXPIRING';
      await item.save();

      const notification = await Notification.create({
        user: item.addedBy,
        title: 'Expiry Alert',
        message: `${item.bloodType} blood units at ${item.hospitalName} are expiring within 3 days.`,
        type: 'WARNING'
      });

      sendNotification(item.addedBy.toString(), notification);
    }

    // 2. Check for low stock
    const lowStockItems = await Inventory.find({
      units: { $lt: lowStockThreshold },
      status: 'AVAILABLE'
    });

    for (const item of lowStockItems) {
      item.status = 'LOW';
      await item.save();

      const notification = await Notification.create({
        user: item.addedBy,
        title: 'Low Stock Alert',
        message: `${item.bloodType} blood stock is low at ${item.hospitalName} (Units: ${item.units}).`,
        type: 'WARNING'
      });

      sendNotification(item.addedBy.toString(), notification);
    }
  });

  console.log('Cron jobs initialized');
};

module.exports = initCronJobs;
