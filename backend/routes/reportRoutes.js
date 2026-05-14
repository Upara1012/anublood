const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getMonthlyTrends,
  getExpiryStats,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', getDashboardSummary);
router.get('/monthly', getMonthlyTrends);
router.get('/expiry', getExpiryStats);

module.exports = router;
