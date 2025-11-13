const express = require('express');
const { createGroup, getUserGroups, getGroupDetails, startGroup } = require('../controllers/groupController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, createGroup);
router.get('/my-groups', auth, getUserGroups);
router.get('/:id', auth, getGroupDetails);
router.post('/:id/start', auth, startGroup);
// Assign turns to members (when group is full)
router.post('/:id/assign-turns', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is organizer
    const organizer = await Member.findOne({
      group: req.params.id,
      user: req.user.id,
      role: 'organizer'
    });

    if (!organizer) {
      return res.status(403).json({
        success: false,
        message: 'Only organizer can assign turns'
      });
    }

    // Check if turns are already assigned
    if (group.turnsAssigned) {
      return res.status(400).json({
        success: false,
        message: 'Turns have already been assigned for this group'
      });
    }

    // Get all active members
    const members = await Member.find({
      group: req.params.id,
      status: 'active'
    });

    // Check if group is full
    if (members.length < group.groupSize) {
      return res.status(400).json({
        success: false,
        message: `Group is not full yet. ${members.length}/${group.groupSize} members joined.`
      });
    }

    let turnOrder;

    // Assign turns based on group's turn order policy
    switch (group.turnOrderPolicy) {
      case 'random':
        // Random shuffle
        turnOrder = Array.from({ length: members.length }, (_, i) => i + 1);
        for (let i = turnOrder.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [turnOrder[i], turnOrder[j]] = [turnOrder[j], turnOrder[i]];
        }
        break;

      case 'seniority':
        // By join date (earliest join gets lower turn number)
        const sortedByJoinDate = [...members].sort((a, b) => 
          new Date(a.joinedAt) - new Date(b.joinedAt)
        );
        turnOrder = sortedByJoinDate.map((_, i) => i + 1);
        break;

      case 'need-based':
        // Organizer manually assigns (we'll implement this separately)
        return res.status(400).json({
          success: false,
          message: 'Need-based turn assignment requires manual setup by organizer'
        });

      case 'fixed':
      default:
        // Sequential order (1, 2, 3, ...)
        turnOrder = Array.from({ length: members.length }, (_, i) => i + 1);
        break;
    }

    // Assign turns to members
    for (let i = 0; i < members.length; i++) {
      members[i].turnOrder = turnOrder[i];
      await members[i].save();
    }

    // Update group status
    group.turnsAssigned = true;
    group.turnAssignmentDate = new Date();
    group.status = 'active'; // Group can now start
    await group.save();

    res.json({
      success: true,
      message: `Turns assigned successfully using ${group.turnOrderPolicy} policy`,
      data: {
        turnsAssigned: true,
        turnOrderPolicy: group.turnOrderPolicy,
        members: members.map(member => ({
          name: member.user?.name,
          turnOrder: member.turnOrder
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
module.exports = router;