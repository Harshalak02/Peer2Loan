const mongoose = require('mongoose');

const cycleSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  cycleNumber: {
    type: Number,
    required: true,
    min: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  payoutDate: {
    type: Date,
    required: true
  },
  payoutRecipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  potAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  payments: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    amount: Number,
    paidAt: Date,
    status: String,
    proof: String,
    penalty: Number,
    verified: { type: Boolean, default: false },
    notes: String,
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true }
  }],
  payout: {
    executed: { type: Boolean, default: false },
    executedAt: Date,
    proof: String,
    notes: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

cycleSchema.index({ group: 1, cycleNumber: 1 }, { unique: true });

module.exports = mongoose.model('Cycle', cycleSchema);