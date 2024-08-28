const express = require("express");
const {registerUser, loginUser, getUsers} = require("../controllers/user.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/get/users', authenticateToken, getUsers);

module.exports = router;