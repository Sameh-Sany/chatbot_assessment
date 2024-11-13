const express = require("express");
const { chatbot } = require("../controllers/chatController");

const router = express.Router();

router.post("/", chatbot);

module.exports = router;
