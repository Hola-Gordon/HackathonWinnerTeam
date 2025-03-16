import requests
import sys

def test_agent(port):
    """Test if the AI agent is running on the specified port"""
    url = f"http://localhost:{port}/api/chat"
    
    try:
        response = requests.post(
            url,
            json={
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": "Hello, are you there?"}
                ],
                "model": "qwen2-1.8b-instruct-q4_k_m.gguf"
            },
            timeout=5
        )
        
        if response.status_code == 200:
            print(f"✅ AI agent is running on port {port}")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"❌ AI agent returned status code {response.status_code} on port {port}")
            return False
    except Exception as e:
        print(f"❌ Error connecting to AI agent on port {port}: {e}")
        return False

if __name__ == "__main__":
    # Test common ports
    ports = [5000, 5001, 8000, 8080, 3000]
    
    # If a port is specified as a command-line argument, test only that port
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
            ports = [port]
        except ValueError:
            print(f"Invalid port number: {sys.argv[1]}")
    
    found = False
    for port in ports:
        if test_agent(port):
            found = True
            break
    
    if not found:
        print("❌ AI agent not found on any of the tested ports.")
        print("Please specify the correct port in flask_server.py:")
        print('AI_AGENT_URL = "http://localhost:YOUR_PORT"') 