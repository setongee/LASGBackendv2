const express = require("express");
const router = express.Router();
const {
  createWebTemplateRequest,
  getAllWebTemplateRequests,
  getWebTemplateRequest,
  updateRequestStatus,
  deleteWebTemplateRequest,
} = require("../controllers/web-template-request.controller");

// Routes
router.route("/").post(createWebTemplateRequest).get(getAllWebTemplateRequests);

router
  .route("/:id")
  .get(getWebTemplateRequest)
  .delete(deleteWebTemplateRequest);

// Admin only routes
router.route("/:id/status").put(updateRequestStatus);

module.exports = router;
