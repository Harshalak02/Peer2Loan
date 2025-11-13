const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cycle: { type: mongoose.Schema.Types.ObjectId, ref: 'Cycle', required: true },
  amount: { type: Number, default: 0 },
  proofUrl: { type: String },
  notes: { type: String },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
