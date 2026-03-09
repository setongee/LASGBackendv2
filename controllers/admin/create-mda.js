const { Mda_Directory } = require("../../models/mda.directory.model");
const MdaAdminUser = require("../../models/admin/admin-auth.model");
const bcrypt = require("bcrypt");

const createMdaAdmin = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      role,
      mdaFullname,
      proposedSlug,
      type,
    } = req.body;

    // Validate required fields
    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !role ||
      !mdaFullname ||
      !proposedSlug ||
      !type
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "All fields are required: firstname, lastname, email, password, role, mdaFullname, proposedSlug, type",
      });
    }

    // Validate type enum
    if (!["full", "service"].includes(type)) {
      return res.status(400).json({
        status: "error",
        message: "Type must be either 'full' or 'service'",
      });
    }

    // Check if email already exists
    const existingUser = await MdaAdminUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email already in use",
      });
    }

    // Check if MDA with this slug already exists
    const existingMda = await Mda_Directory.findOne({ slug: proposedSlug });
    if (existingMda) {
      return res.status(400).json({
        status: "error",
        message: "MDA with this slug already exists",
      });
    }

    // Create MDA record
    const mdaData = {
      fullname: mdaFullname,
      name: proposedSlug,
      slug: proposedSlug,
      type: type,
    };

    // Add landingPage configuration
    if (req.body.enabledSections) {
      mdaData.landingPage = {
        enabledSections: req.body.enabledSections,
      };
    }

    const createdMda = await Mda_Directory.create(mdaData);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const adminUser = new MdaAdminUser({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role,
      mda: proposedSlug,
      mdaFullname,
    });

    await adminUser.save();

    // Update MDA with admin user reference
    createdMda.adminUser = adminUser._id;
    await createdMda.save();

    // Get MDA with populated admin user data
    const mdaWithAdmin = await Mda_Directory.findById(createdMda._id).populate(
      "adminUser",
      "firstname lastname email role mda mdaFullname",
    );

    // Remove password from response
    adminUser.password = password;

    res.status(201).json({
      status: "success",
      message: "MDA and admin user created successfully",
      data: {
        mda: mdaWithAdmin,
        admin: adminUser,
      },
    });
  } catch (error) {
    console.error("Error creating MDA admin:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while creating MDA admin",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updateMdaAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstname, lastname, email, fullname, slug, type } = req.body;

    // Find the MDA directory
    const mdaDirectory = await Mda_Directory.findById(id);
    if (!mdaDirectory) {
      return res.status(404).json({
        status: "error",
        message: "MDA directory not found",
      });
    }

    // Find the admin user
    const adminUser = await MdaAdminUser.findById(mdaDirectory.adminUser);
    if (!adminUser) {
      return res.status(404).json({
        status: "error",
        message: "Admin user not found",
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== adminUser.email) {
      const existingEmail = await MdaAdminUser.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          status: "error",
          message: "Email already in use",
        });
      }
    }

    // Check if slug is being changed and if it already exists
    if (slug && slug !== mdaDirectory.slug) {
      const existingSlug = await Mda_Directory.findOne({ slug });
      if (existingSlug) {
        return res.status(400).json({
          status: "error",
          message: "Slug already in use",
        });
      }
    }

    // Validate type enum if provided
    if (type && !["full", "service"].includes(type)) {
      return res.status(400).json({
        status: "error",
        message: "Type must be either 'full' or 'service'",
      });
    }

    // Update admin user
    const adminUpdateData = {};
    if (firstname) adminUpdateData.firstname = firstname;
    if (lastname) adminUpdateData.lastname = lastname;
    if (email) adminUpdateData.email = email;
    if (fullname) adminUpdateData.mdaFullname = fullname;
    if (slug) adminUpdateData.mda = slug;

    const updatedAdminUser = await MdaAdminUser.findByIdAndUpdate(
      mdaDirectory.adminUser,
      adminUpdateData,
      { new: true, runValidators: true },
    );

    // Update MDA directory
    const mdaUpdateData = {};
    if (fullname) mdaUpdateData.fullname = fullname;
    if (slug) {
      mdaUpdateData.slug = slug;
      mdaUpdateData.name = slug;
    }
    if (type) mdaUpdateData.type = type;

    // Handle landingPage configuration
    if (req.body.enabledSections) {
      // Get current landingPage or create default
      const currentLandingPage = mdaDirectory.landingPage || {};

      mdaUpdateData.landingPage = {
        ...currentLandingPage, // Preserve existing data
        enabledSections: req.body.enabledSections, // Use provided enabledSections
      };
    }

    const updatedMdaDirectory = await Mda_Directory.findByIdAndUpdate(
      id,
      mdaUpdateData,
      { new: true, runValidators: true },
    ).populate("adminUser", "firstname lastname email role mda mdaFullname");

    res.status(200).json({
      status: "success",
      message: "MDA and admin user updated successfully",
      data: {
        mda: updatedMdaDirectory,
        admin: updatedAdminUser,
      },
    });
  } catch (error) {
    console.error("Error updating MDA admin:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while updating MDA admin",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  createMdaAdmin,
  updateMdaAdmin,
};
