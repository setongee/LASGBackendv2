const mongoose = require("mongoose");

const fieldSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["short_answer", "long_answer", "dropdown", "radio", "checkbox", "multi_select", "file"],
    },
    label: { type: String, required: true },
    required: { type: Boolean, default: false },
    options: { type: Array, default: [] },
  },
  { _id: false }
);

const formSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    theme: { type: String, default: "green" },
    mda: { type: String, required: true },
    fields: { type: [fieldSchema], default: [] },
    responseCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Form = mongoose.model("forms", formSchema);

module.exports = Form;
