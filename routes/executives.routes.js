const express = require("express");
const { addExecutiveCouncilMember, getAllCouncilMembers, getSingleMember, updateExecutiveCouncilMember, deleteMember } = require("../controllers/executives.controller");

const router = express.Router();

router.post('/add', addExecutiveCouncilMember);

router.get('/get/all', getAllCouncilMembers);
router.get('/view/:id', getSingleMember);

router.put('/update/:id', updateExecutiveCouncilMember)
router.delete('/delete/:id', deleteMember)

module.exports = router;