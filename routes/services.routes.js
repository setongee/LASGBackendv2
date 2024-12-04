const express = require("express");
const { addService, getAllServices, getSingleService, updateService, deleteService, getServicesByTag } = require("../controllers/services.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/authorizeRoles");
const router = express.Router();

router.get('/all', getAllServices);

router.post('/add/single', addService);

router.get('/get/single/:id', getSingleService);
router.get('/get/category/:category', getServicesByTag);

router.put('/update/:id', updateService);
router.delete('/delete/:id', deleteService);

module.exports = router;