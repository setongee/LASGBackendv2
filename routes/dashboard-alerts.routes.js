const express = require("express");
const router = express.Router();
const { getDashboardAlerts } = require("../controllers/dashboard-alerts.controller");

router.get("/summary", getDashboardAlerts);

module.exports = router;
