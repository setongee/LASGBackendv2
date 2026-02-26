const mongoose = require("mongoose");

////////// activity logger Database ////////////

const LoggerSchema = mongoose.Schema(
  {
    initiator: {
      type: String,
      required: true,
    },
    mda: {
      type: String,
      required: true,
    },
    activity: {
      type: String,
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

const Logger = mongoose.model("activity-logger", LoggerSchema);

module.exports = Logger;
