const express = require("express");
const { addService, getAllServices, getSingleService, updateService, deleteService, getServicesByTag } = require("../controllers/services.controller");
const router = express.Router();

router.post('/add/single', addService);

router.get('/get/single/:id', getSingleService);
router.get('/get/category/:category', getServicesByTag);
router.get('/all', getAllServices);

router.put('/update/:id', updateService);
router.delete('/delete/:id', deleteService);

module.exports = router;

// Admins can do all

//Comms alone can

// Only ICT