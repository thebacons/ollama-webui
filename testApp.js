const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;
const OLLAMA_API_URL = 'http://localhost:11434';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/list-models', async (req, res) => {
    try {
        const response = await axios.get(`${OLLAMA_API_URL}/api/tags`);
        if (response.data && response.data.models) {
            res.json(response.data.models);
        } else {
            res.status(404).json({ error: 'No models found.' });
        }
    } catch (error) {
        console.error('Error listing models:', error.message);
        res.status(500).json({ error: 'Failed to list models' });
    }
});

app.post('/load-model', async (req, res) => {
    const { model } = req.body;
    if (!model) {
        return res.status(400).json({ error: 'Model name is required' });
    }
    try {
        await axios.post(`${OLLAMA_API_URL}/api/generate`, {
            model,
            prompt: "Hello",
            stream: false
        });
        res.json({ message: `Model ${model} loaded successfully!` });
    } catch (error) {
        console.error('Error loading model:', error.message);
        res.status(500).json({ error: `Failed to load model: ${error.message}` });
    }
});

app.post('/pull-model', async (req, res) => {
    const { model } = req.body;
    if (!model) {
        return res.status(400).json({ error: 'Model name is required' });
    }

    try {
        const response = await axios.post(`${OLLAMA_API_URL}/api/pull`, {
            name: model
        });
        res.json({ message: `Model ${model} pulled successfully!`, data: response.data });
    } catch (error) {
        console.error('Error pulling model:', error.message);
        res.status(500).json({ error: `Failed to pull model: ${error.message}` });
    }
});

app.post('/chat', async (req, res) => {
    const { model, prompt } = req.body;
    if (!model || !prompt) {
        return res.status(400).json({ error: 'Model and prompt are required' });
    }

    try {
        const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
            model,
            prompt,
            stream: false
        });

        if (response.data && response.data.response) {
            res.json({ response: response.data.response });
        } else {
            res.status(400).json({ error: 'Invalid response from model' });
        }
    } catch (error) {
        console.error('Error generating response:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});