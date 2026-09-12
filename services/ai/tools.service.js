// Tools available to the chatbot agent loop. The model decides for itself
// when it needs to search services or the knowledge base — this replaces the
// old client-side heuristics (always-run retrieval on every message, a
// personnel-keyword skip list, a confidence-score fallback) with the model
// making that call directly, informed by the system prompt.
const openrouter = require("./openrouter.service");
const supabase = require("./supabase.service");

const FUNCTION_TOOLS = [
  {
    type: "function",
    function: {
      name: "search_lagos_services",
      description:
        "Search the Lagos State government services catalog for services relevant to the user's question " +
        "(e.g. tax payment, business registration, healthcare, transportation permits, land use). " +
        "Returns matching services with short descriptions and links. Use this when the user is asking how " +
        "to access, apply for, or use a specific citizen service.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "A focused search phrase describing what the user needs help with.",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_knowledge_base",
      description:
        "Search uploaded Lagos State knowledge base documents (policies, budgets, financial reports, " +
        "procedures) for content relevant to the user's question. Do NOT use this for questions about " +
        "current leadership, commissioners, the governor, or any government personnel — that information " +
        "is already provided in your system context and is more current than anything in these documents.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "A focused search phrase describing the information needed.",
          },
        },
        required: ["query"],
      },
    },
  },
];

const WEB_SEARCH_TOOL = { type: "openrouter:web_search" };

const buildTools = ({ webSearch = true } = {}) =>
  webSearch ? [...FUNCTION_TOOLS, WEB_SEARCH_TOOL] : FUNCTION_TOOLS;

const searchLagosServices = async (query) => {
  const [embedding] = await openrouter.embed({ input: query });
  const results = await supabase.rpc("match_lagos_services", {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: 4,
  });

  return {
    forModel: results.length
      ? results
          .map((d) => `- ${d.name}: ${d.short || "no description"} (${d.url || "no link"})`)
          .join("\n")
      : "No matching services found.",
    services: results.map((d) => ({ name: d.name, short: d.short, url: d.url })),
  };
};

const searchKnowledgeBase = async (query) => {
  const [embedding] = await openrouter.embed({ input: query });
  const chunks = await supabase.rpc("match_chunks", {
    query_embedding: embedding,
    match_threshold: 0.6,
    match_count: 6,
  });

  // Dedupe download sources by document name, keep the highest-similarity chunk's path
  const docMap = {};
  for (const chunk of chunks) {
    if (!docMap[chunk.document_name] || chunk.similarity > docMap[chunk.document_name].similarity) {
      docMap[chunk.document_name] = chunk;
    }
  }
  const downloadSources = Object.values(docMap)
    .filter((d) => d.file_path)
    .map((d) => ({ name: d.document_name, url: supabase.publicStorageUrl("pdfs", d.file_path) }));

  return {
    forModel: chunks.length
      ? chunks
          .map(
            (c) =>
              `Document "${c.document_name}" (${Math.round(c.similarity * 100)}% match):\n${c.content}`
          )
          .join("\n\n")
      : "No matching documents found.",
    downloadSources,
    sources: chunks.map((c) => ({
      document: c.document_name,
      similarity: Math.round(c.similarity * 100),
    })),
  };
};

const executeTool = async (name, args) => {
  try {
    switch (name) {
      case "search_lagos_services":
        return await searchLagosServices(args.query || "");
      case "search_knowledge_base":
        return await searchKnowledgeBase(args.query || "");
      default:
        return { forModel: `Unknown tool "${name}".` };
    }
  } catch (error) {
    return { forModel: `Tool "${name}" failed: ${error.message}` };
  }
};

module.exports = { buildTools, executeTool };
