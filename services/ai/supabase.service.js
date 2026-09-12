// Minimal Supabase REST client — just enough to call RPCs and build public
// storage URLs. No @supabase/supabase-js dependency needed for this; it's a
// couple of plain HTTP calls using the same anon/publishable key the frontends
// already use for these same public, read-only RPCs.
const axios = require("axios");

function assertConfigured() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    throw new Error("SUPABASE_URL / SUPABASE_KEY are not configured on the server");
  }
}

const rpc = async (fn, params) => {
  assertConfigured();
  const { data } = await axios.post(
    `${process.env.SUPABASE_URL}/rest/v1/rpc/${fn}`,
    params,
    {
      headers: {
        apikey: process.env.SUPABASE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return data || [];
};

const publicStorageUrl = (bucket, path) => {
  assertConfigured();
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
};

module.exports = { rpc, publicStorageUrl };
