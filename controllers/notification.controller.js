const Notification = require("../models/notification.model");

const getAllNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead, type } = req.query;

    const filter = {};
    if (isRead !== undefined) filter.isRead = isRead === "true";
    if (type) filter.type = type;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 20, 1);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Notification.countDocuments(filter),
      Notification.countDocuments({ isRead: false }),
    ]);

    res.status(200).json({
      status: "ok",
      message: "Fetched notifications successfully",
      data: notifications,
      total,
      unreadCount,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    res.status(500).json({ status: "bad", message: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.status(200).json({ status: "ok", unreadCount });
  } catch (error) {
    res.status(500).json({ status: "bad", message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res
        .status(404)
        .json({ status: "error", message: "Notification not found" });
    }

    res.status(200).json({
      status: "ok",
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ status: "bad", message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });

    res
      .status(200)
      .json({ status: "ok", message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ status: "bad", message: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res
        .status(404)
        .json({ status: "error", message: "Notification not found" });
    }

    res.status(200).json({ status: "ok", message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ status: "bad", message: error.message });
  }
};

module.exports = {
  getAllNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
