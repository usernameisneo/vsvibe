plan and structure for a shared document system for AI chatbot extensions in VSCode:

### Shared Document Structure
```json
{
  "shared_data": {
    "timestamp": "2025-06-23T17:10:45+02:00",
    "chatbots": [
      {
        "id": "chatbot1",
        "status": "active",
        "intention": "Processing task X",
        "current_action": "Fetching data",
        "next_step": "Analyze data",
        "question": null
      },
      {
        "id": "chatbot2",
        "status": "paused",
        "intention": "Waiting for input",
        "current_action": "Idling",
        "next_step": "Resume task",
        "question": "What is the next step?"
      }
    ],
    "global_commands": {
      "pause_all": false,
      "stop_all": false,
      "continue_all": false,
      "give_orders_to_all": null
    },
    "token_cost_control": {
      "max_tokens": 1000,
      "current_usage": 471,
      "remaining_budget": 529
    },
    "errors": [],
    "activity_log": [
      {
        "timestamp": "2025-06-23T17:10:45+02:00",
        "event": "Chatbot2 paused",
        "details": "User initiated pause"
      }
    ]
  }
}
```

### Implementation Steps

1. **Design the Shared Document Structure:**
   - Create a JSON schema for the shared document, including fields for chatbot statuses, global commands, token cost control, errors, and activity logs.

2. **Set Up File Watching in VSCode:**
   - Use VSCode's built-in file watching capabilities to monitor changes to the shared document.

3. **Create a Centralized JSON File:**
   - Place this file in a shared location accessible to all chatbot extensions.
   - Ensure it is regularly updated and fetched by each extension.

4. **Implement VSCode Extension for Centralized Communication:**
   - Develop a VSCode extension that manages access to the shared document.
   - Handle read/write operations and notify extensions of changes.

5. **Implement Shared Memory or State Management:**
   - Use in-memory data structures or state management libraries to keep the shared document in sync across all extensions.

6. **Implement a Lightweight Local Server:**
   - Set up a lightweight local server using Node.js or Python to manage real-time updates and push notifications to all connected chatbot extensions.

7. **Implement Periodic Fetch Mechanism:**
   - Each chatbot extension should periodically fetch the latest version of the shared document to stay updated.

This approach ensures that all chatbot extensions are kept informed and synchronized efficiently, leveraging the capabilities available in VSCode and modern web technologies.