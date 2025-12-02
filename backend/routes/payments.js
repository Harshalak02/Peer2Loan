const express = require("express");
const Cycle = require("../models/Cycle");
const Member = require("../models/Member");
const User = require("../models/User");
const Group = require("../models/Group");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// ⚡ GLOBAL: Track recent auto-verify operations to prevent duplicates
const recentAutoVerifyOperations = new Map();
const OPERATION_COOLDOWN = 30000; // 30 seconds

// Clean up old operations every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of recentAutoVerifyOperations.entries()) {
    if (now - timestamp > OPERATION_COOLDOWN) {
      recentAutoVerifyOperations.delete(key);
    }
  }
}, 5 * 60 * 1000);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads/payments");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Helper function to create notifications
const createNotification = async (userId, notificationData, req = null) => {
  try {
    const user = await User.findById(userId);
    if (!user) return false;

    // Add timestamp and ID to notification
    const notification = {
      ...notificationData,
      isRead: false,
      createdAt: new Date(),
    };

    user.notifications.push(notification);
    await user.save();

    // Emit notification via socket if WebSocket is available
    let io = null;
    if (req && req.app) {
      io = req.app.get("io");
    }

    if (io) {
      // Emit with the saved notification (including _id)
      const savedNotification =
        user.notifications[user.notifications.length - 1];
      io.to(`user_${userId}`).emit("new_notification", {
        ...notification,
        _id: savedNotification._id,
      });
    }

    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
};

// Record payment with proof upload
router.post("/", auth, upload.single("proof"), async (req, res) => {
  try {
    const { cycleId, amount, notes } = req.body;
    const proofUrl = req.file ? `/uploads/payments/${req.file.filename}` : null;

    const cycle = await Cycle.findById(cycleId);
    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: "Cycle not found",
      });
    }

    const member = await Member.findOne({
      user: req.user.id,
      group: cycle.group,
    }).populate("user", "name");

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    // Check if payment already exists
    const existingPayment = cycle.payments.find(
      (p) => p.member.toString() === member._id.toString()
    );

    if (existingPayment) {
      existingPayment.amount = amount;
      existingPayment.paidAt = new Date();
      existingPayment.status = "paid";
      existingPayment.proof = proofUrl;
      existingPayment.notes = notes;
      existingPayment.verified = false;
    } else {
      cycle.payments.push({
        member: member._id,
        amount,
        paidAt: new Date(),
        status: "paid",
        proof: proofUrl,
        notes,
        verified: false,
      });
    }

    await cycle.save();

    // Get group details and notify organizer about payment submission
    const group = await Group.findById(cycle.group);
    const organizers = await Member.find({
      group: cycle.group,
      role: "organizer",
    }).populate("user");

    // Send notification to organizers
    for (const organizer of organizers) {
      if (organizer.user._id.toString() !== req.user.id) {
        await createNotification(
          organizer.user._id,
          {
            message: `${
              member.user?.name || "A member"
            } submitted payment proof for Cycle ${cycle.cycleNumber} in ${
              group?.name
            }`,
            type: "payment_received",
            groupId: group._id,
            cycleNumber: cycle.cycleNumber,
            amount: parseInt(amount),
          },
          req
        );
      }
    }

    res.json({
      success: true,
      message: "Payment recorded successfully",
      proofUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Verify payment (organizer only)
router.post("/verify", auth, async (req, res) => {
  try {
    const { cycleId, paymentId } = req.body;
    const cycle = await Cycle.findById(cycleId);
    if (!cycle) {
      return res
        .status(404)
        .json({ success: false, message: "Cycle not found" });
    }
    const payment = cycle.payments.id(paymentId);
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    // Get member and group details before verifying
    const payingMember = await Member.findById(payment.member).populate(
      "user",
      "name"
    );
    const group = await Group.findById(cycle.group);

    payment.verified = true;
    await cycle.save();

    // Get recipient member (whose turn it is)
    const recipient = await Member.findOne({
      group: cycle.group,
      turnOrder: cycle.cycleNumber,
      status: "active",
    }).populate("user", "name");

    // Notify the recipient about verified payment
    if (recipient) {
      await createNotification(
        recipient.user._id,
        {
          message: `Payment from ${
            payingMember?.user?.name || "a member"
          } verified for Cycle ${cycle.cycleNumber} in ${group?.name}`,
          type: "payment_received",
          groupId: group._id,
          cycleNumber: cycle.cycleNumber,
          amount: payment.amount,
        },
        req
      );
    }

    // Check if all payments are verified and cycle can be completed
    const allMembers = await Member.find({
      group: cycle.group,
      status: "active",
    });
    const verifiedPayments = cycle.payments.filter((p) => p.verified);

    if (verifiedPayments.length === allMembers.length) {
      // All payments verified - notify about pot collection
      for (const member of allMembers) {
        if (member._id.toString() !== recipient?._id.toString()) {
          await createNotification(
            member.user,
            {
              message: `All payments collected! ${
                recipient?.user?.name || "Member"
              } received the pot for Cycle ${cycle.cycleNumber} in ${
                group?.name
              }`,
              type: "pot_collected",
              groupId: group._id,
              cycleNumber: cycle.cycleNumber,
              amount: verifiedPayments.reduce((sum, p) => sum + p.amount, 0),
            },
            req
          );
        }
      }
    }

    res.json({ success: true, message: "Payment verified" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// (Serving of uploaded files is handled at app level in server.js)

// Auto-verify payment after successful PhonePe transaction
router.post("/auto-verify", auth, async (req, res) => {
  try {
    const { transactionId, cycleId, amount } = req.body;

    // ⚡ GLOBAL DUPLICATE CHECK: Create operation key
    const operationKey = `${req.user.id}:${cycleId}:${transactionId}`;
    const now = Date.now();

    if (recentAutoVerifyOperations.has(operationKey)) {
      const lastOperation = recentAutoVerifyOperations.get(operationKey);
      if (now - lastOperation < OPERATION_COOLDOWN) {
        console.log(
          `  → ⚠️ GLOBAL DUPLICATE BLOCKED: Operation ${operationKey} within ${
            (now - lastOperation) / 1000
          }s`
        );
        return res.json({
          success: true,
          message: "Auto-verify operation already in progress",
          duplicate: true,
        });
      }
    }

    // Mark this operation as in progress
    recentAutoVerifyOperations.set(operationKey, now);

    // Fetch the cycle with group details
    const cycle = await Cycle.findById(cycleId).populate("group", "name");
    if (!cycle) {
      return res
        .status(404)
        .json({ success: false, message: "Cycle not found" });
    }

    // Find the member based on logged-in user
    const member = await Member.findOne({
      user: req.user.id,
      group: cycle.group._id,
    }).populate("user", "name");
    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    // Find the recipient (member whose turn it is this cycle)
    const recipient = await Member.findOne({
      group: cycle.group._id,
      turnOrder: cycle.cycleNumber,
      status: "active",
    }).populate("user", "name");

    console.log(`  → 🔍 Cycle Details:`, {
      cycleNumber: cycle.cycleNumber,
      groupId: cycle.group._id,
    });
    console.log(
      `  → 👤 Recipient Found:`,
      recipient
        ? {
            name: recipient.user?.name,
            turnOrder: recipient.turnOrder,
            id: recipient._id,
          }
        : null
    );

    console.log("🔍 Auto-verify Debug:");
    console.log("  → Transaction ID:", transactionId);
    console.log("  → Member ID:", member._id);
    console.log("  → Cycle ID:", cycleId);
    console.log(
      "  → Existing payments:",
      cycle.payments.map((p) => ({
        member: p.member,
        amount: p.amount,
        verified: p.verified,
        proof: p.proof,
      }))
    );

    // ⚡ CRITICAL: Check if payment with this transaction ID already exists
    const existingTransactionPayment = cycle.payments.find(
      (p) => p.proof === `phonepe:${transactionId}`
    );

    if (existingTransactionPayment) {
      console.log(
        "  → ⚠️ DUPLICATE BLOCKED: Payment already exists for transaction ID"
      );
      return res.json({
        success: true,
        message: "Payment already processed for this transaction",
        duplicate: true, // Flag to indicate this was a duplicate request
      });
    }

    // ⚡ ADDITIONAL: Check if this member already made a payment in the last 30 seconds
    const recentPayment = cycle.payments.find(
      (p) =>
        p.member.toString() === member._id.toString() &&
        p.verified === true &&
        new Date() - p.paidAt < 30000 // Less than 30 seconds ago
    );

    if (recentPayment) {
      console.log(
        "  → ⚠️ DUPLICATE BLOCKED: Recent payment found within 30 seconds"
      );
      return res.json({
        success: true,
        message: "Recent payment already processed",
        duplicate: true,
      });
    }

    // Check if already paid entry exists for this member
    const existingPayment = cycle.payments.find(
      (p) => p.member.toString() === member._id.toString()
    );

    console.log("  → Found existing payment:", !!existingPayment);

    if (existingPayment) {
      // Update existing payment
      console.log("  → Updating existing payment");
      existingPayment.amount = amount;
      existingPayment.paidAt = new Date();
      existingPayment.status = "paid";
      existingPayment.verified = true; // ✅ instantly mark verified
      existingPayment.proof = `phonepe:${transactionId}`; // optional mark source
    } else {
      // Add new verified payment
      console.log("  → Adding new payment");
      cycle.payments.push({
        member: member._id,
        amount,
        paidAt: new Date(),
        status: "paid",
        verified: true,
        proof: `phonepe:${transactionId}`,
      });
    }

    await cycle.save();

    // Create notification for the recipient ONLY if someone ELSE is paying for their cycle
    if (recipient && recipient.user._id.toString() !== req.user.id) {
      const User = require("../models/User");
      const recipientUser = await User.findById(recipient.user._id);
      if (recipientUser) {
        // Check for duplicate notification to prevent multiple notifications for same transaction
        const existingNotification = recipientUser.notifications.find(
          (n) =>
            n.type === "payment_received" &&
            n.groupId?.toString() === cycle.group._id.toString() &&
            n.cycleNumber === cycle.cycleNumber &&
            n.amount === amount &&
            Math.abs(new Date() - n.createdAt) < 60000 // Within last minute
        );

        if (!existingNotification) {
          const notification = {
            message: `Payment of ₹${amount} received from ${
              member.user?.name || "Someone"
            } for cycle ${cycle.cycleNumber} in group "${cycle.group.name}"`,
            type: "payment_received",
            groupId: cycle.group._id,
            cycleNumber: cycle.cycleNumber,
            amount: amount,
            isRead: false,
          };

          recipientUser.notifications.push(notification);
          await recipientUser.save();

          // Emit real-time notification via WebSocket
          const io = req.app.get("io");
          if (io) {
            io.to(`user_${recipient.user._id}`).emit("new_notification", {
              ...notification,
              _id: recipientUser.notifications[
                recipientUser.notifications.length - 1
              ]._id,
              createdAt: new Date(),
            });
          }
        }
      }
    }

    // Also notify all other group members about the payment (only if someone is paying for another person's cycle)
    if (recipient && recipient.user._id.toString() !== req.user.id) {
      const Member = require("../models/Member");
      const allMembers = await Member.find({
        group: cycle.group._id,
        status: "active",
      }).populate("user", "name");

      const io = req.app.get("io");
      if (io) {
        for (const groupMember of allMembers) {
          if (
            groupMember.user._id.toString() !== req.user.id &&
            groupMember.user._id.toString() !== recipient.user._id.toString()
          ) {
            const User = require("../models/User");
            const memberUser = await User.findById(groupMember.user._id);
            if (memberUser) {
              const notification = {
                message: `${
                  member.user?.name || "Someone"
                } made a payment of ₹${amount} for ${
                  recipient.user?.name || "someone"
                }'s cycle ${cycle.cycleNumber} in group "${cycle.group.name}"`,
                type: "general",
                groupId: cycle.group._id,
                cycleNumber: cycle.cycleNumber,
                amount: amount,
                isRead: false,
              };

              memberUser.notifications.push(notification);
              await memberUser.save();

              // Emit real-time notification
              io.to(`user_${groupMember.user._id}`).emit("new_notification", {
                ...notification,
                _id: memberUser.notifications[
                  memberUser.notifications.length - 1
                ]._id,
                createdAt: new Date(),
              });
            }
          }
        }
      }
    }

    // ✨ FINAL STEP: CHECK IF POT IS FULLY COLLECTED - Send completion notification AFTER all payment notifications
    const Group = require("../models/Group");
    const groupDetails = await Group.findById(cycle.group._id);
    console.log(`  → 🔄 Starting pot collection check...`);
    console.log(`  → Group found:`, !!groupDetails);
    console.log(`  → Recipient found:`, !!recipient);

    if (groupDetails && recipient) {
      console.log(
        `  → ✅ Both group and recipient found, proceeding with pot check...`
      );
      // Calculate total collected for this cycle (excluding recipient's payment if any)
      const totalCollected = cycle.payments
        .filter(
          (p) => p.verified && p.member.toString() !== recipient._id.toString()
        )
        .reduce((sum, p) => sum + p.amount, 0);

      const expectedAmount = groupDetails.monthlyContribution;
      const expectedTotal = expectedAmount * (groupDetails.groupSize - 1); // Exclude recipient

      console.log(
        `  → 🎯 Pot Check: Collected ₹${totalCollected} / Expected ₹${expectedTotal}`
      );
      console.log(`  → Group Details:`, {
        monthlyContribution: groupDetails.monthlyContribution,
        amount: groupDetails.amount,
        groupSize: groupDetails.groupSize,
        expectedAmount,
      });
      console.log(`  → Recipient:`, {
        id: recipient._id,
        name: recipient.user?.name,
        turnOrder: recipient.turnOrder,
      });
      console.log(
        `  → Filtered Payments:`,
        cycle.payments
          .filter(
            (p) =>
              p.verified && p.member.toString() !== recipient._id.toString()
          )
          .map((p) => ({
            member: p.member,
            amount: p.amount,
            verified: p.verified,
          }))
      );

      if (totalCollected >= expectedTotal) {
        console.log(`  → 🎉 POT IS FULLY COLLECTED! Sending notification...`);
        // Pot is fully collected! Send completion notification to recipient
        const User = require("../models/User");
        const recipientUser = await User.findById(recipient.user._id);

        if (recipientUser) {
          console.log(`  → 📧 Recipient user found: ${recipientUser.name}`);
          // Check if completion notification already sent
          const existingCompletionNotification =
            recipientUser.notifications.find(
              (n) =>
                n.type === "pot_collected" &&
                n.groupId?.toString() === cycle.group._id.toString() &&
                n.cycleNumber === cycle.cycleNumber
            );

          console.log(
            `  → 🔍 Existing completion notification:`,
            !!existingCompletionNotification
          );

          if (!existingCompletionNotification) {
            console.log(
              `  → ✅ No existing notification found, creating new one...`
            );
            const completionNotification = {
              message: `🎉 Pot collected successfully for "${cycle.group.name}"! ₹${totalCollected} collected for your cycle ${cycle.cycleNumber}.`,
              type: "pot_collected",
              groupId: cycle.group._id,
              cycleNumber: cycle.cycleNumber,
              amount: totalCollected,
              isRead: false,
            };

            recipientUser.notifications.push(completionNotification);
            await recipientUser.save();

            // Emit real-time notification via WebSocket with slight delay to ensure it comes after payment notifications
            const io = req.app.get("io");
            if (io) {
              setTimeout(() => {
                io.to(`user_${recipient.user._id}`).emit("new_notification", {
                  ...completionNotification,
                  _id: recipientUser.notifications[
                    recipientUser.notifications.length - 1
                  ]._id,
                  createdAt: new Date(),
                });
              }, 1000); // 1 second delay to ensure it appears after payment notification
            }

            console.log(
              `  → ✅ Pot collection notification scheduled for ${recipient.user.name}`
            );
          }
        }
      }
    }

    res.json({
      success: true,
      message: "Payment auto-verified successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
