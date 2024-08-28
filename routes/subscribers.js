const express = require("express");

const { addSubscribers, getAllSubscriptions, getSingleSubscriptions, updateSubscription, cancelSubscriptions } = require("../controllers/subscriptions");

const router = express.Router();

//add subscriber
router.post('/subscribe', addSubscribers);

//get subscribers
router.get('/all', getAllSubscriptions);

//get single subscriber
router.get('/:id', getSingleSubscriptions);

//update subscriber
router.put('/:id/update', updateSubscription );

//cancel subscriptions
router.delete('/cancel', cancelSubscriptions);

module.exports = router;