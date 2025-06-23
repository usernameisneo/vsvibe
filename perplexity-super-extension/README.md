# Perplexity Super-Extension for VS Code

This VS Code extension provides an enhanced chat experience with Perplexity, powered by a local Multi-agent-like Control Protocol (MCP) server.

## Features

- **Customizable UI**: Control chat font size, theme (dark/light), and the AI's conversational tone.
- **Local File Access**: Allow the AI to read and reference files from your local workspace.
- **Bot Transparency**: Always-on display of the bot's current status and plan.
- **MCP-based Architecture**: A modular design that separates the UI (VS Code Webview) from the logic (local MCP server), inspired by multi-agent orchestration principles.

## How to Run

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run the Extension**:
    - Open this folder in VS Code.
    - Press `F5` to open a new Extension Development Host window.

3.  **Configure the Extension**:
    - In the **new** VS Code window (the one that opened after pressing F5), open a project or folder.
    - Create a configuration file at `.vscode/mcp.json` in your project's root. A sample is provided in this extension's source.

4.  **Start the Chat**:
    - Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
    - Run the command: `Perplexity: Start Super Chat`.

## How It Works

- The extension starts a local Node.js/Express server on `http://localhost:8080` to act as the MCP endpoint.
- The chat panel is a VS Code Webview that communicates directly with this local server.
- The server processes requests, applies customizations (like tone), and can fetch local files (e.g., when you ask "summarize README.md").
- All UI and agent behavior is configured via the `.vscode/mcp.json` file in your target workspace.

---

*This starter is designed to be extended. You can integrate a real Perplexity API client inside `src/mcp-server/server.js`.*