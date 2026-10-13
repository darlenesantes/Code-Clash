const axios = require("axios");

function base64Encode(value) {
  return Buffer.from(value || "", "utf8").toString("base64");
}

function base64Decode(value) {
  return value ? Buffer.from(value, "base64").toString("utf8") : "";
}

function getJudge0ConfigStatus(env = process.env) {
  const missing = [];
  const apiUrl = (env.JUDGE0_API_URL || '').trim();
  const apiKey = (env.JUDGE0_API_KEY || '').trim();
  const apiHost = (env.JUDGE0_API_HOST || '').trim();
  if (!apiUrl) missing.push("JUDGE0_API_URL");

  const hasKey = Boolean(apiKey);
  const hasHost = Boolean(apiHost);
  if (hasKey !== hasHost) {
    missing.push(hasKey ? "JUDGE0_API_HOST" : "JUDGE0_API_KEY");
  }

  if (apiUrl) {
    try {
      const url = new URL(apiUrl);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
          !/\/submissions\/?$/.test(url.pathname) || url.hash ||
          /^your[-_]/i.test(url.hostname) ||
          (env.NODE_ENV === 'production' && url.protocol !== 'https:')) {
        missing.push('JUDGE0_API_URL (valid submissions endpoint)');
      }
      if (url.hostname.endsWith('.rapidapi.com')) {
        if (!hasKey) missing.push('JUDGE0_API_KEY');
        if (!hasHost) missing.push('JUDGE0_API_HOST');
        if (hasHost && apiHost !== url.hostname) missing.push('JUDGE0_API_HOST (must match endpoint host)');
      }
    } catch {
      missing.push("JUDGE0_API_URL (valid URL)");
    }
  }
  if (/^(your[-_]|replace[-_]|placeholder)/i.test(apiKey)) missing.push('JUDGE0_API_KEY (placeholder)');
  if (/^(your[-_]|replace[-_]|placeholder)/i.test(apiHost)) missing.push('JUDGE0_API_HOST (placeholder)');

  return { configured: missing.length === 0, missing: [...new Set(missing)] };
}

function judgeUrl() {
  const config = getJudge0ConfigStatus();
  if (!config.configured) {
    throw new Error(`Judge0 is not configured. Missing: ${config.missing.join(", ")}`);
  }

  const url = new URL(process.env.JUDGE0_API_URL.trim());
  url.searchParams.set("base64_encoded", "true");
  url.searchParams.set("wait", "true");
  return url.toString();
}

async function runJudge0(code, languageId, stdin = "") {
  const headers = { "Content-Type": "application/json" };
  if (process.env.JUDGE0_API_KEY) headers["X-RapidAPI-Key"] = process.env.JUDGE0_API_KEY.trim();
  if (process.env.JUDGE0_API_HOST) headers["X-RapidAPI-Host"] = process.env.JUDGE0_API_HOST.trim();

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
