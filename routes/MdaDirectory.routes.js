const express = require("express");
const router = express.Router();
const {getAllMdaDirectory, getSingleMdaDirectory, updateMdaDirectory } = require("../controllers/MdaDirectory.controller");

//get All Mdas
router.get("/all", getAllMdaDirectory);

//Get Single Mda
router.get("/:id", getSingleMdaDirectory);

//Update Single Mda
router.put("/update/:id", updateMdaDirectory);


module.exports = router;