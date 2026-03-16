const mongoose = require("mongoose");

const formResponseSchema = mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "forms",
      required: true,
    },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

const FormResponse = mongoose.model("form_responses", formResponseSchema);

module.exports = FormResponse;
