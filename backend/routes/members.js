const express = require('express');
const Member = require('../models/Member');
const auth = require('../middleware/auth');
const router = express.Router();

// Get members for group
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const members = await Member.find({ group: req.params.groupId })
      .populate('user', 'name email phone');

    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;