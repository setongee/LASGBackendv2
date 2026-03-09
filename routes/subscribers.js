const express = require("express");

const {
  addSubscribers,
  getAllSubscriptions,
  getSingleSubscriptions,
  updateSubscription,
  cancelSubscriptions,
  getSubscriptionsByMda,
} = require("../controllers/subscriptions");

const router = express.Router();

//add subscriber
router.post("/subscribe", addSubscribers);

//get subscribers
router.get("/all", getAllSubscriptions);

//get single subscriber
router.get("/:id", getSingleSubscriptions);

//get subscribers by MDA
router.get("/mda/:mdaId", getSubscriptionsByMda);

//update subscriber
router.put("/:id/update", updateSubscription);

//cancel subscriptions
router.delete("/delete/:id", cancelSubscriptions);

module.exports = router;
