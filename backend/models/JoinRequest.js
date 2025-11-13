const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accessCode: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date
});

// Ensure one pending request per user per group
joinRequestSchema.index({ group: 1, user: 1, status: 1 });

module.exports = mongoose.model('JoinRequest', joinRequestSchema);
