const Logger = require("../models/logger-model");

// Add an activity log
const addActivity = async (req, res) => {
  try {
    const { initiator, mda, activity } = req.body;

    if (!initiator || !mda || !activity) {
      return res
        .status(400)
        .json({ status: "error", message: "initiator, mda and activity are required" });
    }

    await Logger.create({ initiator, mda, activity });

    res
      .status(201)
      .json({ status: "ok", message: "Activity logged successfully..." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get activities (all or filtered by MDA) with pagination
const getActivities = async (req, res) => {
  // Support both params and query for flexibility, matching patterns in other controllers
  const page = parseInt(req.params.page || req.query.page || 0);
  const limit = 20;
  const mda = req.params.mda || req.query.mda || "all";

  try {
    if (mda !== "all") {
      const filter = { mda };
      const count = await Logger.countDocuments(filter);
      const data = await Logger.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(page * limit);

      return res.status(200).json({
        status: "ok",
        message: "Fetched all data successfully...",
        data,
        length: count,
      });
    } else {
      const count = await Logger.estimatedDocumentCount();
      const data = await Logger.find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(page * limit);

      return res.status(200).json({
        status: "ok",
        message: "Fetched all data successfully...",
        data,
        length: count,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Explicit helper to get activities for a specific MDA (no pagination defaults besides limit/skip)
const getActivitiesForMda = async (req, res) => {
  try {
    const { id } = req.params; // expect mda id as :id
    const data = await Logger.find({ mda: id }).sort({ createdAt: -1 });
    res
      .status(200)
      .json({ status: "ok", message: "Fetched all data successfully...", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Explicit helper to get activities for a specific initiator
const getActivitiesForInitiator = async (req, res) => {
  try {
    const { id } = req.params; // expect initiator as :id
    const data = await Logger.find({ initiator: id }).sort({ createdAt: -1 });
    res
      .status(200)
      .json({ status: "ok", message: "Fetched all data successfully...", data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addActivity,
  getActivities,
  getActivitiesForMda,
  getActivitiesForInitiator,
};

