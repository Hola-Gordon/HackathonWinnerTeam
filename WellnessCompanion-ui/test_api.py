import requests
import json

def test_api():
    """Test the Flask-Ollama API connection"""
    base_url = "http://localhost:5000"

    print("Testing API connectivity...")
    
    # Test 1: Check if the server is running
    try:
        response = requests.get(f"{base_url}/test")
        print(f"Test endpoint response: {response.status_code}")
        print(response.json())
    except Exception as e:
        print(f"Error connecting to test endpoint: {str(e)}")

    # Test 2: Check available models
    try:
        response = requests.get(f"{base_url}/api/models")
        print(f"Models endpoint response: {response.status_code}")
        if response.status_code == 200:
            print(f"Available models: {response.json()}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error connecting to models endpoint: {str(e)}")

    # Test 3: Simple LLM query
    try:
        data = {
            "message": "Tell me a short joke",
            "system_prompt": "You are a helpful assistant that tells short, family-friendly jokes.",
            "model": "deepseek-r1:1.5b",
            "temperature": 0.7
        }
        
        print(f"Sending request to {base_url}/api/chat with data: {data}")
        
        response = requests.post(
            f"{base_url}/api/chat", 
            json=data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Chat endpoint response: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"AI response: {result['response']}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error connecting to chat endpoint: {str(e)}")

    # Test 4: LLM query with advisor perspective (therapist)
    try:
        data = {
            "message": "The person has written this journal entry about feeling anxious: \"I'm feeling somewhat overwhelmed with work lately, but I'm managing.\"\nThey're feeling anxious with intensity level 3 (on a scale of 1-5).\nRespond to them as a therapist, offering support, insight, and guidance appropriate to your role.\nKeep your response to 3-5 sentences.\nRemember to start your response with the specific greeting that identifies you as a therapist.",
            "system_prompt": "You are a warm, empathetic therapist providing support to someone who has shared their feelings.\nYou focus on validation, reflection, and gentle exploration of emotions without judgment.\nUse therapeutic language and techniques, asking open questions that promote self-discovery.\nMaintain professional boundaries while being compassionate.\nWrite in first person as if speaking directly to the person.\nSTART YOUR RESPONSE WITH \"As your therapist, I want to acknowledge...\" to clearly demonstrate you're responding from a therapist perspective.",
            "model": "deepseek-r1:1.5b",
            "temperature": 0.7
        }
        
        print(f"\nTesting therapist perspective...")
        
        response = requests.post(
            f"{base_url}/api/chat", 
            json=data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Therapist response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Therapist response: {result['response']}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error with therapist test: {str(e)}")
        
    # Test 5: LLM query with friend perspective
    try:
        data = {
            "message": "The person has written this journal entry about feeling happy: \"I just got a promotion at work and I'm feeling really excited about it!\"\nThey're feeling happy with intensity level 4 (on a scale of 1-5).\nRespond to them as a friend, offering support, insight, and guidance appropriate to your role.\nKeep your response to 3-5 sentences.\nRemember to start your response with the specific greeting that identifies you as a friend.",
            "system_prompt": "You are a supportive, caring friend responding to someone who has shared their feelings.\nYour tone is casual, warm, and authentic. Use conversational language, maybe even a bit of humor when appropriate.\nShow that you relate to their experiences and validate their emotions.\nOffer encouragement and practical support as a good friend would.\nWrite in first person as if speaking directly to your friend.\nSTART YOUR RESPONSE WITH \"Hey there, as your friend, I just want to say...\" to clearly demonstrate you're responding from a friend perspective.",
            "model": "deepseek-r1:1.5b",
            "temperature": 0.7
        }
        
        print(f"\nTesting friend perspective...")
        
        response = requests.post(
            f"{base_url}/api/chat", 
            json=data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Friend response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Friend response: {result['response']}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error with friend test: {str(e)}")
        
    # Test 6: LLM query with sharing format
    try:
        data = {
            "message": "I've written this journal entry: \"I'm feeling stressed about a deadline at work, but I'm making progress.\"\nI'm feeling anxious with intensity level 3 (on a scale of 1-5).\nPlease reformat this for sharing with my partner. \nDon't add any analysis or advice - just paraphrase my content in a way that would be appropriate to share with this person.\nMake sure to start with a greeting that makes it clear this is for my partner.",
            "system_prompt": "You are an AI assistant that helps reformat journal entries for sharing with specific recipients.\nYour task is to paraphrase the content in a way that's appropriate for sharing with the specified recipient.\nDo not analyze or provide advice - just reformat the content for sharing.\nMaintain the original meaning and emotion, but adjust the tone and language to be suitable for the recipient.\nWrite in first person from the perspective of the journal writer.\nSTART YOUR RESPONSE WITH a clear greeting to the recipient, like \"Dear [recipient],\" to make it obvious who the message is for.",
            "model": "deepseek-r1:1.5b",
            "temperature": 0.7
        }
        
        print(f"\nTesting sharing format...")
        
        response = requests.post(
            f"{base_url}/api/chat", 
            json=data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Sharing format response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Sharing format response: {result['response']}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error with sharing format test: {str(e)}")

if __name__ == "__main__":
    test_api() 