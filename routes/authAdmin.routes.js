const express = require("express");
const {
  register,
  login,
  getUser,
  updatePassword,
  getUsers,
  deleteUser,
} = require("../controllers/authAdmin.controller");
const {
  authenticateToken,
  authenticateToken2,
} = require("../middleware/authenticateToken");
const {
  refreshAuthToken,
} = require("../controllers/admin/auth-mda.controller");
const {
  getResetRequests,
  resetMdaPassword,
} = require("../controllers/admin/mda-reset.controller");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", getUsers);
router.post("/refresh-token", refreshAuthToken);
router.post("/login/authenticate", authenticateToken2);
router.post("/user/auth/password/:id", updatePassword);
router.get("/user/:id", getUser);
router.delete("/user/:id", deleteUser);

// MDA password reset management (super admin)
router.get("/mda-reset-requests", getResetRequests);
router.post("/mda-reset-password/:id", resetMdaPassword);

module.exports = router;
