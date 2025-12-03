const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email address",
    ],
  },
  phone: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    // REQUIRED CHANGE: Only require password if googleId is missing
    required: function () {
      return !this.googleId;
    },
    minlength: 6,
  },
  googleId: {
    // ADD THIS
    type: String,
    unique: true,
    sparse: true,
  },
  profile: {
    avatar: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
    },
  },
  notifications: [
    {
      message: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: [
          "payment_received",
          "pot_collected",
          "payment_due",
          "cycle_started",
          "cycle_completed",
          "general",
        ],
        default: "general",
      },
      groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
      cycleNumber: Number,
      amount: Number,
      isRead: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active",
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword) {
  // IMPORTANT: Update correctPassword to handle users without passwords
  if (!this.password) return false; // Google users cannot login with password
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model("User", userSchema);
