const express = require('express');
const Invitation = require('../models/Invitation');
const Group = require('../models/Group');
const Member = require('../models/Member');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Send invitation
// Join group with access code
router.post('/join', auth, async (req, res) => {
  try {
    const { accessCode } = req.body;

    const invitation = await Invitation.findOne({
      accessCode,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('group');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired access code'
      });
    }

    // Check if group is full
    const currentMembers = await Member.countDocuments({ 
      group: invitation.group._id, 
      status: 'active' 
    });
    
    if (currentMembers >= invitation.group.groupSize) {
      return res.status(400).json({
        success: false,
        message: 'Group is already full'
      });
    }

    // Check if user is already a member
    const existingMember = await Member.findOne({
      group: invitation.group._id,
      user: req.user.id
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
    }

    // Create member WITHOUT turn order
    const member = new Member({
      user: req.user.id,
      group: invitation.group._id,
      role: invitation.role,
      status: 'active'
      // No turnOrder assigned yet
    });

    await member.save();

    // Update invitation status
    invitation.status = 'accepted';
    invitation.invitedUser = req.user.id;
    await invitation.save();

    res.json({
      success: true,
      message: 'Successfully joined the group',
      data: {
        group: invitation.group,
        member: {
          id: member._id,
          role: member.role
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

// Join group with access code
router.post('/join', auth, async (req, res) => {
  try {
    const { accessCode } = req.body;

    // First try to find the group directly using the access code
    const group = await Group.findOne({ accessCode });
    
    if (!group) {
      // If no group found, try to find by invitation
      const invitation = await Invitation.findOne({
        accessCode,
        status: 'pending',
        expiresAt: { $gt: new Date() }
      }).populate('group');

      if (!invitation) {
        return res.status(404).json({
          success: false,
          message: 'Invalid access code'
        });
      }
    }

    const targetGroup = group || invitation.group;

    // Check if group is full
    const currentMembers = await Member.countDocuments({ 
      group: targetGroup._id, 
      status: 'active' 
    });
    
    if (currentMembers >= targetGroup.groupSize) {
      return res.status(400).json({
        success: false,
        message: 'Group is already full'
      });
    }

    // Check if user is already a member
    const existingMember = await Member.findOne({
      group: targetGroup._id,
      user: req.user.id
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this group'
      });
    }

    // Create member
    const member = new Member({
      user: req.user.id,
      group: targetGroup._id,
      role: 'member',
      status: 'active',
      turnOrder: currentMembers + 1
    });

    await member.save();

    // If there was an invitation, update it
    if (invitation) {
      invitation.status = 'accepted';
      invitation.invitedUser = req.user.id;
      await invitation.save();
    }

    // Populate and return group details
    const populatedGroup = await Group.findById(targetGroup._id)
      .populate('organizer', 'name email');

    res.json({
      success: true,
      message: 'Successfully joined the group',
      data: {
        group: populatedGroup,
        member: {
          id: member._id,
          role: member.role
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

// Get pending invitations for user
router.get('/my-invitations', auth, async (req, res) => {
  try {
    const invitations = await Invitation.find({
      email: req.user.email,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('group').populate('invitedBy', 'name email');

    res.json({
      success: true,
      data: invitations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get group invitations (for organizer)
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const invitations = await Invitation.find({
      group: req.params.groupId
    }).populate('invitedBy', 'name email').populate('invitedUser', 'name email');

    res.json({
      success: true,
      data: invitations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;