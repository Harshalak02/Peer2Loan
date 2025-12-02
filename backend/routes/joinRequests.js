const express = require('express');
const JoinRequest = require('../models/JoinRequest');
const Group = require('../models/Group');
const Member = require('../models/Member');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// User submits join request with access code
router.post('/request', auth, async (req, res) => {
  try {
    const { accessCode } = req.body;

    // Find group with this access code
    const group = await Group.findOne({ accessCode }).populate('organizer', 'name email');
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Invalid access code'
      });
    }

    // Check if user is already a member
    const existingMember = await Member.findOne({
      group: group._id,
      user: req.user.id
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
    }

    // Check if user already has a pending request
    const existingRequest = await JoinRequest.findOne({
      group: group._id,
      user: req.user.id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this group'
      });
    }

    // Create join request
    const joinRequest = new JoinRequest({
      group: group._id,
      user: req.user.id,
      accessCode: accessCode,
      status: 'pending'
    });

    await joinRequest.save();

    res.json({
      success: true,
      message: 'Join request submitted successfully',
      data: {
        group: {
          _id: group._id,
          name: group.name,
          description: group.description,
          monthlyContribution: group.monthlyContribution,
          groupSize: group.groupSize,
          duration: group.duration,
          organizer: group.organizer
        },
        status: 'pending'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get group details before joining (accessible with access code)
router.post('/preview', async (req, res) => {
  try {
    const { accessCode } = req.body;

    const group = await Group.findOne({ accessCode })
      .populate('organizer', 'name email');
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Invalid access code'
      });
    }

    // Get current member count
    const memberCount = await Member.countDocuments({ 
      group: group._id,
      status: 'active'
    });

    res.json({
      success: true,
      data: {
        group: {
          _id: group._id,
          name: group.name,
          description: group.description,
          monthlyContribution: group.monthlyContribution,
          groupSize: group.groupSize,
          duration: group.duration,
          organizer: group.organizer,
          currentMembers: memberCount,
          rules: {
            paymentWindow: group.paymentWindow,
            penaltyRules: group.penaltyRules,
            turnOrderPolicy: group.turnOrderPolicy
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
// Organizer: Get pending join requests for their group
router.get('/group/:groupId/pending', auth, async (req, res) => {
  try {
    // Verify user is organizer of this group
    const organizer = await Member.findOne({
      group: req.params.groupId,
      user: req.user.id,
      role: 'organizer'
    });

    if (!organizer) {
      return res.status(403).json({
        success: false,
        message: 'You are not the organizer of this group'
      });
    }

    const requests = await JoinRequest.find({
      group: req.params.groupId,
      status: 'pending'
    }).populate('user', 'name email');

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/:requestId/approve', auth, async (req, res) => {
  try {
    const joinRequest = await JoinRequest.findById(req.params.requestId)
      .populate('group')
      .populate('user');

    if (!joinRequest) {
      return res.status(404).json({ success: false, message: 'Join request not found' });
    }

    // Verify organizer
    const organizer = await Member.findOne({
      group: joinRequest.group._id,
      user: req.user.id,
      role: 'organizer'
    });

    if (!organizer) {
      return res.status(403).json({ success: false, message: 'Only organizer can approve requests' });
    }

    const group = joinRequest.group;

    // Count current members
    const currentMemberCount = await Member.countDocuments({
      group: group._id,
      status: 'active'
    });

    if (currentMemberCount >= group.groupSize) {
      return res.status(400).json({ success: false, message: 'Group is already full' });
    }

    // ---------------- RANDOM TURN ASSIGNMENT ------------------
    if (!group.takenPositions) group.takenPositions = [];

    const allPositions = Array.from({ length: group.groupSize }, (_, i) => i + 1);
    const availablePositions = allPositions.filter(pos => !group.takenPositions.includes(pos));

    if (availablePositions.length === 0) {
      return res.status(400).json({ success: false, message: 'No available positions left' });
    }

    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    const assignedTurn = availablePositions[randomIndex];

    // Save taken turn
    group.takenPositions.push(assignedTurn);
    await group.save();

    // Create Member with assigned turnOrder
    const member = new Member({
      user: joinRequest.user._id,
      group: group._id,
      role: 'member',
      status: 'active',
      turnOrder: assignedTurn
    });
    await member.save();

    // Update join request
    joinRequest.status = 'approved';
    joinRequest.approvedBy = req.user.id;
    joinRequest.approvedAt = new Date();
    await joinRequest.save();

    return res.json({
      success: true,
      message: 'Join request approved successfully',
      assignedTurn,
      member
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Organizer: Reject join request
router.post('/:requestId/reject', auth, async (req, res) => {
 try{
  //need to fixed
 }
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// User: Get their join request status for a group
router.get('/status/:groupId', auth, async (req, res) => {
  try {
    const joinRequest = await JoinRequest.findOne({
      group: req.params.groupId,
      user: req.user.id
    });

    if (!joinRequest) {
      return res.json({
        success: true,
        data: null // No request found
      });
    }

    res.json({
      success: true,
      data: joinRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;