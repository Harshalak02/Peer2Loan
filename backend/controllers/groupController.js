const Group = require('../models/Group');
const Member = require('../models/Member');
const Cycle = require('../models/Cycle');

const createGroup = async (req, res) => {
  try {
    const groupData = {
      ...req.body,
      organizer: req.user.id
    };

    const group = new Group(groupData);
    await group.save();

    // Add organizer as member
    const organizerMember = new Member({
      user: req.user.id,
      group: group._id,
      role: 'organizer',
      status: 'active',
      turnOrder: 1
    });
    await organizerMember.save();

    // Populate the group with organizer details
    await group.populate('organizer', 'name email');

    // Generate cycles immediately after group creation
    await generateCycles(group);

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: {
        group: {
          ...group.toObject(),
          accessCode: group.accessCode // Include access code in response
        },
        member: organizerMember
      }
    });
  } catch (error) {
    console.error('Group creation error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create group'
    });
  }
};

const getUserGroups = async (req, res) => {
  try {
    const members = await Member.find({ user: req.user.id })
      .populate('group')
      .populate('user', 'name email');

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
};

// const getGroupDetails = async (req, res) => {
//   try {
//     const group = await Group.findById(req.params.id)
//       .populate('organizer', 'name email');
      
//     if (!group) {
//       return res.status(404).json({
//         success: false,
//         message: 'Group not found'
//       });
//     }

//     // Find the requesting user's membership
//     const membership = await Member.findOne({
//       group: req.params.id,
//       user: req.user.id
//     });

//     if (!membership) {
//       return res.status(403).json({
//         success: false,
//         message: 'You are not a member of this group'
//       });
//     }

//     // Get all members of the group
//     const members = await Member.find({ group: req.params.id })
//       .populate('user', 'name email phone');
      
//     // Get all cycles of the group
//     const cycles = await Cycle.find({ group: req.params.id })
//       .populate('payoutRecipient')
//       .sort({ cycleNumber: 1 });

//     const isOrganizer = membership.role === 'organizer';

//     // Prepare group data
//     const groupData = group.toObject();
    
//     // Only include access code if user is the organizer
//     if (!isOrganizer) {
//       delete groupData.accessCode;
//     }

//     res.json({
//       success: true,
//       data: {
//         group: groupData,
//         members,
//         cycles,
//         currentUser: {
//           isOrganizer,
//           membership: membership.toObject()
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching group details:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch group details'
//     });
//   }
// };

const getGroupDetails = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('organizer', 'name email');
      
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Find the requesting user's membership
    const membership = await Member.findOne({
      group: req.params.id,
      user: req.user.id
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    // GET ALL MEMBERS SORTED BY TURN ORDER
    const members = await Member.find({ group: req.params.id })
      .populate('user', 'name email phone')
      .sort({ turnOrder: 1 });   //  <-- IMPORTANT FIX

    // Get all cycles of the group
    const cycles = await Cycle.find({ group: req.params.id })
      .populate('payoutRecipient')
      .sort({ cycleNumber: 1 });

    const isOrganizer = membership.role === 'organizer';

    // Prepare group data
    const groupData = group.toObject();
    
    // Only include access code if user is the organizer
    if (!isOrganizer) {
      delete groupData.accessCode;
    }

    res.json({
      success: true,
      data: {
        group: groupData,
        members,
        cycles,
        currentUser: {
          isOrganizer,
          membership: membership.toObject()
        }
      }
    });
  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group details'
    });
  }
};


const startGroup = async (req, res) => {
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
        message: 'Only organizer can start the group'
      });
    }

    // Verify all conditions are met
    const activeMembers = await Member.countDocuments({
      group: req.params.id,
      status: 'active'
    });

    if (activeMembers < group.groupSize) {
      return res.status(400).json({
        success: false,
        message: `Need ${group.groupSize} active members to start, currently have ${activeMembers}`
      });
    }

    // Generate cycles
    await generateCycles(group);

    group.status = 'active';
    group.currentCycle = 1;
    await group.save();

    res.json({
      success: true,
      message: 'Group started successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to generate cycles
async function generateCycles(group) {
  const cycles = [];
  const startDate = new Date(group.startDate);

  for (let i = 1; i <= group.duration; i++) {
    const cycleStart = new Date(startDate);
    cycleStart.setMonth(cycleStart.getMonth() + i - 1);

    const cycleEnd = new Date(cycleStart);
    cycleEnd.setDate(cycleEnd.getDate() + group.paymentWindow.endDay);

    const payoutDate = new Date(cycleEnd);
    payoutDate.setDate(payoutDate.getDate() + 1);

    cycles.push({
      group: group._id,
      cycleNumber: i,
      startDate: cycleStart,
      endDate: cycleEnd,
      payoutDate: payoutDate,
      potAmount: group.monthlyContribution * group.groupSize,
      status: i === 1 ? 'active' : 'upcoming'
    });
  }

  await Cycle.insertMany(cycles);
}

module.exports = {
  createGroup,
  getUserGroups,
  getGroupDetails,
  startGroup
};