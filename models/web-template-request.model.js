const mongoose = require("mongoose");

const WebTemplateRequestSchema = mongoose.Schema(
  {
    templateName: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "rejected"],
      default: "pending",
    },
    requestedBy: {
      type: String,
      required: [true, "Requested by is required"],
      trim: true,
    },
    mda: {
      type: String,
      required: [true, "MDA is required"],
      trim: true,
    },
    additionalNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const WebTemplateRequest = mongoose.model(
  "WebTemplateRequest",
  WebTemplateRequestSchema
);

module.exports = WebTemplateRequest;
