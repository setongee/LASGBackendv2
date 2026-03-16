import axios from "axios";

export const sendEmail = async ({ to, subject, content }) => {
  try {
    if (!to || !subject || !content) {
      return {
        success: false,
        message: "to, subject and content are required",
      };
    }

    const response = await axios.post(
      "https://api.sendchamp.com/api/v1/email/send",
      {
        subject,
        to: [
          {
            email: to.email,
            name: to.name || "",
          },
        ],
        from: {
          email: "noreply@lasgsuperadmin.com",
          name: "Lagos State Admin",
        },
        message_body: {
          type: "text/html",
          value: content,
        },
      },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: `Bearer ${process.env.SENDCHAMP_API_KEY}`,
        },
      },
    );

    return {
      success: true,
      message: "Email sent successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Email error:", error?.response?.data || error.message);

    return {
      success: false,
      message: "Failed to send email",
      error: error?.response?.data || error.message,
    };
  }
};
