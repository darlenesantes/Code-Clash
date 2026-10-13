const axios = require("axios");

function base64Encode(value) {
  return Buffer.from(value || "", "utf8").toString("base64");
}

function base64Decode(value) {
  return value ? Buffer.from(value, "base64").toString("utf8") : "";
}

function getJudge0ConfigStatus() {
  const missing = [];
  if (!process.env.JUDGE0_API_URL) missing.push("JUDGE0_API_URL");

  const hasKey = Boolean(process.env.JUDGE0_API_KEY);
  const hasHost = Boolean(process.env.JUDGE0_API_HOST);
  if (hasKey !== hasHost) {
    missing.push(hasKey ? "JUDGE0_API_HOST" : "JUDGE0_API_KEY");
  }

  if (process.env.JUDGE0_API_URL) {
    try {
      new URL(process.env.JUDGE0_API_URL);
    } catch {
      missing.push("JUDGE0_API_URL (valid URL)");
    }
  }

  return { configured: missing.length === 0, missing };
}

function judgeUrl() {
  const config = getJudge0ConfigStatus();
  if (!config.configured) {
    throw new Error(`Judge0 is not configured. Missing: ${config.missing.join(", ")}`);
  }

  const url = new URL(process.env.JUDGE0_API_URL);
  url.searchParams.set("base64_encoded", "true");
  url.searchParams.set("wait", "true");
  return url.toString();
}

async function runJudge0(code, languageId, stdin = "") {
  const headers = { "Content-Type": "application/json" };
  if (process.env.JUDGE0_API_KEY) headers["X-RapidAPI-Key"] = process.env.JUDGE0_API_KEY;
  if (process.env.JUDGE0_API_HOST) headers["X-RapidAPI-Host"] = process.env.JUDGE0_API_HOST;

  const payload = {
    source_code: base64Encode(code),
    language_id: languageId,
    stdin: base64Encode(stdin),
    cpu_time_limit: 5,
    memory_limit: 128000
  };

  try {
    const response = await axios.post(judgeUrl(), payload, { headers, timeout: 15000 });
    const data = response.data || {};
    return {
      ...data,
      stdout: base64Decode(data.stdout),
      stderr: base64Decode(data.stderr),
      compile_output: base64Decode(data.compile_output),
      message: base64Decode(data.message)
    };
  } catch (error) {
    const detail = error.response?.data?.message || error.response?.data?.error || error.message;
    throw new Error(`Judge0 request failed: ${detail}`);
  }
}

module.exports = { getJudge0ConfigStatus, runJudge0 };
