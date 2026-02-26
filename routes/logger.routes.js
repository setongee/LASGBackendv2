const express = require("express");
const { addActivity, getActivities, getActivitiesForMda, getActivitiesForInitiator } = require("../controllers/logger.controller");

const router = express.Router();

// Create a new activity log
router.post('/add', addActivity);

// Get all activities (with optional pagination and mda filter)
router.get('/get/all/:mda?/:page?', getActivities);

// Get activities for a specific MDA
router.get('/get/mda/:id', getActivitiesForMda);

// Get activities for a specific initiator
router.get('/get/initiator/:id', getActivitiesForInitiator);

module.exports = router;
