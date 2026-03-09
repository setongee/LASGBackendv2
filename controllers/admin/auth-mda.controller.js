const adminUser = require("../../models/admin/admin-auth.model");
const { secret_key } = require("../../configs/jwt.config");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { refreshToken } = require("../../utils/jwt.utils");

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

    res.status(200).json({
      status: "ok",
      message: `${firstname} ${lastname} has been registered with ${email} with the role of ${role}`,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

// login

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
        role: user.role,
        mda: user.mda,
        firstName: user.firstname,
        lastName: user.lastname,
      },
      secret_key,
      { expiresIn: "1h" },
    );

    res.status(200).json({ status: "ok", token });
  } catch (error) {
    res.status(500).json({ status: "bad", message: "Something went wrong!" });
  }
};

const logout = async (req, res) => {
  try {
    const { id } = req.user;

    if (id) {
      const user = await adminUser.findById(id);
      if (user) {
        user.lastLogout = new Date().toISOString();
        await user.save();
      }
    }

    res.status(200).json({
      status: "ok",
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "bad",
      message: "Something went wrong during logout",
    });
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

// refreshAuthToken
const refreshAuthToken = (req, res) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const newToken = refreshToken(token);
    return res.json({ token: newToken });
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
};

module.exports = { refreshAuthToken };

module.exports = {
  register,
  login,
  logout,
  getUser,
  updatePassword,
  getUsers,
  addLastLogin,
  deleteUser,
  refreshAuthToken,
};
