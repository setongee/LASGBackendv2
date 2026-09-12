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

    if (!isImage && !isVideo) {
      // Includes PDFs — Cloudinary's "image" resource type runs a
      // rasterization/preview pipeline with much stricter size and processing
      // limits than "raw". A large PDF (e.g. a multi-page financial
      // statement) can exceed those limits or time out mid-processing, which
      // surfaces to the browser as a bare "Network Error" (the connection
      // gets dropped before Cloudinary/Express can respond) rather than a
      // normal 4xx/5xx. "raw" stores the file as-is, no processing.
      resourceType = "raw";
    }

    const uploadOptions = {
      public_id: data.temp,
      resource_type: resourceType,
      folder: data.folder || "documents",
      use_filename: true,
      unique_filename: true,
    };

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
