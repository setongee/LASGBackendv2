const express = require("express");
const { addService, getServicesByCategory, getAllServices, getSingleService, updateService, deleteService } = require("../controllers/services.controller");
const router = express.Router();

router.post('/add/single', addService);

router.get('/get/single/:id', getSingleService);
router.get('/get/category/:category', getServicesByCategory);
router.get('/all', getAllServices);

router.put('/update/:id', updateService);
router.delete('/delete/:id', deleteService);

module.exports = router;