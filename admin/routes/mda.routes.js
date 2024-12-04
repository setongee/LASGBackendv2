const express = require("express");

const router = express.Router();
const {addMda, getAllMdas, updateMda, getSingleMda, deleteMda} = require("../../controllers/Mda.controller");
const authorizeRoles = require("../../middleware/authorizeRoles");
const { authenticateToken } = require("../../middleware/auth.middleware");

//Add Mdas Router
router.post("/add", authenticateToken, authorizeRoles("admin"), addMda);

//get All Mdas
router.get("/all", authenticateToken, authorizeRoles("admin"), getAllMdas);

//Get Single Mda
router.get("/:id", authenticateToken, authorizeRoles("admin"), getSingleMda);

//Update Single Mda
router.put("/update/:id", authenticateToken, authorizeRoles("admin"), updateMda);

//Delete Single Mda
router.delete("/delete/:id", authenticateToken, authorizeRoles("admin"), deleteMda)

module.exports = router;