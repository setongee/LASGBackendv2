const cloudinary = require("cloudinary");
require("dotenv").config();

const DocumentUploaderMiddleware = async (data) => {
  // Configuration
  cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });

  return new Promise((resolve, reject) => {
    // Determine resource type based on mimetype
    let resourceType = "auto";
    const isImage = data.mimetype?.startsWith("image/");
    const isVideo = data.mimetype?.startsWith("video/");
    const isPdf = data.mimetype === "application/pdf";

    if (isPdf) {
      resourceType = "image"; // Cloudinary handles PDFs as 'image' for better previewing
    } else if (!isImage && !isVideo) {
      resourceType = "raw"; // Force 'raw' for other documents
    }

    const uploadOptions = {
      public_id: data.temp,
      resource_type: resourceType,
      folder: data.folder || "documents",
      use_filename: true,
      unique_filename: true,
    };

    if (isPdf) {
      uploadOptions.format = "pdf";
    }

    const uploadStream = cloudinary.v2.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.log("Cloudinary upload error:", error);
          return reject(error);
        }

        resolve(result);
      },
    );

    // Write the buffer to the stream
    uploadStream.end(data.file);
  });
};

module.exports = DocumentUploaderMiddleware;
