const openrouter = require("../services/ai/openrouter.service");
const agent = require("../services/ai/agent.service");

const chatComplete = async (req, res) => {
  try {
    const { messages, models, maxTokens, temperature, webSearch, responseFormat, reasoningEffort } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ status: "bad", message: "messages array is required" });
    }

    const result = await openrouter.chatComplete({
      messages,
      models,
      maxTokens,
      temperature,
      webSearch,
      responseFormat,
      reasoningEffort,
    });
    res.status(200).json({ status: "ok", ...result });
  } catch (error) {
    res.status(500).json({ status: "bad", message: error.message });
  }
};

const embed = async (req, res) => {
  try {
    const { input, model, dimensions } = req.body;

    if (!input) {
      return res.status(400).json({ status: "bad", message: "input is required" });
    }

    const vectors = await openrouter.embed({ input, model, dimensions });
    res.status(200).json({ status: "ok", data: vectors });
  } catch (error) {
    res.status(500).json({ status: "bad", message: error.message });
  }
};

const generateImage = async (req, res) => {
  try {
    const { prompt, model, aspectRatio } = req.body;

    if (!prompt) {
      return res.status(400).json({ status: "bad", message: "prompt is required" });
    }

    const image = await openrouter.generateImage({ prompt, model, aspectRatio });
    res.status(200).json({ status: "ok", ...image });
  } catch (error) {
    res.status(500).json({ status: "bad", message: error.message });
  }
};

const agentChat = async (req, res) => {
  try {
    const { messages, webSearch, maxTokens, temperature, reasoningEffort } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ status: "bad", message: "messages array is required" });
    }

    const result = await agent.runAgentChat({ messages, webSearch, maxTokens, temperature, reasoningEffort });
    res.status(200).json({ status: "ok", ...result });
  } catch (error) {
    res.status(500).json({ status: "bad", message: error.message });
  }
};

const agentChatStream = async (req, res) => {
  try {
    const { messages, webSearch, maxTokens, temperature, reasoningEffort } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ status: "bad", message: "messages array is required" });
    }

    await agent.runAgentChatStream({ messages, webSearch, maxTokens, temperature, reasoningEffort }, res);
  } catch (error) {
    if (res.headersSent) {
      res.end();
    } else {
      res.status(500).json({ status: "bad", message: error.message });
    }
  }
};

module.exports = { chatComplete, embed, generateImage, agentChat, agentChatStream };
