const WebTemplateRequest = require("../models/web-template-request.model");
const asyncHandler = require("express-async-handler");

// @desc    Create a new web template request
// @route   POST /api/web-template-requests
// @access  Private
const createWebTemplateRequest = asyncHandler(async (req, res) => {
  const { templateName, description, additionalNotes, mda } = req.body;

  const request = await WebTemplateRequest.create({
    templateName,
    description,
    additionalNotes,
    mda,
    requestedBy: req.body.requestedBy || "Anonymous",
  });

  res.status(201).json({
    success: true,
    data: request,
    message: "Web template request created successfully",
  });
});

// @desc    Get all web template requests
// @route   GET /api/web-template-requests
// @access  Private/Admin
const getAllWebTemplateRequests = asyncHandler(async (req, res) => {
  const requests = await WebTemplateRequest.find({}).sort("-createdAt");

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests,
    message: "Web template requests retrieved successfully",
  });
});

// @desc    Get single web template request
// @route   GET /api/web-template-requests/:id
// @access  Private
const getWebTemplateRequest = asyncHandler(async (req, res) => {
  const request = await WebTemplateRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({
      success: false,
      message: "Request not found",
    });
  }

  // Check if user is the requester or admin
  if (
    request.requestedBy !== req.user?._id?.toString() &&
    req.user?.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to access this request",
    });
  }

  res.status(200).json({
    success: true,
    data: request,
    message: "Web template request retrieved successfully",
  });
});

// @desc    Update web template request status (Admin only)
// @route   PUT /api/web-template-requests/:id/status
// @access  Private/Admin
const updateRequestStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;

  const request = await WebTemplateRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({
      success: false,
      message: "Request not found",
    });
  }

  request.status = status;
  if (adminNotes) request.adminNotes = adminNotes;

  await request.save();

  res.status(200).json({
    success: true,
    data: request,
    message: "Web template request status updated successfully",
  });
});

// @desc    Delete web template request
// @route   DELETE /api/web-template-requests/:id
// @access  Private
const deleteWebTemplateRequest = asyncHandler(async (req, res) => {
  const request = await WebTemplateRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({
      success: false,
      message: "Request not found",
    });
  }

  // Only allow deletion by requester or admin
  if (
    request.requestedBy !== req.user?._id?.toString() &&
    req.user?.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this request",
    });
  }

  await request.remove();

  res.status(200).json({
    success: true,
    data: {},
    message: "Web template request deleted successfully",
  });
});

module.exports = {
  createWebTemplateRequest,
  getAllWebTemplateRequests,
  getWebTemplateRequest,
  updateRequestStatus,
  deleteWebTemplateRequest,
};
