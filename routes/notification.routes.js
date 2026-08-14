const express = require("express");
const router = express.Router();
const {
  getAllNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notification.controller");

router.get("/", getAllNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

module.exports = router;
