const adminUser = require("../models/admin.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { secret_key } = require("../configs/jwt.config");
const { sendEmail } = require("../services/email/email");

const register = async (req, res) => {
  try {
    const { email, password, role, firstname, lastname } = req.body;

    const user = await adminUser.findOne({ email });

    if (user) {
      return res.status(200).json({
        status: "bad",
        message: `${email} already exists, try a different email`,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await adminUser({
      email,
      password: hashedPassword,
      role,
      lastname,
      firstname,
      lastLogin: "",
    });
    await newAdmin.save();

    sendEmail({
      to: { email, name: `${firstname} ${lastname}` },
      subject: "Lagos State Admin Portal Account Created",
      content: `${firstname} ${lastname}, an account has been created for you with Lagos State Admin Portal with the role of ${role}. Your email is ${email} and your password is ${password}. The URL to login is: http://backendadmin.lagosstate.gov.ng/login`,
    });
    res.status(200).json({
      status: "ok",
      message: `${firstname} ${lastname} has been registered with ${email} with the role of ${role}`,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, date } = req.body;

    const user = await adminUser.findOne({ email });

    if (!user) {
      return res
        .status(200)
        .json({ status: "bad", message: `${email} does not exist` });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(200)
        .json({ status: "bad", message: "Password incorrect, try again" });
    }

    user.lastLogin = date;

    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.emal,
        role: user.role,
      },
      secret_key,
      { expiresIn: "1h" },
    );

    res.status(200).json({ status: "ok", token });
  } catch (error) {
    res.status(500).json({ status: "bad", message: "Something went wrong!" });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userRef = await adminUser.findById(id);
    res.status(200).json({
      status: "ok",
      message: "Fetched single data successfully...",
      data: await userRef,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await adminUser.findByIdAndDelete(id);

    if (user) {
      res
        .status(200)
        .json({ status: "ok", message: "User deleted successfully..." });
    } else {
      res.status(200).json({ status: "error", message: "User not found..." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const userRef = await adminUser.find({});
    res.status(200).json({
      status: "ok",
      message: "Fetched single data successfully...",
      data: await userRef,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { password, newPassword } = req.body;
    const { id } = req.params;

    const user = await adminUser.findById(id);

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(200).json({
        status: "bad",
        message: "Old password is incorrect, try again",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const userRef = await adminUser.findByIdAndUpdate(id, user);
    userRef.password = hashedPassword;

    await userRef.save();

    if (!userRef) {
      res.status(200).json({ status: "bad", message: "Oops user not found!" });
    } else {
      res.status(200).json({ status: "ok", message: "Password updated!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addLastLogin = async (id, date) => {
  try {
    const user = await adminUser.findById(id);

    const userRef = await adminUser.findByIdAndUpdate(id, user);
    userRef.lastLogin = date;

    await userRef.save();

    if (!userRef) {
      return res
        .status(200)
        .json({ status: "bad", message: "Oops user not found!" });
    } else {
      return res
        .status(200)
        .json({ status: "ok", message: "login records updated!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getUser,
  updatePassword,
  getUsers,
  addLastLogin,
  deleteUser,
};
