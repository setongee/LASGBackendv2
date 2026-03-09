const mongoose = require("mongoose");

const Subscriptions = mongoose.Schema(
  {
    fullname: {
      type: String,
      // required : true
    },

    email: {
      type: String,
      required: true,
    },

    interests: {
      type: Array,
      // required : true
    },

    mdaDirectory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mda_directory",
      required: true,
    },
  },

  {
    timestamps: true,
  },
);

const subscriptionsModel = mongoose.model("subscribers", Subscriptions);

module.exports = subscriptionsModel;
