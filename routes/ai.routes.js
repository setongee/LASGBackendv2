const express = require("express");
const router = express.Router();
const { chatComplete, embed, generateImage, agentChat, agentChatStream } = require("../controllers/ai.controller");

router.post("/chat", chatComplete);
router.post("/agent-chat", agentChat);
router.post("/agent-chat/stream", agentChatStream);
router.post("/embeddings", embed);
router.post("/image", generateImage);

module.exports = router;
