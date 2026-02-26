const express = require("express");
const router = express.Router();
const { createMdaAdmin } = require("../../controllers/admin/create-mda");

/**
 * @route   POST /api/admin/mda/create
 * @desc    Create a new MDA and its admin user
 * @access  Private/Admin
 * @body    {
 *            "firstname": "string",
 *            "lastname": "string",
 *            "email": "string",
 *            "password": "string",
 *            "role": "string (admin|comms|ict)",
 *            "mdaFullname": "string",
 *            "proposedSlug": "string"
 *          }
 */
router.post("/create", createMdaAdmin);

module.exports = router;