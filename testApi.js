const axios = require('axios');

const testApi = async () => {
  try {
    // Send the POST request
    const response = await axios.post('http://192.168.188.142:11434/api/generate', {
      model: "llama3.2",
      prompt: "What color is the sky at different times of the day? Respond using JSON",
      format: "json",
      stream: false
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Parse and format the response
    const generatedText = response.data.response;
    console.log("Raw Response:\n", response.data);

    // Parse the JSON-like response if possible
    try {
      const formattedResponse = JSON.parse(generatedText.trim());
      console.log("\nFormatted Response:\n", formattedResponse);
    } catch (parseError) {
      console.log("\nUnable to parse the response. Raw response:\n", generatedText);
    }
  } catch (error) {
    // Log errors
    if (error.response) {
      console.error("API Error Response:\n", error.response.data);
    } else {
      console.error("Error:\n", error.message);
    }
  }
};

// Execute the script
testApi();
