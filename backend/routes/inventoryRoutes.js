const express = require('express');
const router = express.Router();
const {
  getInventory,
  getInventoryItem,
  addInventory,
  updateInventory,
  deleteInventory,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getInventory).post(addInventory);
router
  .route('/:id')
  .get(getInventoryItem)
  .put(updateInventory)
  .delete(deleteInventory);

module.exports = router;
