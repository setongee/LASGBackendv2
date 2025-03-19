const express = require("express");
const { addExecutiveCouncilMember, getAllCouncilMembers, getSingleMember, updateExecutiveCouncilMember, deleteMember, getSingleMemberByName } = require("../controllers/executives.controller");

const router = express.Router();

router.post('/add', addExecutiveCouncilMember);

router.get('/get/all', getAllCouncilMembers);
router.get('/get/:name', getSingleMemberByName);

router.get('/view/:id', getSingleMember);

router.put('/update/:id', updateExecutiveCouncilMember)
router.delete('/delete/:id', deleteMember)

module.exports = router;