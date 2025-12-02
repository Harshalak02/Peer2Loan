// backend/routes/phonepeRoutes.js
const express = require("express");
const {
  StandardCheckoutClient,
  Env,
  MetaInfo,
  StandardCheckoutPayRequest,
} = require("pg-sdk-node");
const { randomUUID } = require("crypto");
require("dotenv").config();
const Payment = require("../models/Payment");

const router = express.Router();

// Initialize PhonePe client (sandbox)
const client = StandardCheckoutClient.getInstance(
  process.env.PHONEPE_CLIENT_ID,
  process.env.PHONEPE_CLIENT_SECRET,
  Number(process.env.PHONEPE_CLIENT_VERSION || 1),
  Env.SANDBOX
);

// create a payment and return redirect url

// get payment status by transactionId
router.get("/status/:transactionId", async (req, res) => {
  try {
    const tid = req.params.transactionId;
    // Try to query PhonePe for order status using SDK
    let response;
    try {
      response = await client.getOrderStatus(tid);
    } catch (sdkErr) {
      console.warn("PhonePe SDK getOrderStatus failed", sdkErr);
    }

    const p = await Payment.findOne({ transactionId: tid });
    if (!p)
      return res.status(404).json({ success: false, message: "Not found" });

    if (response && response.state) {
      if (response.state === "COMPLETED") {
        p.status = "SUCCESS";
        p.verified = true; // mark verified on successful gateway confirmation
        p.completedAt = p.completedAt || new Date();
      } else if (response.state === "FAILED") {
        p.status = "FAILED";
      } else {
        p.status = "PENDING";
      }
      await p.save();
    }

    res.json({
      success: true,
      transactionId: p.transactionId,
      status: p.status,
      completedAt: p.completedAt,
      amount: p.amount,
      name: p.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
