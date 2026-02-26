const express = require("express");

const {
  createDraft,
  getAllDrafts,
  getDraftsByMda,
  getSingleDraft,
  deleteDraft,
  updateDraft,
} = require("../controllers/draft.controller");

const router = express.Router();

router.post("/create", createDraft);
router.get("/get/all", getAllDrafts);
router.get("/get/mda/:mda", getDraftsByMda);
router.get("/view/:id", getSingleDraft);
router.put("/update/:id", updateDraft);
router.delete("/delete/:id", deleteDraft);

module.exports = router;
