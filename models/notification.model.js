const mongoose = require("mongoose");

const NotificationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "password_reset_request",
        "publish_page_request",
        "web_template_request",
        "form_submission",
      ],
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    mda: {
      type: String,
      default: "",
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

NotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("notifications", NotificationSchema);
