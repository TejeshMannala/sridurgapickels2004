const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getWishlist, toggleWishlist } = require('../controllers/wishlistController');

const router = express.Router();

router.use(protect);
router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);

module.exports = router;
