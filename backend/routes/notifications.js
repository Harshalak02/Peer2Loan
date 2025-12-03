const express = require("express");
const User = require("../models/User");
const Group = require("../models/Group");
const Member = require("../models/Member");
const auth = require("../middleware/auth");
const router = express.Router();

// Get all notifications for the logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("notifications.groupId", "name")
      .select("notifications");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Sort notifications by creation date (newest first)
    const notifications = user.notifications.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get unread notification count
router.get("/unread-count", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("notifications");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const unreadCount = user.notifications.filter(
      (notification) => !notification.isRead
    ).length;

    res.json({
      success: true,
      data: { count: unreadCount },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Mark a specific notification as read
router.patch("/:notificationId/read", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const notification = user.notifications.id(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true;
    await user.save();

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Mark all notifications as read
router.patch("/mark-all-read", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.notifications.forEach((notification) => {
      notification.isRead = true;
    });

    await user.save();

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Helper function to create notification (used by other routes)
const createNotification = async (userId, notificationData) => {
  try {
    const user = await User.findById(userId);
    if (!user) return false;

    user.notifications.push(notificationData);
    await user.save();
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
};

// Export the helper function for use in other routes
router.createNotification = createNotification;

module.exports = router;
