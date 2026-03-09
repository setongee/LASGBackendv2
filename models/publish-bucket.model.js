const mongoose = require("mongoose");

const PublishBucketSchema = mongoose.Schema(
  {
    draftId: {
      type: String,
      required: true,
    },

    mda: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["pending", "content approved", "rejected", "published"],
      default: "pending",
    },

    reasonForRejection: {
      type: String,
    },

    contentApprovedAt: {
      type: Date,
    },

    publishedAt: {
      type: Date,
    },

    approvedBy: {
      type: Object,
      default: {
        contentApprover: null,
        publisher: null,
      },
    },

    notes: {
      type: String,
    },
  },

  {
    timestamps: true,
  },
);

const PublishBucket = mongoose.model("publish-buckets", PublishBucketSchema);

module.exports = PublishBucket;
