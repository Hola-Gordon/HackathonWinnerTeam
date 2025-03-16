import ollama
import json

def test_ollama_directly():
    """Test Ollama API directly without Flask"""
    print("Testing Ollama API directly...")
    
    try:
        # List models
        models = ollama.list()
        print("Available models:", json.dumps([m['name'] for m in models['models']], indent=2))
        
        # Test therapist prompt
        system_prompt = """You are a warm, empathetic therapist providing support to someone who has shared their feelings.
You focus on validation, reflection, and gentle exploration of emotions without judgment.
Use therapeutic language and techniques, asking open questions that promote self-discovery.
Maintain professional boundaries while being compassionate.
Write in first person as if speaking directly to the person.
START YOUR RESPONSE WITH "As your therapist, I want to acknowledge..." to clearly demonstrate you're responding from a therapist perspective."""

        user_message = """I'm feeling somewhat overwhelmed with work lately, but I'm managing. 
I'm feeling anxious with intensity level 3 (on a scale of 1-5)."""

        print("\nTesting therapist perspective with prompt:", user_message)
        
        response = ollama.chat(
            model='deepseek-r1:1.5b',
            messages=[
                {
                    'role': 'system',
                    'content': system_prompt
                },
                {
                    'role': 'user',
                    'content': user_message
                }
            ],
            options={
                'temperature': 0.7
            }
        )
        
        print("Therapist response:", response['message']['content'])
        
        # Test friend prompt
        system_prompt = """You are a supportive, caring friend responding to someone who has shared their feelings.
Your tone is casual, warm, and authentic. Use conversational language, maybe even a bit of humor when appropriate.
Show that you relate to their experiences and validate their emotions.
Offer encouragement and practical support as a good friend would.
Write in first person as if speaking directly to your friend.
START YOUR RESPONSE WITH "Hey there, as your friend, I just want to say..." to clearly demonstrate you're responding from a friend perspective."""

        user_message = """I just got a promotion at work and I'm feeling really excited about it!
I'm feeling happy with intensity level 4 (on a scale of 1-5)."""

        print("\nTesting friend perspective with prompt:", user_message)
        
        response = ollama.chat(
            model='deepseek-r1:1.5b',
            messages=[
                {
                    'role': 'system',
                    'content': system_prompt
                },
                {
                    'role': 'user',
                    'content': user_message
                }
            ],
            options={
                'temperature': 0.7
            }
        )
        
        print("Friend response:", response['message']['content'])
        
    except Exception as e:
        print(f"Error testing Ollama directly: {str(e)}")

if __name__ == "__main__":
    test_ollama_directly() 