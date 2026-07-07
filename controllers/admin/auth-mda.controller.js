const adminUser = require("../../models/admin/admin-auth.model");
const superAdminUser = require("../../models/admin.model");
const { secret_key } = require("../../configs/jwt.config");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { refreshToken } = require("../../utils/jwt.utils");
const { sendEmail } = require("../../services/email/email");

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

const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(200).json({ status: "bad", message: "Email is required" });
    }

    const user = await adminUser.findOne({ email });

    if (!user) {
      return res.status(200).json({
        status: "bad",
        message: "No account found with that email address",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.resetRequested = false;
    await user.save();

    await sendEmail({
      to: { email: user.email, name: `${user.firstname} ${user.lastname}` },
      subject: "Your Password Reset Code",
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px;">
          <h2 style="color: #00484d;">Password Reset Request</h2>
          <p>Hello ${user.firstname},</p>
          <p>You requested a password reset. Use the code below to verify your identity:</p>
          <div style="background: #f2f8f5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #00484d;">${otp}</span>
          </div>
          <p style="color: #777; font-size: 13px;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    return res.status(200).json({
      status: "ok",
      message: "A verification code has been sent to your email address",
    });
  } catch (error) {
    res.status(500).json({ status: "bad", message: "Something went wrong!" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(200).json({ status: "bad", message: "Email and OTP are required" });
    }

    const user = await adminUser.findOne({ email });

    if (!user) {
      return res.status(200).json({ status: "bad", message: "No account found with that email address" });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(200).json({ status: "bad", message: "No active reset code found. Please request a new one." });
    }

    if (new Date() > user.otpExpiry) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(200).json({ status: "bad", message: "This code has expired. Please request a new one." });
    }

    if (user.otp !== otp.toString()) {
      return res.status(200).json({ status: "bad", message: "Incorrect code. Please try again." });
    }

    user.otp = null;
    user.otpExpiry = null;
    user.resetRequested = true;
    await user.save();

    const superAdmins = await superAdminUser.find({ role: "admin" });

    await Promise.all(
      superAdmins.map((admin) =>
        sendEmail({
          to: { email: admin.email, name: `${admin.firstname} ${admin.lastname}` },
          subject: "Password Reset Request from MDA Admin",
          content: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px;">
              <h2 style="color: #00484d;">Password Reset Request</h2>
              <p>An MDA admin has verified their identity and is requesting a password reset:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td style="padding: 8px; color: #555;">Name:</td><td style="padding: 8px; font-weight: bold;">${user.firstname} ${user.lastname}</td></tr>
                <tr><td style="padding: 8px; color: #555;">Email:</td><td style="padding: 8px;">${user.email}</td></tr>
                <tr><td style="padding: 8px; color: #555;">MDA:</td><td style="padding: 8px;">${user.mdaFullname}</td></tr>
                <tr><td style="padding: 8px; color: #555;">Role:</td><td style="padding: 8px;">${user.role}</td></tr>
              </table>
              <p>Please log in to the Super Admin dashboard to reset their password and send them new credentials.</p>
            </div>
          `,
        })
      )
    );

    return res.status(200).json({
      status: "ok",
      message: "Identity verified successfully",
    });
  } catch (error) {
    res.status(500).json({ status: "bad", message: "Something went wrong!" });
  }
};

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
  requestOtp,
  verifyOtp,
};
