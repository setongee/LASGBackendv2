const express = require("express");
const router = express.Router();
const {
  getAllMdaDirectory,
  getSingleMdaDirectory,
  updateMdaDirectory,
  addDir,
  uploadFile,
  deleteMdaDirectory,
} = require("../controllers/MdaDirectory.controller");

//addd dir
router.post("/create", addDir);

//Upload photo
router.post("/upload", uploadFile);

//get All Mdas
router.get("/all", getAllMdaDirectory);

//Get Single Mda
router.get("/:id", getSingleMdaDirectory);

//Update Single Mda
router.put("/update/:id", updateMdaDirectory);

//Delete Mda Directory
router.delete("/delete/:id", deleteMdaDirectory);

module.exports = router;
