const express = require('express');
const Cycle = require('../models/Cycle');
const Group = require('../models/Group');
const Member = require('../models/Member');
const auth = require('../middleware/auth');
const router = express.Router();

// Get cycles for group
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const cycles = await Cycle.find({ group: req.params.groupId })
      .populate('payoutRecipient')
      .sort('cycleNumber')
      .lean();

    // Populate member user info for payments
    for (const cycle of cycles) {
      if (Array.isArray(cycle.payments)) {
        for (const p of cycle.payments) {
          // populate member -> user
          const member = await Member.findById(p.member).populate('user', 'name email');
          p.member = member;
          p.user = member?.user;
        }
      }
    }

    res.json({
      success: true,
      data: cycles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get current cycle for group
router.get('/group/:groupId/current', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    const cycle = await Cycle.findOne({
      group: req.params.groupId,
      cycleNumber: group.currentCycle
    }).populate('payoutRecipient');

      if (cycle) {
        // populate payments member->user
        if (Array.isArray(cycle.payments)) {
          for (const p of cycle.payments) {
            const member = await Member.findById(p.member).populate('user', 'name email');
            p.member = member;
            p.user = member?.user;
          }
        }
      }

      res.json({
        success: true,
        data: cycle
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;