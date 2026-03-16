const DocumentUploaderMiddleware = require("../services/uploader/document-uploader");
const multer = require("multer");

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      });
    }

    // Get folder name from request body or query params
    const folder = req.body.folder || req.query.folder || "documents";

    // Prepare data for Cloudinary upload
    const sanitizedFileName = req.file.originalname.replace(
      /[^a-zA-Z0-9._-]/g,
      "_",
    );
    const uploadData = {
      file: req.file.buffer,
      mimetype: req.file.mimetype,
      temp: `doc_${Date.now()}_${sanitizedFileName}`,
      folder: folder, // Pass folder name to uploader
    };

    // Upload to Cloudinary
    const uploadResult = await DocumentUploaderMiddleware(uploadData);

    res.status(200).json({
      status: "ok",
      message: "Document uploaded successfully",
      data: {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        format: uploadResult.format,
        size: uploadResult.bytes,
        original_name: req.file.originalname,
        folder: folder, // Include folder in response
      },
    });
  } catch (error) {
    console.error("Document upload error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to upload document",
      error: error.message,
    });
  }
};

// Middleware for handling file upload
const uploadMiddleware = upload.single("document");

module.exports = {
  uploadDocument,
  uploadMiddleware,
};
