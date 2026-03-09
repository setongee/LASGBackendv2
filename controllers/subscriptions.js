//call in the subscription model
const subscribers = require("../models/subscription");

// add subscribers logic
const addSubscribers = async (req, res) => {
  try {
    const { email, mdaDirectory } = req.body;

    // Check if email already exists for this MDA
    const existingSubscriber = await subscribers.findOne({
      email,
      mdaDirectory,
    });
    if (existingSubscriber) {
      return res.status(400).json({
        status: "error",
        message:
          "This email already exists for this MDA. Please use another email.",
      });
    }

    const subscribersRef = await subscribers.create(req.body);

    res.status(200).json({
      status: "ok",
      message: `${req.body.email} has been subscribed successfully`,
      data: subscribersRef,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update subscription either tags or email or fullname
const updateSubscription = async (req, res) => {
  const { id } = req.params;

  try {
    const subscribersRef = await subscribers.findByIdAndUpdate(id, req.body);

    res.status(200).json({
      status: "ok",
      message: `Hey ${req.body.fullname}, your subscription has been updated successfully`,
      data: subscribersRef,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get all subscribers
const getAllSubscriptions = async (req, res) => {
  try {
    const subscribersRef = await subscribers
      .find({})
      .populate("mdaDirectory", "fullname name slug type");
    res.status(200).json({
      status: "ok",
      message: `Fetched all data successfully...`,
      data: subscribersRef,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get a single subscriber
const getSingleSubscriptions = async (req, res) => {
  try {
    const { id } = req.params;

    const subscribersRef = await subscribers
      .findById(id)
      .populate("mdaDirectory", "fullname name slug type");

    res.status(200).json({
      status: "ok",
      message: `Fetched all data successfully...`,
      data: subscribersRef,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get subscribers by MDA directory
const getSubscriptionsByMda = async (req, res) => {
  try {
    const { mdaId } = req.params;

    const subscribersRef = await subscribers
      .find({ mdaDirectory: mdaId })
      .populate("mdaDirectory", "fullname name slug type");
    res.status(200).json({
      status: "ok",
      message: `Fetched subscribers for MDA successfully...`,
      data: subscribersRef,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// cancel subscription
const cancelSubscriptions = async (req, res) => {
  try {
    const { id } = req.params;

    const subscribersRef = await subscribers.findByIdAndDelete(id);

    res.status(200).json({
      status: "ok",
      message: `Subscription cancelled successfully...`,
      data: subscribersRef,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllSubscriptions,
  getSingleSubscriptions,
  addSubscribers,
  cancelSubscriptions,
  updateSubscription,
  getSubscriptionsByMda,
};
