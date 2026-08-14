const cloudinary = require("cloudinary");
require("dotenv").config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const generateUploadSignature = (publicId) => {
  const sanitizedPublicId = publicId.replace(/[^a-zA-Z0-9/._-]/g, "_");
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = {
    timestamp,
    public_id: sanitizedPublicId,
    overwrite: true,
  };
  const signature = cloudinary.v2.utils.api_sign_request(
    paramsToSign,
    process.env.API_SECRET,
  );

  return {
    signature,
    timestamp,
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    public_id: sanitizedPublicId,
  };
};

module.exports = { generateUploadSignature };
