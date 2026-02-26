const express = require("express");
const {
  handleAnalytics,
  getSiteStats,
  getCustomStats,
  getVisitsBySites,
} = require("../../controllers/admin/visitors.controller");
const router = express.Router();

router.post("/log", handleAnalytics);
router.get("/visits", getSiteStats);
router.get("/visits/custom", getCustomStats);
router.get("/visits/sites", getVisitsBySites);

module.exports = router;
