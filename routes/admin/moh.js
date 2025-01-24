const express = require("express");
const { register, login, getUser, updatePassword, getUsers, deleteUser } = require("../../controllers/admin/moh");
const { authenticateToken, authenticateToken2 } = require("../../middleware/authenticateToken");
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', getUsers);
router.post('/login/authenticate', authenticateToken2);
router.post('/user/auth/password/:id', updatePassword);
router.get('/user/:id', getUser);
router.delete('/user/:id', deleteUser);


module.exports = router;