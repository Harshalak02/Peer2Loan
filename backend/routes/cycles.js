const express = require("express");
const Cycle = require("../models/Cycle");
const Group = require("../models/Group");
const Member = require("../models/Member");
const auth = require("../middleware/auth");
const router = express.Router();

// Get cycles for group
router.get("/group/:groupId", auth, async (req, res) => {
  try {
    const cycles = await Cycle.find({ group: req.params.groupId })
      .populate("payoutRecipient")
      .sort("cycleNumber")
      .lean();

    // Populate member user info for payments
    for (const cycle of cycles) {
      if (Array.isArray(cycle.payments)) {
        for (const p of cycle.payments) {
          // populate member -> user
          const member = await Member.findById(p.member).populate(
            "user",
            "name email"
          );
          p.member = member;
          p.user = member?.user;
        }
      }
    }

    res.json({
      success: true,
      data: cycles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get current cycle for group
router.get("/group/:groupId/current", auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    const cycle = await Cycle.findOne({
      group: req.params.groupId,
      cycleNumber: group.currentCycle,
    }).populate("payoutRecipient");

    if (cycle) {
      // populate payments member->user
      if (Array.isArray(cycle.payments)) {
        for (const p of cycle.payments) {
          const member = await Member.findById(p.member).populate(
            "user",
            "name email"
          );
          p.member = member;
          p.user = member?.user;
        }
      }
    }

    res.json({
      success: true,
      data: cycle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get turn-based status for all cycles (for Dashboard display)
router.get("/turn-status", auth, async (req, res) => {
  try {
    // Get all groups where user is a member
    const userMemberships = await Member.find({
      user: req.user.id,
      status: "active",
    }).populate("group");

    const turnStatusData = [];

    for (const membership of userMemberships) {
      const group = membership.group;

      // Get active cycle for this group
      const activeCycle = await Cycle.findOne({
        group: group._id,
        status: "active",
      });

      if (activeCycle) {
        // Get all members with their turn orders and payment status
        const allMembers = await Member.find({
          group: group._id,
          status: "active",
        })
          .populate("user", "name email")
          .sort("turnOrder");

        // Get current cycle recipient
        const currentRecipient = allMembers.find(
          (m) => m.turnOrder === activeCycle.cycleNumber
        );

        // Build payment status for all members
        const memberPaymentStatus = allMembers.map((member) => {
          const payment = activeCycle.payments.find(
            (p) => p.member.toString() === member._id.toString()
          );

          return {
            memberId: member._id,
            memberName: member.user?.name,
            memberEmail: member.user?.email,
            turnOrder: member.turnOrder,
            isCurrentTurn: member.turnOrder === activeCycle.cycleNumber,
            isCurrentUser: member.user._id.toString() === req.user.id,
            paymentStatus: payment
              ? {
                  paid: !!payment.paidAt,
                  verified: !!payment.verified,
                  amount: payment.amount,
                  paidAt: payment.paidAt,
                  proof: payment.proof,
                }
              : {
                  paid: false,
                  verified: false,
                  amount: 0,
                  paidAt: null,
                  proof: null,
                },
          };
        });

        turnStatusData.push({
          groupId: group._id,
          groupName: group.name,
          cycleNumber: activeCycle.cycleNumber,
          cycleId: activeCycle._id,
          currentRecipient: currentRecipient
            ? {
                memberId: currentRecipient._id,
                memberName: currentRecipient.user?.name,
                turnOrder: currentRecipient.turnOrder,
                isCurrentUser:
                  currentRecipient.user._id.toString() === req.user.id,
              }
            : null,
          memberPaymentStatus,
          totalMembers: allMembers.length,
          paidMembers: activeCycle.payments.filter((p) => p.paidAt).length,
          verifiedPayments: activeCycle.payments.filter((p) => p.verified)
            .length,
        });
      }
    }

    res.json({
      success: true,
      data: turnStatusData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
