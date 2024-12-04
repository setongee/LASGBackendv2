const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();
const {addMda, getAllMdas, updateMda, getSingleMda, deleteMda} = require("../controllers/Mda.controller");
const authorizeRoles = require("../middleware/authorizeRoles");

//Add Mdas Router
router.post("/add", addMda);

//get All Mdas
router.get("/all", getAllMdas);

//Get Single Mda
router.get("/:id", getSingleMda);

//Update Single Mda
router.put("/update/:id", updateMda);

//Delete Single Mda
router.delete("/delete/:id", deleteMda)

module.exports = router;