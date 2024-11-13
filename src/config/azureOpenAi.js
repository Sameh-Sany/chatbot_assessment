const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.AZURE_OPENAI_API_KEY;
const ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const API_VERSION = "2024-10-21";
const MODEL = "gpt-4";

const azureOpenAi = axios.create({
  baseURL: `${ENDPOINT}/openai/deployments/${MODEL}/chat/completions?api-version=${API_VERSION}`,
  headers: {
    "Content-Type": "application/json",
    "api-key": API_KEY,
  },
});

module.exports = azureOpenAi;
