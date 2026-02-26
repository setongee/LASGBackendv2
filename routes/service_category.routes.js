const express = require("express");
const {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getSingleCategory,
  getSingleCategoryByName,
  getGroupedServices,
} = require("../controllers/service_category.controller");

const router = express.Router();

//add Category
router.post("/add", addCategory);

//get all categories
router.get("/all", getAllCategories);

// get grouped services
router.post("/grouped", getGroupedServices);

//get single category
router.get("/name/:name", getSingleCategoryByName);

//get single category
router.get("/:id", getSingleCategory);

//update categories
router.put("/:id/update", updateCategory);

// delete caterory
router.delete("/:id/delete", deleteCategory);

module.exports = router;
