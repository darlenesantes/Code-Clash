const axios = require("axios");

const JUDGE0_URL = process.env.JUDGE0_API_URL;

const headers = {
  "Content-Type": "application/json",
  "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
  "X-RapidAPI-Host": process.env.JUDGE0_API_HOST
};

function base64Encode(str) {
  return Buffer.from(str).toString("base64");
}

async function runJudge0(code, languageId, expectedOutput = "", stdin = "") {
  const payload = {
    source_code: base64Encode(code),
    language_id: languageId,
    stdin: base64Encode(stdin),
    expected_output: base64Encode(expectedOutput),
    time_limit: 5,
    memory_limit: 128000
  };


  console.log("🌐 Judge0 URL:", JUDGE0_URL);
  console.log("🧾 Headers:", headers);    
  console.log("📦 Sending payload to Judge0:", JSON.stringify(payload, null, 2));

  try {
    const response = await axios.post(JUDGE0_URL, payload, { headers });
    return response.data;
  } catch (err) {
    console.error("❌ Judge0 API error:", err.response?.data || err.message);
    throw err;
  }
}


module.exports = { runJudge0 }; 