const PublishBucket = require("../models/publish-bucket.model");
const WebTemplateRequest = require("../models/web-template-request.model");
const AdminUser = require("../models/admin/admin-auth.model");
const { Mda_Directory } = require("../models/mda.directory.model");

const getDashboardAlerts = async (req, res) => {
  try {
    const [pendingPublish, pendingTemplates, pendingResets, offlineSites] =
      await Promise.all([
        PublishBucket.find({ status: "pending" }).sort({ createdAt: 1 }),
        WebTemplateRequest.find({ status: "pending" }).sort({
          createdAt: 1,
        }),
        AdminUser.find({ resetRequested: true })
          .select("firstname lastname mda mdaFullname updatedAt")
          .sort({ updatedAt: 1 }),
        Mda_Directory.find({ isOffline: true }).select("name fullname"),
      ]);

    const pendingRequests = [
      ...pendingPublish.map((bucket) => ({
        type: "publish_page_request",
        label: `Publish request for ${bucket.mda}`,
        mda: bucket.mda,
        createdAt: bucket.createdAt,
      })),
      ...pendingTemplates.map((request) => ({
        type: "web_template_request",
        label: `Template request from ${request.mda}`,
        mda: request.mda,
        createdAt: request.createdAt,
      })),
    ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const pendingPasswordResets = pendingResets.map((user) => ({
      type: "password_reset_request",
      label: `${user.firstname} ${user.lastname} (${user.mdaFullname})`,
      mda: user.mda,
      createdAt: user.updatedAt,
    }));

    res.status(200).json({
      status: "ok",
      offlineSites: {
        count: offlineSites.length,
        items: offlineSites
          .slice(0, 5)
          .map((site) => ({ name: site.name, fullname: site.fullname })),
      },
      pendingPasswordResets: {
        count: pendingPasswordResets.length,
        items: pendingPasswordResets.slice(0, 5),
      },
      pendingRequests: {
        count: pendingRequests.length,
        items: pendingRequests.slice(0, 5),
      },
    });
  } catch (error) {
    res.status(500).json({ status: "bad", message: error.message });
  }
};

module.exports = { getDashboardAlerts };
