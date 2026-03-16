const Form = require("../models/form.model");
const FormResponse = require("../models/form-response.model");

// Create a new form
const createForm = async (req, res) => {
  try {
    const form = await Form.create(req.body);
    res.status(201).json({ status: "ok", message: "Form created successfully.", data: form });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all forms
const getAllForms = async (req, res) => {
  try {
    const forms = await Form.find({}).sort({ createdAt: -1 });
    res.status(200).json({ status: "ok", message: "Fetched all forms.", data: forms });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all forms for a specific MDA
const getFormsByMda = async (req, res) => {
  try {
    const { mda } = req.params;
    const forms = await Form.find({ mda }).sort({ createdAt: -1 });
    res.status(200).json({ status: "ok", message: "Fetched forms for MDA.", data: forms });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single form by ID
const getSingleForm = async (req, res) => {
  try {
    const { id } = req.params;
    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({ status: "error", message: "Form not found." });
    }

    res.status(200).json({ status: "ok", message: "Fetched form.", data: form });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a form
const updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const form = await Form.findByIdAndUpdate(id, req.body, { new: true });

    if (!form) {
      return res.status(404).json({ status: "error", message: "Form not found." });
    }

    res.status(200).json({ status: "ok", message: "Form updated successfully.", data: form });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a form and all its responses
const deleteForm = async (req, res) => {
  try {
    const { id } = req.params;
    const form = await Form.findByIdAndDelete(id);

    if (!form) {
      return res.status(404).json({ status: "error", message: "Form not found." });
    }

    await FormResponse.deleteMany({ formId: id });

    res.status(200).json({ status: "ok", message: "Form and all associated responses deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit a response to a form
const submitResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({ status: "error", message: "Form not found." });
    }

    const response = await FormResponse.create({ formId: id, ...req.body });

    // Increment response count on the form
    form.responseCount += 1;
    await form.save();

    res.status(201).json({ status: "ok", message: "Response submitted successfully.", data: response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single response by ID
const getSingleResponse = async (req, res) => {
  try {
    const { responseId } = req.params;
    const response = await FormResponse.findById(responseId);

    if (!response) {
      return res.status(404).json({ status: "error", message: "Response not found." });
    }

    res.status(200).json({ status: "ok", message: "Fetched response.", data: response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all responses for a form
const getFormResponses = async (req, res) => {
  try {
    const { id } = req.params;
    const responses = await FormResponse.find({ formId: id }).sort({ createdAt: -1 });
    res.status(200).json({ status: "ok", message: "Fetched form responses.", data: responses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createForm,
  getAllForms,
  getFormsByMda,
  getSingleForm,
  updateForm,
  deleteForm,
  submitResponse,
  getFormResponses,
  getSingleResponse,
};
