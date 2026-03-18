const mongoose = require("mongoose");

const newsSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    mda: {
      type: String, // Keep as string for backward compatibility
      default: "",
    },

    targetMDA: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "mda_directory", // Use the correct model name
      default: [], // New field for ObjectId references
    },

    date: {
      type: Object,
      required: true,
    },

    photo: {
      type: Object,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    categories: {
      type: Array,
      required: true,
    },
  },

  {
    timestamps: true,
  },
);

const news = mongoose.model("news", newsSchema);

module.exports = news;
