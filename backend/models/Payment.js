const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  cycle: { type: mongoose.Schema.Types.ObjectId, ref: "Cycle" },
  name: { type: String }, // optional payer name / display
  amount: { type: Number, default: 0 },
  transactionId: { type: String, index: true }, // merchantOrderId
  status: {
    type: String,
    enum: ["PENDING", "SUCCESS", "FAILED"],
    default: "PENDING",
  },
  provider: { type: String, default: "phonepe" },
  paymentUrl: { type: String }, // redirect URL returned by PhonePe
  completedAt: { type: Date },
  proofUrl: { type: String },
  notes: { type: String },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", paymentSchema);
