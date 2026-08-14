const mongoose = require("mongoose");

const gallerySchema = mongoose.Schema(
  {
    mda: { type: String, required: true, index: true },
    mdaFullname: { type: String, default: "" },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    photos: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("gallery", gallerySchema);
