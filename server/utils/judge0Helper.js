const axios = require("axios");

const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true";

const headers = {
  "Content-Type": "application/json",
  "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
};

async function runJudge0(code, languageId, expectedOutput = "", stdin = "") {
  const payload = {
    source_code: code,
    language_id: languageId,
    expected_output: expectedOutput,
    stdin: stdin,
    memory_limit: 128000,
    time_limit: 5
  };

  const response = await axios.post(JUDGE0_URL, payload, { headers });
  return response.data;
}