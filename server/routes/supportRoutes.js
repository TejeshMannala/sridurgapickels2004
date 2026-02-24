const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createFeedback,
  getMyFeedback,
  getAllFeedback,
  replyToFeedback
} = require('../controllers/supportController');

const router = express.Router();

router.use(protect);

router.route('/').post(createFeedback).get(getMyFeedback);
router.route('/admin').get(admin, getAllFeedback);
router.route('/admin/:id/reply').put(admin, replyToFeedback);

module.exports = router;
