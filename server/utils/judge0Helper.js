const axios = require("axios");

<<<<<<< HEAD
const JUDGE0_URL = process.env.JUDGE0_API_URL;
=======
const JUDGE0_URL = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true";
>>>>>>> 5bad622a079fc76e00cedda47cad6231a962452e

const headers = {
  "Content-Type": "application/json",
  "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
<<<<<<< HEAD
  "X-RapidAPI-Host": process.env.JUDGE0_API_HOST
=======
  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
>>>>>>> 5bad622a079fc76e00cedda47cad6231a962452e
};

async function runJudge0(code, languageId, expectedOutput = "", stdin = "") {
  const payload = {
    source_code: code,
    language_id: languageId,
<<<<<<< HEAD
    stdin: stdin,
    expected_output: expectedOutput,
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
=======
    expected_output: expectedOutput,
    stdin: stdin,
    memory_limit: 128000,
    time_limit: 5
  };

  const response = await axios.post(JUDGE0_URL, payload, { headers });
  return response.data;
}
>>>>>>> 5bad622a079fc76e00cedda47cad6231a962452e
