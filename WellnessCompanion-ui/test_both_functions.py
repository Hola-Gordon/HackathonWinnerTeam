import requests
import json

def test_both_functions():
    """Test both advisor and recipient functionalities of the Flask server"""
    base_url = "http://localhost:5000"
    
    print("=== Testing Advisor Perspective Functionality ===")
    
    advisors = ["therapist", "friend", "mentor", "parent"]
    emotions = ["happy", "sad", "angry", "anxious"]
    content = "I just got a promotion at work after working really hard for months!"
    
    for advisor in advisors:
        for emotion in emotions[:1]:  # Just test with "happy" for brevity
            print(f"\nTesting {advisor} with {emotion} emotion:")
            
            data = {
                "content": content,
                "emotion": emotion,
                "advisorPerspective": advisor,
                "intensity": 4
            }
            
            try:
                response = requests.post(
                    f"{base_url}/api/respond",
                    json=data,
                    headers={"Content-Type": "application/json"}
                )
                
                print(f"Status code: {response.status_code}")
                if response.status_code == 200:
                    result = response.json()
                    print(f"Response: {result['response']}")
                else:
                    print(f"Error: {response.text}")
            except Exception as e:
                print(f"Error with {advisor} test: {str(e)}")
    
    print("\n=== Testing Recipient Sharing Functionality ===")
    
    recipients = ["self", "friend", "partner", "family"]
    
    for recipient in recipients:
        print(f"\nTesting sharing with {recipient}:")
        
        data = {
            "content": content,
            "emotion": "happy",
            "recipient": recipient,
            "intensity": 4
        }
        
        try:
            response = requests.post(
                f"{base_url}/api/respond",
                json=data,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"Status code: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"Response: {result['response']}")
            else:
                print(f"Error: {response.text}")
        except Exception as e:
            print(f"Error with {recipient} test: {str(e)}")
    
    print("\n=== Testing Combined Functionality ===")
    
    data = {
        "content": content,
        "emotion": "happy",
        "advisorPerspective": "therapist",
        "recipient": "friend",
        "intensity": 4
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/respond",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Response: {result['response']}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error with combined test: {str(e)}")

if __name__ == "__main__":
    test_both_functions() 