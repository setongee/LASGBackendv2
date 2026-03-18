const PublishBucket = require("../models/publish-bucket.model");
const Draft = require("../models/draft.model");
const { Mda_Directory } = require("../models/mda.directory.model");

const createPublishBucket = async (req, res) => {
  try {
    const { draftId, mda, status, notes } = req.body;

    // Check if draft already exists in publish bucket
    const existingBucket = await PublishBucket.findOne({ draftId });
    if (existingBucket) {
      return res.status(400).json({
        status: "bad",
        message: "Draft already exists in publish bucket",
      });
    }

    const newPublishBucket = await PublishBucket({
      draftId,
      mda,
      status: status || "pending",
      notes,
    });
    await newPublishBucket.save();

    // If status is published, set publishedAt
    if (status === "published") {
      newPublishBucket.publishedAt = new Date();
      await newPublishBucket.save();
    }

    res.status(201).json({
      status: "ok",
      message: "Publish bucket entry created successfully",
      data: newPublishBucket,
    });
  } catch (error) {
    res.status(500).json({
      status: "bad",
      message: "Something went wrong!",
    });
  }
};

const getAllPublishBuckets = async (req, res) => {
  try {
    const buckets = await PublishBucket.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      status: "ok",
      message: "Fetched all publish buckets successfully",
      data: buckets,
    });
  } catch (error) {
    res.status(500).json({
      status: "bad",
      message: error.message,
    });
  }
};

const getPublishBucketsByMda = async (req, res) => {
  try {
    const { mda } = req.params;

    const buckets = await PublishBucket.find({ mda }).sort({ createdAt: -1 });

    res.status(200).json({
      status: "ok",
      message: `Fetched publish buckets for ${mda} successfully`,
      data: buckets,
    });
  } catch (error) {
    res.status(500).json({
      status: "bad",
      message: error.message,
    });
  }
};

const getPublishBucketsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const buckets = await PublishBucket.find({ status }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      status: "ok",
      message: `Fetched publish buckets with status ${status} successfully`,
      data: buckets,
    });
  } catch (error) {
    res.status(500).json({
      status: "bad",
      message: error.message,
    });
  }
};

const getSinglePublishBucket = async (req, res) => {
  try {
    const { id } = req.params;

    const bucket = await PublishBucket.findOne({ draftId: id });

    if (!bucket) {
      return res.status(404).json({
        status: "error",
        message: "Publish bucket not found",
      });
    }

    res.status(200).json({
      status: "ok",
      message: "Fetched single publish bucket successfully",
      data: bucket,
    });
  } catch (error) {
    res.status(500).json({
      status: "bad",
      message: error.message,
    });
  }
};

const updatePublishBucket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy, notes, reasonForRejection } = req.body;

    // Get current bucket to validate status transitions
    const currentBucket = await PublishBucket.findById(id);
    if (!currentBucket) {
      return res.status(404).json({
        status: "error",
        message: "Publish bucket not found",
      });
    }

    // Validate status transitions
    const validTransitions = {
      pending: ["content approved", "rejected"],
      "content approved": ["published", "rejected"],
      rejected: ["pending"],
      published: [], // Published is final state
    };

    if (status && !validTransitions[currentBucket.status].includes(status)) {
      return res.status(400).json({
        status: "bad",
        message: `Invalid status transition from ${currentBucket.status} to ${status}`,
      });
    }

    const updateData = { status, notes, reasonForRejection };

    // Handle approvedBy object updates based on status
    if (approvedBy && status) {
      if (status === "content approved") {
        updateData.approvedBy = {
          ...currentBucket.approvedBy,
          contentApprover: approvedBy,
        };
        updateData.contentApprovedAt = new Date();
      } else if (status === "published") {
        updateData.approvedBy = {
          ...currentBucket.approvedBy,
          publisher: approvedBy,
        };
        updateData.publishedAt = new Date();
      }
    }

    // If status is being set to rejected, require reasonForRejection
    if (status === "rejected" && !reasonForRejection) {
      return res.status(400).json({
        status: "bad",
        message: "Reason for rejection is required when rejecting content",
      });
    }

    // If status is being set to published, update MDA directory with draft data
    if (status === "published") {
      try {
        // Get the draft to retrieve data
        const draft = await Draft.findById(currentBucket.draftId);
        if (!draft) {
          return res.status(404).json({
            status: "error",
            message: "Draft not found for this publish bucket",
          });
        }

        // Find the MDA directory using the mda field
        const mdaDirectory = await Mda_Directory.findOne({
          name: currentBucket.mda,
        });
        if (!mdaDirectory) {
          return res.status(404).json({
            status: "error",
            message: "MDA directory not found for this publish bucket",
          });
        }

        // Update MDA directory: replace landingPage with draft data
        const updateData = {
          $set: {
            landingPage: draft.data, // Replace landingPage with draft data
            isOffline: false, // Always set to false when publishing
          },
        };

        // Check if this is the first time publishing and update the flag
        if (!mdaDirectory.isFirstTimePublished) {
          updateData.$set.isFirstTimePublished = true;
        }

        await Mda_Directory.findByIdAndUpdate(mdaDirectory._id, updateData);
      } catch (error) {
        console.error("Error updating MDA directory:", error);
        return res.status(500).json({
          status: "error",
          message: "Failed to update MDA directory with published content",
        });
      }
    }

    const bucket = await PublishBucket.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "ok",
      message: "Publish bucket updated successfully",
      data: bucket,
    });
  } catch (error) {
    res.status(500).json({
      status: "bad",
      message: error.message,
    });
  }
};

const updatePublishBucketData = async (req, res) => {
  try {
    const { id } = req.params;
    const { draftId, mda, notes } = req.body;

    // Get current bucket to check status
    const currentBucket = await PublishBucket.findById(id);
    if (!currentBucket) {
      return res.status(404).json({
        status: "error",
        message: "Publish bucket not found",
      });
    }

    // Only allow data updates when status is pending or rejected
    if (
      !["pending", "rejected", "content approved", "published"].includes(
        currentBucket.status,
      )
    ) {
      return res.status(400).json({
        status: "bad",
        message: `Cannot update data when status is ${currentBucket.status}. Only pending or rejected items can be updated.`,
      });
    }

    const updateData = {};

    // Only update fields that are provided
    if (draftId !== undefined) updateData.draftId = draftId;
    if (mda !== undefined) updateData.mda = mda;
    if (notes !== undefined) updateData.notes = notes;

    // Always reset status to pending when data is updated
    updateData.status = "pending";
    updateData.reasonForRejection = null; // Clear rejection reason

    const bucket = await PublishBucket.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "ok",
      message: "Publish bucket data updated successfully",
      data: bucket,
    });
  } catch (error) {
    res.status(500).json({
      status: "bad",
      message: error.message,
    });
  }
};

const deletePublishBucket = async (req, res) => {
  try {
    const { id } = req.params;

    const bucket = await PublishBucket.findByIdAndDelete(id);

    if (bucket) {
      res.status(200).json({
        status: "ok",
        message: "Publish bucket deleted successfully",
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Publish bucket not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "bad",
      message: error.message,
    });
  }
};

module.exports = {
  createPublishBucket,
  getAllPublishBuckets,
  getPublishBucketsByMda,
  getPublishBucketsByStatus,
  getSinglePublishBucket,
  updatePublishBucket,
  updatePublishBucketData,
  deletePublishBucket,
};
