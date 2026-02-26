const UploaderMiddleware = require("../services/uploader/uploader");
const Category = require("../models/service_category.model");
const ServicesData = require("../models/services.model");

const addCategory = async (req, res) => {
  try {
    const { icon, name } = req.body;

    const category = await Category.create(req.body);

    if (Object.keys(icon).length) {
      await UploaderMiddleware(icon).then(async (response) => {
        category.icon = response.secure_url;
        await category.save();
      });
    } else {
      category.icon =
        "https://res-console.cloudinary.com/dirmxkznt/thumbnails/v1/image/upload/v1770380881/RmlsZS1UZXh0LS1TdHJlYW1saW5lLVNvbGFyXzFfY2N5aGZn/as_is";
      await category.save();
    }

    category.formattedName = name
      .replaceAll(" ", "")
      .replaceAll(",", "_")
      .replaceAll("&", "_")
      .toLowerCase();
    await category.save();

    res.status(200).json({
      status: "ok",
      message: "Service category added successfully...",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json({
      status: "ok",
      message: "Fetched all data successfully...",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingleCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    res.status(200).json({
      status: "ok",
      message: "Fetched single data successfully...",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingleCategoryByName = async (req, res) => {
  try {
    const { name } = req.params;

    const category = await Category.find({ formattedName: name });
    res.status(200).json({
      status: "ok",
      message: "Fetched single data successfully...",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, formattedName, keywords } = req.body;

    // const red = await ServicesData.updateMany( {formattedName : "complaints_feedbacks"}, { $set : { formattedName : formattedName } } )

    // const serve = await ServicesData.updateMany( {}, { $set : { keywords : {}, keywordsTrim : {}, keywordsGroup : {} } } );
    // const rex = await ServicesData.find({});
    // const rex = await ServicesData.updateMany( {formattedName : "advertisement"}, { $set : { content : "<p>Hey i am here wassup</p>" } } );
    // [{ $addFields: { some_key: new_info } }]
    // console.log(rex)
    // await ServicesData.updateMany( {formattedName : formattedName}, { $set : { keywordsGroup : { [`${formattedName}`] : keywords } } } );

    await ServicesData.updateMany(
      { formattedName: formattedName },
      { $set: { [`keywordsGroup.${formattedName}`]: keywords } },
    );

    const category = await Category.findByIdAndUpdate(id, req.body);

    category.formattedName = name
      .replaceAll(" ", "")
      .replaceAll(",", "_")
      .replaceAll("&", "_")
      .toLowerCase();
    await category.save();

    if (req.body.icon.data !== undefined) {
      await UploaderMiddleware(req.body.icon).then(async (response) => {
        category.icon = response.secure_url;
        await category.save();
      });
    }

    if (category) {
      res.status(200).json({
        status: "ok",
        message: "Updated successfully...",
        data: category,
      });
    } else {
      res
        .status(404)
        .json({ status: "error", message: "Category not found..." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (category) {
      res
        .status(200)
        .json({ status: "ok", message: "Category deleted successfully..." });
    } else {
      res
        .status(404)
        .json({ status: "error", message: "Category not found..." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGroupedServices = async (req, res) => {
  try {
    const { formattedNames } = req.body;

    if (
      !formattedNames ||
      !Array.isArray(formattedNames) ||
      formattedNames.length === 0
    ) {
      return res.status(400).json({
        status: "error",
        message: "Please provide an array of formatted names",
      });
    }

    // Find all services that match any of the provided formatted names
    const services = await ServicesData.find({
      formattedName: { $in: formattedNames },
    });

    if (services.length === 0) {
      return res.status(404).json({
        status: "not_found",
        message: "No services found for the provided formatted names",
      });
    }

    res.status(200).json({
      status: "ok",
      message: "Services fetched successfully",
      data: services,
    });
  } catch (error) {
    console.error("Error fetching services by formatted names:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while fetching services",
      error: error.message,
    });
  }
};

module.exports = {
  addCategory,
  getAllCategories,
  getGroupedServices,
  getSingleCategory,
  updateCategory,
  deleteCategory,
  getSingleCategoryByName,
};
