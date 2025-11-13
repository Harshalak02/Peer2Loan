const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: String,
    required: true
  },
  accessCode: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'accepted', 'expired'],
    default: 'pending'
  },
  requestMessage: {
    type: String
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  role: {
    type: String,
    enum: ['member', 'co-organizer'],
    default: 'member'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

invitationSchema.index({ group: 1, email: 1 }, { unique: true });
invitationSchema.index({ accessCode: 1 }, { unique: true });

module.exports = mongoose.model('Invitation', invitationSchema);