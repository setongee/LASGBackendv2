const express = require("express");
const router = express.Router();
const {
  addDir,
  getAllMdaDirectory,
  getSingleMdaDirectory,
  updateMdaDirectory,
  deleteMdaDirectory,
  uploadFile,
  getUploadSignature,
  getAllResources,
} = require("../controllers/MdaDirectory.controller");

//addd dir
router.post("/create", addDir);

//Upload photo
router.post("/upload", uploadFile);

//Get a signature for direct browser-to-Cloudinary upload
router.post("/upload-signature", getUploadSignature);

//get All Mdas
router.get("/all", getAllMdaDirectory);

//get all resources from all MDAs
router.get("/resources", getAllResources);

//Get Single Mda
router.get("/:id", getSingleMdaDirectory);

//Update Single Mda
router.put("/update/:id", updateMdaDirectory);

//Delete Mda Directory
router.delete("/delete/:id", deleteMdaDirectory);

module.exports = router;
