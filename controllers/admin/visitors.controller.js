const Visit = require("../../models/admin/analytics.model");

const handleAnalytics = async (req, res) => {
  try {
    const visit = await Visit({
      siteName: req.body.siteName,
      userId: req.body.userId,
      sessionId: req.body.sessionId,
      page: req.body.page,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      referrer: req.body.referrer,
      browser: req.body.browser,
      device: req.body.device,
      os: req.body.os,
    });

    await visit.save();
    res.status(201).json({ success: true, visitId: visit._id });
  } catch (error) {
    console.error("Error logging visit:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getSiteStats = async (req, res) => {
  try {
    const { period, siteName } = req.query;

    if (!siteName) {
      return res.status(400).json({
        success: false,
        error: "siteName is required",
      });
    }

    const dateRanges = {
      today: new Date(new Date().setHours(0, 0, 0, 0)),
      week: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      "3months": new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      year: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    };

    const startDate = dateRanges[period] || dateRanges.week;

    const baseQuery = {
      siteName,
      timestamp: { $gte: startDate },
    };

    // Get total visits for this site
    const totalVisits = await Visit.countDocuments(baseQuery);

    // Get unique users for this site
    const uniqueUsers = await Visit.distinct("userId", {
      ...baseQuery,
      userId: { $ne: null },
    });

    // Get unique sessions for this site
    const uniqueSessions = await Visit.distinct("sessionId", baseQuery);

    // Get visits by day for this site
    const visitsByDay = await Visit.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get top pages for this site
    const topPages = await Visit.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: "$page",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get device breakdown for this site
    const deviceBreakdown = await Visit.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: "$device",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get browser breakdown for this site
    const browserBreakdown = await Visit.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: "$browser",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      siteName,
      period,
      startDate,
      stats: {
        totalVisits,
        uniqueUsers: uniqueUsers.length,
        uniqueSessions: uniqueSessions.length,
        visitsByDay,
        topPages,
        deviceBreakdown,
        browserBreakdown,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCustomStats = async (req, res) => {
  try {
    const { startDate, endDate, siteName } = req.query;

    if (!siteName) {
      return res.status(400).json({
        success: false,
        error: "siteName is required",
      });
    }

    const query = {
      siteName,
      timestamp: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    const totalVisits = await Visit.countDocuments(query);

    const visitsByDay = await Visit.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      siteName,
      startDate,
      endDate,
      stats: {
        totalVisits,
        visitsByDay,
      },
    });
  } catch (error) {
    console.error("Error fetching custom stats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getVisitsBySites = async (req, res) => {
  try {
    const { period } = req.query;

    const dateRanges = {
      today: new Date(new Date().setHours(0, 0, 0, 0)),
      week: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      "3months": new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      year: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    };

    const startDate = dateRanges[period] || dateRanges.week;

    const siteStats = await Visit.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$siteName",
          totalVisits: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userId" },
          uniqueSessions: { $addToSet: "$sessionId" },
        },
      },
      {
        $project: {
          siteName: "$_id",
          totalVisits: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
          uniqueSessions: { $size: "$uniqueSessions" },
        },
      },
      {
        $sort: { totalVisits: -1 },
      },
    ]);

    res.json({
      success: true,
      period,
      startDate,
      sites: siteStats,
    });
  } catch (error) {
    console.error("Error fetching site stats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  handleAnalytics,
  getSiteStats,
  getCustomStats,
  getVisitsBySites,
};
