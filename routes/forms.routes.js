const express = require("express");
const router = express.Router();
const {
  createForm,
  getAllForms,
  getFormsByMda,
  getSingleForm,
  updateForm,
  deleteForm,
  submitResponse,
  getFormResponses,
  getSingleResponse,
} = require("../controllers/forms.controller");

// Forms CRUD
router.post("/create", createForm);
router.get("/all", getAllForms);
router.get("/mda/:mda", getFormsByMda);
router.get("/:id", getSingleForm);
router.put("/update/:id", updateForm);
router.delete("/delete/:id", deleteForm);

// Form responses
router.post("/:id/submit", submitResponse);
router.get("/:id/responses", getFormResponses);
router.get("/responses/:responseId", getSingleResponse);

module.exports = router;
