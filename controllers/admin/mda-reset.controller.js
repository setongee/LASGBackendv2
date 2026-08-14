const adminUser = require("../../models/admin/admin-auth.model");
const superAdminUser = require("../../models/admin.model");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../../services/email/email");
const { generatePassword } = require("./create-mda");

const getResetRequests = async (req, res) => {
  try {
    // `updatedAt` reflects when `resetRequested` was last flipped to true
    // (verifyOtp saves it) — `createdAt` is the account's creation date and
    // would misrepresent how long the request has actually been waiting.
    const users = await adminUser
      .find({ resetRequested: true })
      .select("firstname lastname email mda mdaFullname role updatedAt")
      .sort({ updatedAt: 1 });

    return res.status(200).json({
      status: "ok",
      message: "Fetched reset requests successfully",
      data: users,
    });
  } catch (error) {
    res.status(500).json({ status: "bad", message: "Something went wrong!" });
  }
};

const resetMdaPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(200).json({ status: "bad", message: "New password is required" });
    }

    const user = await adminUser.findById(id);

    if (!user) {
      return res.status(200).json({ status: "bad", message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetRequested = false;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    await sendEmail({
      to: { email: user.email, name: `${user.firstname} ${user.lastname}` },
      subject: "Your New Login Credentials",
      content: `Hello ${user.firstname},

Your password has been reset by the Lagos State Super Admin. Here are your new login credentials:

Email: ${user.email}
Password: ${newPassword}

Please log in and change your password immediately for security.

If you did not request this reset, please contact your system administrator immediately.`,
    });

    return res.status(200).json({
      status: "ok",
      message: `Password reset successfully. New credentials have been emailed to ${user.email}`,
    });
  } catch (error) {
    res.status(500).json({ status: "bad", message: "Something went wrong!" });
  }
};

const resendMdaCredentials = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await adminUser.findById(id);

    if (!user) {
      return res.status(200).json({ status: "bad", message: "User not found" });
    }

    const newPassword = generatePassword(user.mda);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetRequested = false;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    await sendEmail({
      to: { email: user.email, name: `${user.firstname} ${user.lastname}` },
      subject: "Your Lagos State Portal Login Credentials",
      content: `Hello ${user.firstname},

Here are your login credentials for the Lagos State ${user.mdaFullname} portal, resent by the Super Admin:

Email: ${user.email}
Password: ${newPassword}
The URL to login is: https://lagosstate.gov.ng/${user.mda}/admin/login

Please log in and change your password immediately for security.

If you did not expect this email, please contact your system administrator immediately.`,
    });

    return res.status(200).json({
      status: "ok",
      message: `Login credentials have been resent to ${user.email}`,
    });
  } catch (error) {
    res.status(500).json({ status: "bad", message: "Something went wrong!" });
  }
};

const changeMdaAdminEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(200).json({
        status: "bad",
        message: "New email and your password are required",
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({ status: "bad", message: "Unauthorized" });
    }

    // Confirm the currently logged-in super admin's own password before allowing the change
    const confirmingAdmin = await superAdminUser.findById(req.user.id);
    if (!confirmingAdmin) {
      return res.status(401).json({ status: "bad", message: "Unauthorized" });
    }

    const isMatch = await bcrypt.compare(password, confirmingAdmin.password);
    if (!isMatch) {
      return res.status(200).json({
        status: "bad",
        message: "Your password is incorrect",
      });
    }

    const user = await adminUser.findById(id);
    if (!user) {
      return res.status(200).json({ status: "bad", message: "Admin user not found" });
    }

    if (newEmail === user.email) {
      return res.status(200).json({
        status: "bad",
        message: "New email must be different from the current email",
      });
    }

    const existingEmail = await adminUser.findOne({ email: newEmail });
    if (existingEmail) {
      return res.status(200).json({ status: "bad", message: "Email already in use" });
    }

    const newPassword = generatePassword(user.mda);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.email = newEmail;
    user.password = hashedPassword;
    user.resetRequested = false;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    await sendEmail({
      to: { email: newEmail, name: `${user.firstname} ${user.lastname}` },
      subject: "Your Lagos State Portal Login Email Has Changed",
      content: `Hello ${user.firstname},

Your login email for the Lagos State ${user.mdaFullname} portal has been changed by the Super Admin.

Your new login email is: ${newEmail}
Your new password is: ${newPassword}
The URL to login is: https://lagosstate.gov.ng/${user.mda}/admin/login

Please log in and change your password immediately for security.

If you did not expect this change, please contact your system administrator immediately.`,
    });

    return res.status(200).json({
      status: "ok",
      message: `Email updated successfully. New login credentials have been sent to ${newEmail}`,
    });
  } catch (error) {
    console.error("Error changing MDA admin email:", error);
    res.status(500).json({ status: "bad", message: "Something went wrong!" });
  }
};

module.exports = {
  getResetRequests,
  resetMdaPassword,
  resendMdaCredentials,
  changeMdaAdminEmail,
};
