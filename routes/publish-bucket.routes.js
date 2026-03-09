const express = require("express");

const {
  createPublishBucket,
  getAllPublishBuckets,
  getPublishBucketsByMda,
  getPublishBucketsByStatus,
  getSinglePublishBucket,
  updatePublishBucket,
  updatePublishBucketData,
  deletePublishBucket,
} = require("../controllers/publish-bucket.controller");

const router = express.Router();

router.post("/create", createPublishBucket);
router.get("/get/all", getAllPublishBuckets);
router.get("/get/mda/:mda", getPublishBucketsByMda);
router.get("/get/status/:status", getPublishBucketsByStatus);
router.get("/view/:id", getSinglePublishBucket);
router.put("/update/:id", updatePublishBucket);
router.put("/update-data/:id", updatePublishBucketData);
router.delete("/delete/:id", deletePublishBucket);

module.exports = router;
