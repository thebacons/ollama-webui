const express = require('express');
const axios = require('axios');
const path = require('path');
const { marked } = require('marked');

const app = express();
const PORT = 3000;

// Serve static files (e.g., index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON requests
app.use(express.json());

// Function to format API responses into Markdown
function formatResponseToMarkdown(responseData) {
  if (typeof responseData === 'string') {
    // If response is plain text, return it as is
    return responseData;
  }

  // Format JSON-like responses into Markdown
  let markdown = `### Response\n\n`;
  for (const [key, value] of Object.entries(responseData)) {
    if (typeof value === 'string') {
      markdown += `- **${key}:** ${value}\n`;
    } else if (Array.isArray(value)) {
      markdown += `- **${key}:**\n`;
      for (const item of value) {
        markdown += `  - ${item}\n`;
      }
    } else if (typeof value === 'object') {
      markdown += `- **${key}:**\n`;
      for (const [subKey, subValue] of Object.entries(value)) {
        markdown += `  - **${subKey}:** ${subValue}\n`;
      }
    }
  }

  return markdown;
}

// Endpoint to handle chatbot queries
app.post('/chat', async (req, res) => {
  const { prompt } = req.body;

  try {
    // Send request to Ollama API
    const response = await axios.post('http://192.168.188.142:11434/api/generate', {
      model: "vanilj/Phi-4:Q8_0",
      prompt: prompt,
      format: "json",
      stream: false
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Extract and format the response
    const ollamaResponse = response.data.response;

    let formattedResponse;
    try {
      // Attempt to parse JSON if possible
      const parsedResponse = JSON.parse(ollamaResponse.trim());
      formattedResponse = formatResponseToMarkdown(parsedResponse);
    } catch (error) {
      // Fallback to raw text if parsing fails
      formattedResponse = ollamaResponse;
    }

    // Render Markdown into HTML
    const markdownResponse = marked(formattedResponse);

    res.json({ response: markdownResponse });
  } catch (error) {
    console.error('Error communicating with Ollama API:', error.message);
    res.status(500).json({ error: 'Failed to fetch response from the API' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
