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
    } = req.body;

    // Validate required fields
    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !role ||
      !mdaFullname ||
      !proposedSlug
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "All fields are required: firstname, lastname, email, password, role, mdaFullname, proposedSlug",
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
    };

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
    });

    await adminUser.save();

    // Remove password from response
    adminUser.password = password;

    res.status(201).json({
      status: "success",
      message: "MDA and admin user created successfully",
      data: {
        mda: createdMda,
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

module.exports = {
  createMdaAdmin,
};
