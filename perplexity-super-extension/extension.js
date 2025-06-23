const vscode = require('vscode');
const path = require('path');
const { fork } = require('child_process');
const { promises: fs } = require('fs');

let mcpServerProcess;
let webviewPanel;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Perplexity Super-Extension is now active!');

    let disposable = vscode.commands.registerCommand('perplexity-super-extension.startChat', async () => {
        // Start the MCP server if it's not already running
        if (!mcpServerProcess || mcpServerProcess.killed) {
            const serverPath = context.asAbsolutePath(path.join('src', 'mcp-server', 'server.js'));
            const workspaceRoot = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

            if (!workspaceRoot) {
                vscode.window.showErrorMessage("Please open a folder or workspace to use Perplexity Super-Extension.");
                return;
            }

            mcpServerProcess = fork(serverPath, [workspaceRoot]); // Pass workspace root as an argument

            mcpServerProcess.on('message', (msg) => {
                if (msg.status === 'started') {
                    vscode.window.showInformationMessage('Perplexity MCP Server Started on port 8080.');
                    createWebviewPanel(context);
                }
            });
            mcpServerProcess.on('error', (err) => {
                vscode.window.showErrorMessage(`MCP Server Error: ${err.message}`);
            });
            mcpServerProcess.on('exit', (code) => {
                console.log(`MCP Server exited with code ${code}`);
            });
        } else {
            // Server is running, just reveal the webview
            if (webviewPanel) {
                webviewPanel.reveal(vscode.ViewColumn.One);
            } else {
                createWebviewPanel(context);
            }
        }
    });

    context.subscriptions.push(disposable);

    // Ensure the server is killed when VS Code is closed
    context.subscriptions.push({
        dispose: () => {
            if (mcpServerProcess) {
                mcpServerProcess.kill();
            }
        }
    });
}

async function createWebviewPanel(context) {
    const config = await getMcpConfig();

    webviewPanel = vscode.window.createWebviewPanel(
        'perplexityChat',
        'Perplexity Super Chat',
        vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'src', 'webview')]
        }
    );

    webviewPanel.webview.html = await getWebviewContent(webviewPanel.webview, context.extensionUri, config);

    webviewPanel.onDidDispose(() => {
        webviewPanel = undefined;
    });
}

async function getMcpConfig() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) return null;

    const configPath = vscode.Uri.joinPath(workspaceFolders[0].uri, '.vscode', 'mcp.json');
    try {
        const rawConfig = await fs.readFile(configPath.fsPath, 'utf-8');
        const parsed = JSON.parse(rawConfig);
        return parsed.agents[0].ui;
    } catch (error) {
        vscode.window.showWarningMessage('Could not find or parse .vscode/mcp.json. Using default settings.');
        return { font_size: '14px', theme: 'dark', tone: 'friendly', show_intent: true };
    }
}

async function getWebviewContent(webview, extensionUri, config) {
    const webviewBaseUri = vscode.Uri.joinPath(extensionUri, 'src', 'webview');
    const htmlPath = vscode.Uri.joinPath(webviewBaseUri, 'index.html');
    const nonce = getNonce();

    let html = await fs.readFile(htmlPath.fsPath, 'utf-8');

    // Replace placeholders
    html = html.replace(/\${nonce}/g, nonce);
    html = html.replace('${webview.cspSource}', webview.cspSource);
    html = html.replace('${styleUri}', webview.asWebviewUri(vscode.Uri.joinPath(webviewBaseUri, 'style.css')));
    html = html.replace('${scriptUri}', webview.asWebviewUri(vscode.Uri.joinPath(webviewBaseUri, 'main.js')));
    html = html.replace('<!-- initial-config -->', `<script nonce="${nonce}">const initialConfig = ${JSON.stringify(config || {})};</script>`);

    return html;
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function deactivate() {
    if (mcpServerProcess) {
        mcpServerProcess.kill();
    }
}

module.exports = {
    activate,
    deactivate
};