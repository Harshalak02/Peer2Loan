const express = require("express");
const Cycle = require("../models/Cycle");
const Member = require("../models/Member");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

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
    });

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
    payment.verified = true;
    await cycle.save();
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

    // Fetch the cycle
    const cycle = await Cycle.findById(cycleId);
    if (!cycle) {
      return res
        .status(404)
        .json({ success: false, message: "Cycle not found" });
    }

    // Find the member based on logged-in user
    const member = await Member.findOne({
      user: req.user.id,
      group: cycle.group,
    });
    if (!member) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not a member of this group",
        });
    }

    // Check if already paid entry exists
    const existingPayment = cycle.payments.find(
      (p) => p.member.toString() === member._id.toString()
    );

    if (existingPayment) {
      // Update existing payment
      existingPayment.amount = amount;
      existingPayment.paidAt = new Date();
      existingPayment.status = "paid";
      existingPayment.verified = true; // ✅ instantly mark verified
      existingPayment.proof = `phonepe:${transactionId}`; // optional mark source
    } else {
      // Add new verified payment
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

    res.json({
      success: true,
      message: "Payment auto-verified successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
