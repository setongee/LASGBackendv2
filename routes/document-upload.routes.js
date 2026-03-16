const express = require("express");
const router = express.Router();
const {
  uploadDocument,
  uploadMiddleware,
} = require("../controllers/document-upload.controller");

/**
 * @route   POST /api/v2/documents/upload
 * @desc    Upload a document to Cloudinary with custom folder
 * @access  Public/Private (add middleware as needed)
 * @body    multipart/form-data with "document" field
 * @query   folder (optional) - Folder name for organization
 * @body    folder (optional) - Folder name for organization
 */
router.post("/upload", uploadMiddleware, uploadDocument);

module.exports = router;
