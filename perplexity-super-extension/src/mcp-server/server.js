const express = require('express');
const { promises: fs } = require('fs');
const path = require('path');

const app = express();
const port = 8080;
const workspaceRoot = process.argv[2]; // Get workspace root from command line args

if (!workspaceRoot) {
    console.error("Error: Workspace root not provided. Exiting.");
    process.exit(1);
}

app.use(express.json());

// Add CORS middleware to allow requests from the webview origin
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.post('/mcp', async (req, res) => {
    const { type, payload } = req.body;
    console.log(`MCP Server: Received request of type '${type}'`);

    if (type === 'file_fetch') {
        try {
            const filePath = path.join(workspaceRoot, payload.path);
            // Security check: ensure path is within the workspace root
            if (!path.resolve(filePath).startsWith(path.resolve(workspaceRoot))) {
                return res.status(403).json({ error: 'File access is forbidden outside the workspace.' });
            }
            const data = await fs.readFile(filePath, 'utf8');
            res.json({ data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: `Failed to read file: ${error.message}` });
        }
    } else if (type === 'chat_completion') {
        const { tone, message, show_intent } = payload;

        //
        // TODO: This is where you would integrate the real Perplexity API.
        //
        const simulatedApiResponse = `this is a simulated response to: "${message}"`;

        // Customize the response based on MCP settings
        const response = `(Tone: ${tone}) ${simulatedApiResponse}`;

        let intent = null;
        if (show_intent) {
            intent = {
                line1: '1. Currently: Answering user query.',
                line2: '2. Waiting: For user input for the next step.',
                line3: '3. Next: Synthesize and cite sources if requested.'
            };
        }

        // Simulate a streaming response for better UX
        setTimeout(() => {
            res.json({ response, intent });
        }, 500);

    } else {
        res.status(400).json({ error: `Unknown request type: ${type}` });
    }
});

app.listen(port, () => {
    console.log(`MCP Server listening on http://localhost:${port}`);
    // Notify parent process (extension.js) that the server has started
    if (process.send) {
        process.send({ status: 'started' });
    }
});