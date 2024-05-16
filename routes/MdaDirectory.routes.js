const express = require("express");
const router = express.Router();
const {getAllMdaDirectory, addMdaDirectory, getSingleMdaDirectory, updateMdaDirectory, deleteMdaDirectory } = require("../controllers/MdaDirectory.controller");

//Add Mdas Router
router.post("/add", addMdaDirectory);

//get All Mdas
router.get("/all", getAllMdaDirectory);

//Get Single Mda
router.get("/:id", getSingleMdaDirectory);

//Update Single Mda
router.put("/update/:id", updateMdaDirectory);

//Delete Single Mda
router.delete("/delete/:id", deleteMdaDirectory)

module.exports = router;