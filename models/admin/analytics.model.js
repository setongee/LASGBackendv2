const mongoose = require("mongoose");

const visitorsSchema = mongoose.Schema({
  siteName: {
    type: String,
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  userId: {
    type: String,
    default: null,
  },
  sessionId: {
    type: String,
    required: true,
  },
  page: {
    type: String,
    required: true,
  },
  userAgent: String,
  ipAddress: String,
  referrer: String,
  browser: String,
  device: String,
  os: String,
  isAuthentic: {
    type: Boolean,
    default: true,
  },
  slug: String,
});

visitorsSchema.index({ siteName: 1, timestamp: -1 });
visitorsSchema.index({ siteName: 1, userId: 1, timestamp: -1 });

module.exports = mongoose.model("Visitors", visitorsSchema);
