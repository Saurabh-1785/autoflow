const axios = require('axios');
(async () => {
  try {
    console.log("Testing Analyst Agent...");
    const res = await axios.post('http://localhost:3002/api/agents/analyst', {
      feedback: ["User needs a pause button", "Graph view is too fast"]
    });
    console.log("Response:", JSON.stringify(res.data, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
    process.exit(1);
  }
})();
