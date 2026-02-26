const mongoose = require("mongoose");

const DraftSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: false,
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    mda: {
      type: String,
      required: true,
    },
  },

  {
    timestamps: true,
  },
);

const Draft = mongoose.model("drafts", DraftSchema);

module.exports = Draft;
