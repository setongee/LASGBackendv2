const Draft = require("../models/draft.model");

const createDraft = async (req, res) => {
  try {
    const { title, data, mda } = req.body;

    const newDraft = await Draft({
      title,
      data,
      mda,
    });

    await newDraft.save();

    res.status(200).json({
      status: "ok",
      message: "Draft created successfully",
      data: newDraft,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const getAllDrafts = async (req, res) => {
  try {
    const drafts = await Draft.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      status: "ok",
      message: "Fetched all drafts successfully",
      data: drafts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDraftsByMda = async (req, res) => {
  try {
    const { mda } = req.params;

    const drafts = await Draft.find({ mda }).sort({ createdAt: -1 });
    res.status(200).json({
      status: "ok",
      message: `Fetched drafts for ${mda} successfully`,
      data: drafts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingleDraft = async (req, res) => {
  try {
    const { id } = req.params;

    const draft = await Draft.findById(id);

    if (!draft) {
      return res.status(404).json({
        status: "error",
        message: "Draft not found",
      });
    }

    res.status(200).json({
      status: "ok",
      message: "Fetched single draft successfully",
      data: draft,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDraft = async (req, res) => {
  try {
    const { id } = req.params;

    const draft = await Draft.findByIdAndDelete(id);

    if (draft) {
      res.status(200).json({
        status: "ok",
        message: "Draft deleted successfully",
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Draft not found",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, data, mda } = req.body;

    const draft = await Draft.findByIdAndUpdate(
      id,
      { title, data, mda },
      { new: true, runValidators: true },
    );

    if (!draft) {
      return res.status(404).json({
        status: "error",
        message: "Draft not found",
      });
    }

    res.status(200).json({
      status: "ok",
      message: "Draft updated successfully",
      data: draft,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDraft,
  getAllDrafts,
  getDraftsByMda,
  getSingleDraft,
  deleteDraft,
  updateDraft,
};
