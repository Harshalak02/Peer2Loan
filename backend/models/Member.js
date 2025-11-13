const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  role: {
    type: String,
    enum: ['organizer', 'member'],
    default: 'member'
  },
  turnOrder: {
    type: Number,
    min: 1
  },
  payoutAccount: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    upiId: String
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'removed'],
    default: 'pending'
  },
  contact: {
    phone: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  contributions: [{
    cycle: Number,
    amount: Number,
    paidAt: Date,
    status: {
      type: String,
      enum: ['pending', 'paid', 'late', 'missed']
    },
    proof: String,
    penalty: {
      amount: Number,
      reason: String,
      appliedAt: Date
    }
  }],
  payouts: [{
    cycle: Number,
    amount: Number,
    receivedAt: Date,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled']
    },
    proof: String
  }],
  netPosition: {
    type: Number,
    default: 0
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

memberSchema.index({ user: 1, group: 1 }, { unique: true });

module.exports = mongoose.model('Member', memberSchema);