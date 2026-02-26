const mongoose = require("mongoose");

const servicesSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    short: {
      type: String,
      required: true,
    },

    cta: {
      type: String,
      required: true,
    },

    pin: {
      type: String,
    },

    keywordsTrim: {
      type: Array,
      default: [],
    },

    keywordsGroup: {
      type: Object,
      default: {},
    },

    customKeywords: {
      type: Array,
      default: [],
    },

    keywords: {
      type: Array,
      default: [],
    },

    url: {
      type: String,
      required: true,
    },

    categories: {
      type: Array,
      required: true,
    },

    formattedName: {
      type: Array,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    isOffline: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  },
);

const services = mongoose.model("services", servicesSchema);

module.exports = services;
