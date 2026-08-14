const Notification = require("../../models/notification.model");

const NOTIFICATION_TYPES = {
  PASSWORD_RESET_REQUEST: "password_reset_request",
  PUBLISH_PAGE_REQUEST: "publish_page_request",
  WEB_TEMPLATE_REQUEST: "web_template_request",
  FORM_SUBMISSION: "form_submission",
};

// Best-effort logging — a notification failing to save should never break
// the request (password reset, form submission, etc.) that triggered it.
const createNotification = async ({
  type,
  title,
  message,
  mda,
  relatedId,
  meta,
}) => {
  try {
    return await Notification.create({
      type,
      title,
      message,
      mda,
      relatedId,
      meta,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

module.exports = { createNotification, NOTIFICATION_TYPES };
