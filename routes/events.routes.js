const express = require("express");

const { addEvents, getAllEvents, getSingleEvents, getEventsForMda, updateEvents, deleteEvent, addRsvp } = require("../controllers/events.controller");

const router = express.Router();

router.post('/add', addEvents);

router.put('/rsvp/:id', addRsvp);

router.get('/get/all/:topic/:page', getAllEvents);
router.get('/view/:id', getSingleEvents);
router.get('/get/all/:mda', getEventsForMda)

router.put('/update/:id', updateEvents)
router.delete('/delete/:id', deleteEvent)

module.exports = router;