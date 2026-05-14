const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  respondToRequest,
  deleteRequest,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getRequests).post(createRequest);
router.route('/:id').delete(deleteRequest);
router.put('/:id/respond', respondToRequest);

module.exports = router;
