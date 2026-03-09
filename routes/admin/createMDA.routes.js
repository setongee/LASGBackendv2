const express = require("express");
const router = express.Router();
const {
  createMdaAdmin,
  updateMdaAdmin,
} = require("../../controllers/admin/create-mda");

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

/**
 * @route   PUT /api/admin/mda/update/:id
 * @desc    Update MDA directory and admin user
 * @access  Private/Admin
 * @body    {
 *            "firstname": "string (optional)",
 *            "lastname": "string (optional)",
 *            "email": "string (optional)",
 *            "fullname": "string (optional)",
 *            "slug": "string (optional)",
 *            "type": "string (optional, full|service)"
 *          }
 */
router.put("/update/:id", updateMdaAdmin);

module.exports = router;
