const express = require("express");
const {
  addAlbum,
  getAlbumsForMda,
  getSingleAlbum,
  updateAlbum,
  deleteAlbum,
} = require("../controllers/gallery.controller");

const router = express.Router();

router.post("/add", addAlbum);
router.get("/get/all/:mda", getAlbumsForMda);
router.get("/view/:id", getSingleAlbum);
router.put("/update/:id", updateAlbum);
router.delete("/delete/:id", deleteAlbum);

module.exports = router;
