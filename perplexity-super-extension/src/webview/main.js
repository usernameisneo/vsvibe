(function () {
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const intentOverlay = document.getElementById('intent-overlay');

    // --- Controls ---
    const fontSizeSelect = document.getElementById('font-size-select');
    const themeSelect = document.getElementById('theme-select');
    const toneSelect = document.getElementById('tone-select');

    // --- State ---
    let currentSettings = {
        tone: 'friendly',
        show_intent: true
    };

    function applyInitialSettings() {
        if (typeof initialConfig !== 'undefined') {
            fontSizeSelect.value = initialConfig.font_size || '14px';
            themeSelect.value = initialConfig.theme || 'dark';
            toneSelect.value = initialConfig.tone || 'friendly';
            currentSettings.show_intent = initialConfig.show_intent !== false;

            updateFontSize();
            updateTheme();
            updateTone();
        }
    }

    function updateFontSize() {
        document.body.style.fontSize = fontSizeSelect.value;
    }

    function updateTheme() {
        document.body.className = `theme-${themeSelect.value}`;
    }

    function updateTone() {
        currentSettings.tone = toneSelect.value;
    }

    function addMessage(sender, text) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        messageElement.textContent = text;
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function showIntent(intent) {
        if (intent && currentSettings.show_intent) {
            intentOverlay.textContent = `${intent.line1}\n${intent.line2}\n${intent.line3}`;
            intentOverlay.classList.remove('hidden');
        } else {
            intentOverlay.classList.add('hidden');
        }
    }

    async function handleSendMessage(messageOverride) {
        const message = messageOverride || chatInput.value.trim();
        if (!message) return;

        // Only add user message to UI if it's not an internal, chained message
        if (!messageOverride) {
            addMessage('user', message);
            chatInput.value = '';
            chatInput.style.height = 'auto';
        }

        // Simple check to see if user is asking for a file
        const fileMatch = message.match(/summarize(?: my)? ([\w\.\/]+)/i);

        try {
            let completionMessage = message;

            if (fileMatch && !messageOverride) {
                const filePath = fileMatch[1];
                // Step 1: Fetch the file content from the server
                const fileRes = await fetch('http://localhost:8080/mcp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'file_fetch', payload: { path: filePath } })
                });

                if (!fileRes.ok) {
                    const err = await fileRes.json();
                    throw new Error(err.error || 'File fetch failed');
                }

                const fileResult = await fileRes.json();
                // Prepare a new message for the completion request, including the file content
                completionMessage = `Summarize the following content from the file '${filePath}':\n\n${fileResult.data}`;
            }

            // Step 2: Send the (potentially modified) message for chat completion
            const chatPayload = {
                message: completionMessage,
                ...currentSettings
            };

            const chatRes = await fetch('http://localhost:8080/mcp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'chat_completion', payload: chatPayload })
            });

            if (!chatRes.ok) {
                const err = await chatRes.json();
                throw new Error(err.error || 'API request failed');
            }

            const chatResult = await chatRes.json();
            addMessage('bot', chatResult.response);
            showIntent(chatResult.intent);

        } catch (error) {
            addMessage('bot', `Error: ${error.message}`);
        }
    }

    // --- Event Listeners ---
    sendButton.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight) + 'px';
    });

    fontSizeSelect.addEventListener('change', updateFontSize);
    themeSelect.addEventListener('change', updateTheme);
    toneSelect.addEventListener('change', updateTone);

    // --- Initialization ---
    applyInitialSettings();

}());