// The tool-calling loop: call the model with tools, execute whatever it asks
// for, feed results back, repeat until it gives a final answer (or we hit the
// iteration cap, at which point we force a final answer with no tools left).
//
// Two entry points:
//   - runAgentChat        non-streaming, returns the complete answer in one
//                          JSON response. Simpler, fully tested against a live
//                          server (see ai.controller.js history) — kept as a
//                          manual-testing/fallback path.
//   - runAgentChatStream  streams every round. Tool-resolution rounds carry no
//                          visible content (models emit tool_calls, not text,
//                          on those turns), so they're naturally invisible —
//                          only the final round's content deltas are forwarded
//                          to the client, giving real token-by-token streaming
//                          for the answer without streaming the "thinking".
const openrouter = require("./openrouter.service");
const { buildTools, executeTool } = require("./tools.service");

const MAX_ITERATIONS = 4;

// Runs every tool call from one round in parallel, updates `collected`
// in place, and returns the `tool` role messages to push into the transcript.
const runToolRound = async (toolCalls, collected) => {
  const toolResults = await Promise.all(
    toolCalls.map(async (toolCall) => {
      let args = {};
      try {
        args = JSON.parse(toolCall.function.arguments || "{}");
      } catch {
        args = {};
      }
      return { toolCall, result: await executeTool(toolCall.function.name, args) };
    })
  );

  return toolResults.map(({ toolCall, result }) => {
    if (result.services) collected.services.push(...result.services);
    if (result.downloadSources) collected.downloadSources.push(...result.downloadSources);
    if (result.sources) collected.sources.push(...result.sources);
    return { role: "tool", tool_call_id: toolCall.id, content: result.forModel };
  });
};

const runAgentChat = async ({
  messages,
  webSearch = true,
  maxTokens = 4096,
  temperature = 0.7,
  reasoningEffort = "low",
}) => {
  const tools = buildTools({ webSearch });
  const workingMessages = [...messages];
  const collected = { services: [], downloadSources: [], sources: [] };

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const message = await openrouter.chatCompleteRaw({
      messages: workingMessages,
      tools,
      maxTokens,
      temperature,
      reasoningEffort,
    });

    if (!message.tool_calls || message.tool_calls.length === 0) {
      const webSources = (message.annotations || [])
        .filter((a) => a.type === "url_citation")
        .map((a) => ({ title: a.url_citation?.title, url: a.url_citation?.url }));

      return {
        content: message.content || "",
        services: collected.services,
        downloadSources: collected.downloadSources,
        sources: collected.sources,
        webSources,
      };
    }

    workingMessages.push({
      role: "assistant",
      content: message.content || null,
      tool_calls: message.tool_calls,
    });
    workingMessages.push(...(await runToolRound(message.tool_calls, collected)));
  }

  // Iteration cap hit — force a final answer with no tools available so the
  // model has to respond with whatever it's gathered so far instead of looping.
  const finalMessage = await openrouter.chatCompleteRaw({
    messages: workingMessages,
    tools: [],
    maxTokens,
    temperature,
    reasoningEffort,
  });

  return {
    content: finalMessage.content || "",
    services: collected.services,
    downloadSources: collected.downloadSources,
    sources: collected.sources,
    webSources: [],
  };
};

// Consumes a Node Readable SSE stream, calling onDelta(parsedJson) for each
// `data:` line (skipping the `[DONE]` sentinel and malformed fragments).
const consumeSSE = (stream, onDelta) =>
  new Promise((resolve, reject) => {
    let buffer = "";
    stream.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          onDelta(JSON.parse(payload));
        } catch {
          // ignore malformed SSE fragments (e.g. split across chunk boundaries)
        }
      }
    });
    stream.on("end", resolve);
    stream.on("error", reject);
  });

// Streams one round: forwards content deltas to `send` as they arrive,
// reassembles tool_call deltas (they arrive fragmented, keyed by index), and
// returns the accumulated { content, toolCalls, annotations, finishReason }.
// finishReason matters: "length" means the model was cut off mid-answer by
// maxTokens, not that it actually finished — treating that the same as a
// clean "stop" is how truncated answers silently slipped through before.
const streamOneRound = async ({ messages, tools, maxTokens, temperature, reasoningEffort }, send) => {
  const stream = await openrouter.chatStreamRaw({ messages, tools, maxTokens, temperature, reasoningEffort });

  let content = "";
  const toolCallsAcc = [];
  const annotations = [];
  let finishReason = null;

  await consumeSSE(stream, (chunk) => {
    const choice = chunk.choices?.[0];
    if (choice?.finish_reason) finishReason = choice.finish_reason;

    const delta = choice?.delta;
    if (!delta) return;

    if (delta.content) {
      content += delta.content;
      send({ type: "token", content: delta.content });
    }

    if (delta.annotations) annotations.push(...delta.annotations);

    if (delta.tool_calls) {
      for (const tc of delta.tool_calls) {
        const idx = tc.index ?? 0;
        if (!toolCallsAcc[idx]) {
          toolCallsAcc[idx] = { id: "", type: "function", function: { name: "", arguments: "" } };
        }
        if (tc.id) toolCallsAcc[idx].id = tc.id;
        if (tc.function?.name) toolCallsAcc[idx].function.name += tc.function.name;
        if (tc.function?.arguments) toolCallsAcc[idx].function.arguments += tc.function.arguments;
      }
    }
  });

  return { content, toolCalls: toolCallsAcc.filter(Boolean), annotations, finishReason };
};

const runAgentChatStream = async (
  { messages, webSearch = true, maxTokens = 4096, temperature = 0.7, reasoningEffort = "low" },
  res
) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  const tools = buildTools({ webSearch });
  const workingMessages = [...messages];
  const collected = { services: [], downloadSources: [], sources: [] };

  try {
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const { content, toolCalls, annotations, finishReason } = await streamOneRound(
        { messages: workingMessages, tools, maxTokens, temperature, reasoningEffort },
        send
      );

      if (toolCalls.length === 0) {
        // Final answer — already streamed live above.
        const webSources = annotations
          .filter((a) => a.type === "url_citation")
          .map((a) => ({ title: a.url_citation?.title, url: a.url_citation?.url }));

        if (finishReason === "length") {
          console.warn(
            `[agent-chat/stream] answer truncated by maxTokens=${maxTokens} (finish_reason: length)`
          );
        }

        send({
          type: "done",
          downloadSources: collected.downloadSources,
          services: collected.services,
          sources: collected.sources,
          webSources,
          truncated: finishReason === "length",
        });
        return res.end();
      }

      workingMessages.push({ role: "assistant", content: content || null, tool_calls: toolCalls });
      workingMessages.push(...(await runToolRound(toolCalls, collected)));
    }

    // Iteration cap hit — force a final streamed answer with no tools.
    const { finishReason } = await streamOneRound(
      { messages: workingMessages, tools: [], maxTokens, temperature, reasoningEffort },
      send
    );
    if (finishReason === "length") {
      console.warn(
        `[agent-chat/stream] final answer truncated by maxTokens=${maxTokens} (finish_reason: length)`
      );
    }
    send({
      type: "done",
      downloadSources: collected.downloadSources,
      services: collected.services,
      sources: collected.sources,
      webSources: [],
      truncated: finishReason === "length",
    });
    res.end();
  } catch (error) {
    send({ type: "error", message: error.message });
    res.end();
  }
};

module.exports = { runAgentChat, runAgentChatStream };
