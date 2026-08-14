const Visit = require("../../models/admin/analytics.model");
const { Mda_Directory } = require("../../models/mda.directory.model");
const { isBot } = require("ua-parser-js/bot-detection");

// Same session logging the same page again within this window is treated as
// a duplicate (e.g. React StrictMode's double-invoke in dev, rapid remounts)
// rather than a second real visit.
const DUPLICATE_WINDOW_MS = 30 * 1000;

const handleAnalytics = async (req, res) => {
  try {
    const { siteName, page, sessionId } = req.body;

    if (!siteName || !page || !sessionId) {
      return res.status(400).json({
        success: false,
        error: "siteName, page and sessionId are required",
      });
    }

    const userAgent = req.headers["user-agent"] || "";
    const isAuthentic = !isBot(userAgent);

    const recentDuplicate = await Visit.findOne({
      siteName,
      page,
      sessionId,
      timestamp: { $gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
    });

    if (recentDuplicate) {
      return res.status(200).json({ success: true, visitId: recentDuplicate._id, duplicate: true });
    }

    const visit = await Visit({
      siteName,
      userId: req.body.userId,
      sessionId,
      page,
      userAgent,
      ipAddress: req.ip,
      referrer: req.body.referrer,
      browser: req.body.browser,
      device: req.body.device,
      os: req.body.os,
      isAuthentic,
      slug: req.body.slug,
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
      isAuthentic: true,
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

    // Get active (distinct) users by day for this site
    const activeUsersByDay = await Visit.aggregate([
      { $match: { ...baseQuery, userId: { $ne: null } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            userId: "$userId",
          },
        },
      },
      {
        $group: {
          _id: "$_id.day",
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
        activeUsersByDay,
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
      isAuthentic: true,
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
          isAuthentic: true,
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

const getTotalVisits = async (req, res) => {
  try {
    const totalVisits = await Visit.countDocuments();
    const latestVisit = await Visit.findOne()
      .sort({ timestamp: -1 })
      .select("timestamp");

    res.json({
      success: true,
      totalVisits,
      lastVisitAt: latestVisit ? latestVisit.timestamp : null,
    });
  } catch (error) {
    console.error("Error fetching total visits:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getTopVisitedApplications = async (req, res) => {
  try {
    const topSites = await Visit.aggregate([
      { $match: { isAuthentic: true } },
      { $group: { _id: "$siteName", totalVisits: { $sum: 1 } } },
      { $sort: { totalVisits: -1 } },
      { $limit: 5 },
    ]);

    const applications = await Promise.all(
      topSites.map(async (site) => {
        const directory = await Mda_Directory.findOne({
          name: site._id,
        }).select("name fullname slug logo");

        return {
          name: site._id,
          totalVisits: site.totalVisits,
          fullname: directory ? directory.fullname : site._id,
          slug: directory ? directory.slug : "",
          logo: directory ? directory.logo : null,
        };
      }),
    );

    res.json({ success: true, applications });
  } catch (error) {
    console.error("Error fetching top visited applications:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getVisitsTimeseries = async (req, res) => {
  try {
    const { granularity = "day" } = req.query;

    const bucketConfig = {
      day: {
        format: "%Y-%m-%d",
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      month: {
        format: "%Y-%m",
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      },
      year: {
        format: "%Y",
        startDate: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000),
      },
    };

    const { format, startDate } = bucketConfig[granularity] || bucketConfig.day;

    const visitsOverTime = await Visit.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          isAuthentic: true,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format, date: "$timestamp" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      granularity,
      data: visitsOverTime.map((entry) => ({
        date: entry._id,
        count: entry.count,
      })),
    });
  } catch (error) {
    console.error("Error fetching visits timeseries:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllVisits = async (req, res) => {
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
    const baseQuery = {
      timestamp: { $gte: startDate },
      isAuthentic: true,
    };

    // Get total visits
    const totalVisits = await Visit.countDocuments(baseQuery);

    // Get unique users
    const uniqueUsers = await Visit.distinct("userId", {
      ...baseQuery,
      userId: { $ne: null },
    });

    // Get unique sessions
    const uniqueSessions = await Visit.distinct("sessionId", baseQuery);

    // Get visits by day
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

    // Get top 5 performing sites
    const topSites = await Visit.aggregate([
      { $match: baseQuery },
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
      { $sort: { totalVisits: -1 } },
      { $limit: 5 },
    ]);

    // Get device breakdown
    const deviceBreakdown = await Visit.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: "$device",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get browser breakdown
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
      period,
      startDate,
      stats: {
        totalVisits,
        uniqueUsers: uniqueUsers.length,
        uniqueSessions: uniqueSessions.length,
        visitsByDay,
        topSites,
        deviceBreakdown,
        browserBreakdown,
      },
    });
  } catch (error) {
    console.error("Error fetching all visits:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  handleAnalytics,
  getSiteStats,
  getCustomStats,
  getVisitsBySites,
  getAllVisits,
  getTotalVisits,
  getVisitsTimeseries,
  getTopVisitedApplications,
};
