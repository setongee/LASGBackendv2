const mongoose = require("mongoose");

////////// User Database ////////////

const MdaAdminUser = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },

    lastname: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    lastLogin: {
      type: String,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
      enum: ["admin", "comms", "ict"],
    },
    mda: {
      type: String,
      required: true,
    },
    mdaFullname: {
      type: String,
      required: true,
    },
  },

  {
    timestamps: true,
  },
);

const User = mongoose.model("mda-admin-users", MdaAdminUser);

module.exports = User;
