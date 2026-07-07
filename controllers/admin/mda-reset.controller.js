const adminUser = require("../../models/admin/admin-auth.model");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../../services/email/email");

const getResetRequests = async (req, res) => {
  try {
    const users = await adminUser.find({ resetRequested: true }).select(
      "firstname lastname email mda mdaFullname role createdAt"
    );

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
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px;">
          <h2 style="color: #00484d;">Your Password Has Been Reset</h2>
          <p>Hello ${user.firstname},</p>
          <p>Your password has been reset by the Lagos State Super Admin. Here are your new login credentials:</p>
          <div style="background: #f2f8f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 6px 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 6px 0;"><strong>Password:</strong> ${newPassword}</p>
          </div>
          <p style="color: #e55;">Please log in and change your password immediately for security.</p>
          <p style="color: #777; font-size: 13px;">If you did not request this reset, please contact your system administrator immediately.</p>
        </div>
      `,
    });

    return res.status(200).json({
      status: "ok",
      message: `Password reset successfully. New credentials have been emailed to ${user.email}`,
    });
  } catch (error) {
    res.status(500).json({ status: "bad", message: "Something went wrong!" });
  }
};

module.exports = { getResetRequests, resetMdaPassword };
