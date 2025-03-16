# WellnessCompanion UI

A React Native frontend for the WellnessCompanion application.

## Connecting to the Flask Backend

This frontend is designed to connect to a Flask backend running on `http://localhost:5000`. The backend should provide the following API endpoints:

- `GET /api/models` - Returns a list of available AI models
- `POST /api/analyze` - Analyzes journal entries
- `POST /api/respond` - Generates AI responses based on journal entries

### Configuration

The API base URL can be configured in `src/config.ts`. By default, it's set to `http://localhost:5000`.

## Integrating Your Own AI Agent

The Flask server currently uses more sophisticated hardcoded responses, but you can easily integrate your own AI agent:

1. In `flask_server.py`, modify the `/api/chat` endpoint to call your AI agent:

```python
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    messages = data.get('messages', [])
    model = data.get('model', 'qwen2-1.8b-instruct-q4_k_m.gguf')
    
    # Extract the system message and user message
    system_message = next((msg['content'] for msg in messages if msg['role'] == 'system'), "")
    user_message = next((msg['content'] for msg in messages if msg['role'] == 'user'), "")
    
    # REPLACE THIS SECTION WITH YOUR AI AGENT INTEGRATION
    # For example:
    # response = your_ai_agent.generate_response(system_message, user_message)
    
    return jsonify({"response": response})
```

2. If you have a local LLM like llama.cpp, you can integrate it like this:

```python
import subprocess
import json

def call_local_llm(prompt, system_prompt):
    # Example using llama.cpp
    cmd = [
        "./llama", 
        "-m", "models/qwen2-1.8b-instruct-q4_k_m.gguf",
        "--system", system_prompt,
        "--prompt", prompt,
        "-n", "512",
        "--temp", "0.7"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout
```

3. If you're using an external API like OpenAI:

```python
import openai

openai.api_key = "your-api-key"

def call_openai(prompt, system_prompt):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content
```

## Running the Application

1. Make sure your Flask backend is running on `http://localhost:5000`
2. Install dependencies: `npm install`
3. Start the application: `npm start`
4. Open the application in your browser or on a mobile device

## Troubleshooting

If you're experiencing connection issues:

1. Verify that your Flask backend is running
2. Check that the API endpoints match those expected by the frontend
3. Ensure CORS is properly configured on your Flask backend
4. Check the browser console for any error messages 