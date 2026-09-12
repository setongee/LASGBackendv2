// Server-side OpenRouter client. Holds the API key and is the only place in
// the codebase allowed to call openrouter.ai directly — every AI feature
// (chat, embeddings, image generation) across the frontends proxies through
// the /api/v2/ai routes instead of calling any AI provider from the browser.
const axios = require("axios");

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const APP_REFERER = "https://lagosstate.gov.ng";
const APP_TITLE = "LASG Eko Smart";

// Paid, tool-calling-capable model for every chat/generation call (RAG chat,
// suggestions, follow-ups, admin content generation, keyword generation).
// Deliberately not a free-tier model — those are unreliable at following the
// strict behavioral rules baked into our system prompts and at tool calling.
const DEFAULT_CHAT_MODELS = ["openai/gpt-5-mini"];

// Must stay 768 — the Supabase pgvector columns (match_chunks / match_lagos_services)
// are fixed at this dimensionality. Do not change without a migration.
const DEFAULT_EMBEDDING_MODEL = "google/gemini-embedding-001";
const DEFAULT_EMBEDDING_DIMENSIONS = 768;

const DEFAULT_IMAGE_MODEL = "google/gemini-2.5-flash-image";

function headers() {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured on the server");
  }
  return {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": APP_REFERER,
    "X-Title": APP_TITLE,
  };
}

// GPT-5-family models reason before answering by default, and that hidden
// chain-of-thought counts against max_tokens and against cost — a trivial
// "generate 5 short questions" call can silently burn its entire token
// budget on invisible reasoning and return empty content. "low" is a sane
// default for everything (tool calling still works reliably at this level);
// callers doing genuinely simple generation (suggestions, follow-ups,
// keyword lists) should pass "minimal" for the fastest, cheapest response.
const DEFAULT_REASONING_EFFORT = "low";

const chatComplete = async ({
  messages,
  models = DEFAULT_CHAT_MODELS,
  maxTokens = 1536,
  temperature = 0.7,
  webSearch = false,
  responseFormat,
  reasoningEffort = DEFAULT_REASONING_EFFORT,
}) => {
  const body = { models, messages, max_tokens: maxTokens, temperature, reasoning: { effort: reasoningEffort } };
  if (webSearch) body.tools = [{ type: "openrouter:web_search" }];
  if (responseFormat) body.response_format = responseFormat;

  const { data } = await axios.post(`${OPENROUTER_BASE_URL}/chat/completions`, body, {
    headers: headers(),
  });

  const message = data.choices?.[0]?.message;
  const webSources = (message?.annotations || [])
    .filter((a) => a.type === "url_citation")
    .map((a) => ({ title: a.url_citation?.title, url: a.url_citation?.url }));

  return { content: message?.content || "", webSources };
};

// Returns the raw assistant message (including `tool_calls`, if the model
// wants to call a tool) rather than just extracted text. Used by the agent
// loop, which needs to see and act on tool_calls itself.
const chatCompleteRaw = async ({
  messages,
  tools,
  models = DEFAULT_CHAT_MODELS,
  maxTokens = 1536,
  temperature = 0.7,
  reasoningEffort = DEFAULT_REASONING_EFFORT,
}) => {
  const body = { models, messages, max_tokens: maxTokens, temperature, reasoning: { effort: reasoningEffort } };
  if (tools && tools.length) body.tools = tools;

  const { data } = await axios.post(`${OPENROUTER_BASE_URL}/chat/completions`, body, {
    headers: headers(),
  });

  return data.choices?.[0]?.message || {};
};

// Returns the raw Node stream of SSE bytes for a tool-aware streaming call —
// used by the agent loop, which needs to accumulate both content deltas
// (forward to the client live) and tool_call deltas (arrive fragmented across
// chunks, keyed by index — must be reassembled before they're usable).
const chatStreamRaw = async ({
  messages,
  tools,
  models = DEFAULT_CHAT_MODELS,
  maxTokens = 1536,
  temperature = 0.7,
  reasoningEffort = DEFAULT_REASONING_EFFORT,
}) => {
  const body = {
    models,
    messages,
    max_tokens: maxTokens,
    temperature,
    stream: true,
    reasoning: { effort: reasoningEffort },
  };
  if (tools && tools.length) body.tools = tools;

  const response = await axios.post(`${OPENROUTER_BASE_URL}/chat/completions`, body, {
    headers: headers(),
    responseType: "stream",
  });

  return response.data;
};

const embed = async ({ input, model = DEFAULT_EMBEDDING_MODEL, dimensions = DEFAULT_EMBEDDING_DIMENSIONS }) => {
  const body = { model, input };
  if (dimensions) body.dimensions = dimensions;

  const { data } = await axios.post(`${OPENROUTER_BASE_URL}/embeddings`, body, {
    headers: headers(),
  });

  const vectors = (data.data || []).map((d) => d.embedding);

  if (dimensions) {
    const mismatched = vectors.find((vec) => vec.length !== dimensions);
    if (mismatched) {
      throw new Error(
        `Embedding dimension mismatch: expected ${dimensions}, got ${mismatched.length}. ` +
          `The pgvector schema requires an exact match — verify the "dimensions" param is honored for model "${model}".`
      );
    }
  }

  return vectors;
};

const generateImage = async ({ prompt, model = DEFAULT_IMAGE_MODEL, aspectRatio }) => {
  const body = { model, prompt };
  if (aspectRatio) body.image_config = { aspect_ratio: aspectRatio };

  const { data } = await axios.post(`${OPENROUTER_BASE_URL}/images`, body, {
    headers: headers(),
  });

  const image = data.data?.[0];
  if (!image?.b64_json) throw new Error("No image returned from OpenRouter");

  return { base64: image.b64_json, mimeType: image.media_type || "image/png" };
};

module.exports = {
  chatComplete,
  chatCompleteRaw,
  chatStreamRaw,
  embed,
  generateImage,
  DEFAULT_CHAT_MODELS,
  DEFAULT_EMBEDDING_MODEL,
  DEFAULT_EMBEDDING_DIMENSIONS,
  DEFAULT_IMAGE_MODEL,
};
