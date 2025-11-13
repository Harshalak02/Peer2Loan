const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  accessCode: {
    type: String,
    unique: true,
    sparse: true
  },
  invitationSettings: {
    requireApproval: { type: Boolean, default: true },
    allowInvites: { type: Boolean, default: true },
    maxMembers: { type: Number }
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  monthlyContribution: {
    type: Number,
    required: true,
    min: 0
  },
  groupSize: {
    type: Number,
    required: true,
    min: 2
  },
  duration: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  paymentWindow: {
    startDay: { type: Number, min: 1, max: 31, default: 1 },
    endDay: { type: Number, min: 1, max: 31, default: 7 }
  },
  turnOrderPolicy: {
    type: String,
    enum: ['fixed', 'random', 'need-based', 'seniority'],
    default: 'fixed'
  },

  penaltyRules: {
    lateFee: { type: Number, default: 0 },
    gracePeriod: { type: Number, default: 0 },
    autoApply: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['setup', 'active', 'completed', 'cancelled'],
    default: 'setup'
  },
  currentCycle: {
    type: Number,
    default: 0
  },
  totalPot: {
    type: Number,
    default: 0
  },
   turnsAssigned: {
    type: Boolean,
    default: false
  },
  turnAssignmentDate: {
    type: Date
  },
  rules: {
    allowTurnReassignment: { type: Boolean, default: false },
    autoReminders: { type: Boolean, default: true },
    requirePaymentProof: { type: Boolean, default: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

groupSchema.pre('save', function(next) {
  if (!this.accessCode) {
    // Generate a 6-character access code
    this.accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Group', groupSchema);