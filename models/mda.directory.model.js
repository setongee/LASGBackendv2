const mongoose = require("mongoose");

const MdaDirectorySchema = mongoose.Schema(
  {
    name: {
      type: String,
    },

    fullname: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      required: true,
      enum: ["full", "service"],
    },

    slug: { type: String, default: "" },

    theme: {
      type: String,
      default: "none",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isFirstTimePublished: {
      type: Boolean,
      default: false,
    },

    agencies: {
      type: Array,
    },

    isOffline: {
      type: Boolean,
      default: true,
    },

    mission: { type: String, default: "" },

    vision: { type: String, default: "" },

    goal: { type: String, default: "" },

    responsibilities: { type: String },

    resources: { type: Array },

    statistics: {
      budgetSize: { type: String, default: "" },
      expenditure: { type: String, default: "" },
      capex: { type: String, default: "" },
      igr: { type: String, default: "" },
    },

    people: {
      type: Array,
    },

    contact: {
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
      socials: {},
    },

    landingPage: {
      type: Object,
      default: {},
    },

    services: {
      type: Array,
      default: [],
    },

    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mda-admin-users",
    },
  },

  {
    timestamps: true,
  },
);

const Mda_Directory = mongoose.model("mda_directory", MdaDirectorySchema);

module.exports = { Mda_Directory };
