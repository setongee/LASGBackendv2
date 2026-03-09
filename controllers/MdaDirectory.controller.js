const { Mda_Directory } = require("../models/mda.directory.model");
const MdaAdminUser = require("../models/admin/admin-auth.model");
const UploaderMiddleware = require("../services/uploader/uploader");

const data = {
  name: "mot",
  mission: "",
  vision: "",
  responsibilities: "",
  agencies: [],
  people: [],
  contact: {
    email: "",
    phone: "",
    address: "",
    social: [],
  },
};

const addDir = async (req, res) => {
  try {
    const dir = await Mda_Directory.create(req.body);
    res.status(200).json({
      status: "ok",
      message: `${req.body.fullname} was created successfully`,
      data: dir,
    });
  } catch (error) {
    console.log(error);
  }
};

const getAllMdaDirectory = async (req, res) => {
  try {
    const getMdaDirectory = await Mda_Directory.find({}).populate(
      "adminUser",
      "firstname lastname email role mda mdaFullname",
    );
    res.status(200).json(getMdaDirectory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingleMdaDirectory = async (req, res) => {
  try {
    const { id } = req.params;

    const getSingleMdaDirectory = await Mda_Directory.find({
      name: id,
    }).populate("adminUser", "firstname lastname email role mda mdaFullname");

    if (!getSingleMdaDirectory) {
      res.status(404).json({ message: "Oops MDA not found!" });
    } else {
      res.status(200).json(getSingleMdaDirectory);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMdaDirectory = async (req, res) => {
  try {
    const { id } = req.params;

    const getSingleMdaAndUpdateDirectory =
      await Mda_Directory.findByIdAndUpdate(id, req.body);

    if (!getSingleMdaAndUpdateDirectory) {
      res.status(404).json({ message: "Oops MDA not found!" });
    } else {
      const updatedMdaDirectory = await Mda_Directory.findById(id).populate(
        "adminUser",
        "firstname lastname email role mda mdaFullname",
      );
      res.status(200).json({
        status: "ok",
        message: "Your Information has been updated successfully!",
        data: updatedMdaDirectory,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadFile = async (req, res) => {
  try {
    const { photo } = req.body;

    if (Object.keys(photo).length) {
      await UploaderMiddleware(photo).then(async (response) => {
        res.status(200).json({ status: "ok", url: response.secure_url });
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMdaDirectory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the MDA directory first
    const mdaDirectory = await Mda_Directory.findById(id);
    if (!mdaDirectory) {
      return res.status(404).json({
        status: "error",
        message: "MDA directory not found",
      });
    }

    // Delete the associated admin user if exists
    if (mdaDirectory.adminUser) {
      await MdaAdminUser.findByIdAndDelete(mdaDirectory.adminUser);
    }

    // Delete the MDA directory
    await Mda_Directory.findByIdAndDelete(id);

    res.status(200).json({
      status: "ok",
      message: "MDA directory and associated admin user deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllMdaDirectory,
  updateMdaDirectory,
  getSingleMdaDirectory,
  addDir,
  uploadFile,
  deleteMdaDirectory,
};
