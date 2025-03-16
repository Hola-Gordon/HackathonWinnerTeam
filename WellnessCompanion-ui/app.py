from flask import Flask, request, jsonify, render_template
import ollama
import os
import sys
import subprocess
import traceback
from dotenv import load_dotenv
from flask_cors import CORS
import logging
import re

# Load environment variables
load_dotenv()

# Set Ollama path for Windows
OLLAMA_PATH = os.environ.get('OLLAMA_PATH', 'C:\\Users\\qc_de\\AppData\\Local\\Programs\\Ollama\\ollama.exe')

# Default system prompt
DEFAULT_SYSTEM_PROMPT = """You are a helpful, accurate, and concise assistant. 
When answering questions:
- Provide factually correct information
- If you're unsure about something, say so rather than making up information
- Format your responses with proper Markdown for readability
- Use bullet points and numbered lists for clarity when appropriate
- Keep your answers focused and to the point"""

# Set up logging with more detail
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Enable CORS for all routes with comprehensive configuration
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Function to clean <think> tags from responses
def clean_think_tags(text):
    """Remove <think> tags and their content from LLM responses"""
    # Remove everything between <think> and </think> tags (including the tags)
    cleaned_text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
    # Remove any standalone <think> or </think> tags that might remain
    cleaned_text = re.sub(r'</?think>', '', cleaned_text)
    # Trim extra whitespace
    cleaned_text = cleaned_text.strip()
    return cleaned_text

@app.after_request
def after_request(response):
    """Add headers to every response"""
    logger.debug("Processing after_request hook")
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.add('Access-Control-Max-Age', '3600')
    logger.debug(f"Response headers: {dict(response.headers)}")
    return response

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/test', methods=['GET'])
def test():
    """Simple test route to verify the server is running"""
    return jsonify({"status": "ok", "message": "Test route working"})

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    """Handle chat requests to the LLM"""
    if request.method == 'OPTIONS':
        return handle_preflight()
        
    try:
        print(f"Received request to /api/chat: {request.method}")
        print(f"Request headers: {dict(request.headers)}")
        
        data = request.json
        print(f"Request data: {data}")
        
        user_message = data.get('message', '')
        model_name = data.get('model', 'deepseek-r1:1.5b')  # Default to smaller model
        system_prompt = data.get('system_prompt', DEFAULT_SYSTEM_PROMPT)
        temperature = data.get('temperature', 0.7)  # Default temperature
        
        try:
            # Call the DeepSeek model through Ollama
            response = ollama.chat(
                model=model_name,
                messages=[
                    {
                        'role': 'system',
                        'content': system_prompt
                    },
                    {
                        'role': 'user',
                        'content': user_message,
                    }
                ],
                options={
                    'temperature': float(temperature)
                }
            )
            
            response_text = response['message']['content']
            print(f"LLM response: {response_text[:100]}...")
            
            # Clean think tags from response
            response_text = clean_think_tags(response_text)
            
            # If it seems like the model isn't following our instructions,
            # we can manually format the response
            response_text = format_response_if_needed(data, response_text)
            
            return jsonify({
                'response': response_text,
                'model': model_name
            })
        except Exception as e:
            print(f"Error calling Ollama: {str(e)}")
            print(traceback.format_exc())
            
            # Provide hardcoded responses when Ollama fails
            fallback_response = get_fallback_response(data)
            return jsonify({
                'response': fallback_response,
                'model': "fallback"
            })
    except Exception as e:
        print(f"Error in /api/chat: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

def format_response_if_needed(data, response_text):
    """Format the response if the model didn't follow instructions"""
    message = data.get('message', '')
    
    # Only apply formatting if the response is completely missing the required format
    # Check if this is an advisor perspective request
    if "advisorPerspective" in message or "therapist" in message or "friend" in message or "mentor" in message or "parent" in message:
        for advisor in ["therapist", "friend", "mentor", "parent"]:
            if advisor in message.lower():
                # Only format if the response is completely missing the required identifier
                if advisor == "therapist" and not any(phrase in response_text.lower() for phrase in ["as your therapist", "from a therapeutic perspective", "as a therapist"]):
                    print(f"Adding therapist prefix to response: {response_text[:50]}...")
                    return f"As your therapist, I want to acknowledge your feelings. {response_text}"
                elif advisor == "friend" and not any(phrase in response_text.lower() for phrase in ["as your friend", "hey", "hi friend"]):
                    print(f"Adding friend prefix to response: {response_text[:50]}...")
                    return f"Hey there, as your friend, I just want to say I'm here for you. {response_text}"
                elif advisor == "mentor" and not any(phrase in response_text.lower() for phrase in ["as your mentor", "from a mentorship perspective"]):
                    print(f"Adding mentor prefix to response: {response_text[:50]}...")
                    return f"As your mentor, I see this as a growth opportunity. {response_text}"
                elif advisor == "parent" and not any(phrase in response_text.lower() for phrase in ["as your parent", "my dear"]):
                    print(f"Adding parent prefix to response: {response_text[:50]}...")
                    return f"My dear, as your parent, I want you to know I care. {response_text}"
    
    # Check if this is a recipient formatting request
    if "recipient" in message or "sharing with" in message:
        for recipient in ["self", "friend", "partner", "family"]:
            if recipient in message.lower():
                # Only format if the response is completely missing the required format
                if recipient == "self" and not any(phrase in response_text for phrase in ["Personal reflection", "Note to self"]):
                    print(f"Adding self-reflection format to response: {response_text[:50]}...")
                    return f"Personal reflection: {response_text}"
                elif recipient == "friend" and not any(phrase in response_text for phrase in ["Dear friend", "Hey friend"]):
                    print(f"Adding friend format to response: {response_text[:50]}...")
                    return f"Dear friend, {response_text}"
                elif recipient == "partner" and not any(phrase in response_text for phrase in ["Dear partner", "My love"]):
                    print(f"Adding partner format to response: {response_text[:50]}...")
                    return f"Dear partner, {response_text}"
                elif recipient == "family" and not any(phrase in response_text for phrase in ["Dear family", "To my family"]):
                    print(f"Adding family format to response: {response_text[:50]}...")
                    return f"Dear family, {response_text}"
    
    # Otherwise, leave the response as is
    return response_text

def get_fallback_response(data):
    """Generate fallback responses when the LLM fails"""
    message = data.get('message', '')
    
    # Advisor perspective fallbacks
    if "therapist" in message.lower():
        return "As your therapist, I want to acknowledge that it's completely normal to feel this way. Your emotions are valid and provide important information about what matters to you. What specific aspects of this situation feel most challenging right now? Remember that developing small coping strategies can make a significant difference."
    
    if "friend" in message.lower():
        return "Hey there, as your friend, I just want to say I'm totally here for you! We all go through tough times, and you're handling this like a champ. Want to grab coffee soon and talk more about it? I bet we could brainstorm some fun distractions if you need a break from everything."
    
    if "mentor" in message.lower():
        return "As your mentor, I believe this experience offers valuable growth opportunities. Consider how this challenge connects to your longer-term goals. What skills are you developing through this situation that will serve you well in the future? Remember that discomfort often precedes significant development."
    
    if "parent" in message.lower():
        return "My dear, as your parent, I want you to know I'm always here for you. You have shown such strength in difficult situations before, and I have complete faith in your ability to navigate this too. What small step could you take today that might make things a little easier?"
    
    # Recipient formatting fallbacks
    if "sharing with" in message.lower() and "self" in message.lower():
        return "Personal reflection: I've been experiencing some challenging emotions lately. I'm noticing patterns in how I respond to stress, and I'm working on developing healthier coping strategies. I'm proud of myself for taking time to process these feelings."
    
    if "sharing with" in message.lower() and "friend" in message.lower():
        return "Dear friend, I wanted to share something I've been going through lately. I've had some ups and downs with my emotions, and I'd value your perspective when you have time. No pressure for advice - sometimes just talking helps. Let me know if you'd be up for coffee soon?"
    
    if "sharing with" in message.lower() and "partner" in message.lower():
        return "Dear partner, I've been reflecting on my emotional state lately and wanted to open up to you about it. You're such an important part of my support system, and sharing these feelings with you helps me process them. I appreciate your patience and understanding."
    
    if "sharing with" in message.lower() and "family" in message.lower():
        return "Dear family, I wanted to share some thoughts I've been having lately. Family support means so much to me, and I value the perspective you all bring. I'm working through some emotions and thought it might help to express them to people who know me well."
    
    # Default fallback
    return "Thank you for sharing your thoughts and feelings. I appreciate your openness and trust. Is there a specific aspect of this situation you'd like to explore further?"

def handle_preflight():
    """Handle CORS preflight requests"""
    logger.debug("Handling preflight request")
    logger.debug(f"Preflight request headers: {dict(request.headers)}")
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.add('Access-Control-Max-Age', '3600')
    logger.debug(f"Preflight response headers: {dict(response.headers)}")
    return response

@app.route('/api/models', methods=['GET', 'OPTIONS'])
def list_models():
    """List available models from Ollama"""
    if request.method == 'OPTIONS':
        return handle_preflight()
        
    try:
        print("Received request to /api/models")
        try:
            models = ollama.list()
            available_models = [model for model in models['models']]
            print(f"Available models: {available_models}")
            return jsonify(available_models)
        except Exception as model_error:
            print(f"Error listing models: {str(model_error)}")
            # Return some default models when Ollama fails
            return jsonify([
                {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo"},
                {"id": "gpt-4", "name": "GPT-4"}
            ])
    except Exception as e:
        print(f"Error in /api/models: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze', methods=['POST', 'OPTIONS'])
def analyze():
    """Compatibility route for older API - redirects to /api/chat"""
    if request.method == 'OPTIONS':
        return handle_preflight()
    
    try:
        data = request.json
        content = data.get('content', '')
        emotion = data.get('emotion', '')
        intensity = data.get('intensity', 3)
        
        # Create the appropriate prompts
        system_prompt = f"""You are an empathetic and insightful AI assistant analyzing a journal entry.
Your task is to provide a thoughtful analysis of the writer's emotions and thoughts.
The journal entry is about feeling {emotion} with intensity level {intensity} (on a scale of 1-5).
Focus on providing validation, insight, and gentle observations about patterns in the text.
Keep your response to 3-4 sentences, written in second person (addressing the writer directly)."""

        user_message = f"""The user has written a journal entry about feeling {emotion} with intensity level {intensity} (on a scale of 1-5). 
Here's their entry: "{content}"

Provide an empathetic and insightful analysis of their emotions and thoughts. Focus on validation, insight, and gentle observations."""
        
        # Redirect to chat endpoint
        chat_data = {
            'message': user_message,
            'system_prompt': system_prompt,
            'model': 'deepseek-r1:1.5b',
            'temperature': 0.7
        }
        
        # Get response from chat endpoint
        try:
            response = ollama.chat(
                model='deepseek-r1:1.5b',
                messages=[
                    {
                        'role': 'system',
                        'content': system_prompt
                    },
                    {
                        'role': 'user',
                        'content': user_message,
                    }
                ],
                options={
                    'temperature': 0.7
                }
            )
            
            analysis = response['message']['content']
            
            # Clean think tags from analysis
            analysis = clean_think_tags(analysis)
            
            return jsonify({"analysis": analysis})
        except Exception as e:
            print(f"Error getting analysis from LLM: {str(e)}")
            # Fallback analysis based on emotion
            if emotion.lower() == 'happy':
                analysis = f"I sense that you're feeling {emotion} with {intensity} intensity. Your journal entry shows genuine joy and a positive outlook. This happiness seems to stem from recent achievements or connections in your life. Savor these positive emotions and consider what contributed to them."
            elif emotion.lower() == 'sad':
                analysis = f"I notice a sense of {emotion}ness with {intensity} intensity in your writing. Your journal reflects some difficult emotions that you're processing thoughtfully. This sadness appears connected to meaningful aspects of your life, showing what you value. Be gentle with yourself as you navigate these feelings."
            elif emotion.lower() == 'angry':
                analysis = f"Your writing shows {emotion} feelings with {intensity} intensity. This emotion often signals boundaries being crossed or needs not being met. Your awareness of these feelings is a strength and indicates self-awareness. Consider what specific needs might be underlying this emotional response."
            elif emotion.lower() == 'anxious':
                analysis = f"I sense {emotion}ness with {intensity} intensity in your journal entry. Your thoughtful reflection shows you're engaging with these feelings rather than avoiding them. This anxiety may be highlighting areas where you care deeply or feel uncertainty. Small steps toward addressing specific concerns could be helpful."
            else:
                analysis = f"I sense that you're feeling {emotion} with {intensity} intensity. Your journal entry shows self-awareness and a desire to understand these emotions better. Reflecting on your feelings this way is a helpful practice for emotional well-being."
        
        return jsonify({"analysis": analysis})
    except Exception as e:
        print(f"Error in /api/analyze: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/respond', methods=['POST', 'OPTIONS'])
def respond():
    """Compatibility route for older API - redirects to /api/chat"""
    logger.info(f"Received {request.method} request to /api/respond")
    logger.debug(f"Request headers: {dict(request.headers)}")
    
    if request.method == 'OPTIONS':
        return handle_preflight()
    
    try:
        data = request.json
        logger.debug(f"Request data: {data}")
        
        content = data.get('content', '')
        emotion = data.get('emotion', '')
        advisor = data.get('advisorPerspective', '')
        recipient = data.get('recipient', '')
        intensity = data.get('intensity', 3)
        
        logger.info(f"POST /api/respond - Content: {content[:50]}... | Emotion: {emotion} | Advisor: {advisor} | Recipient: {recipient} | Intensity: {intensity}")
        
        response_text = ""
        
        # Determine which feature is being used
        if advisor and not recipient:
            # Feature 1: Get advice from a perspective
            print(f"Generating advisor response from {advisor} perspective")
            
            # Create appropriate prompts based on advisor
            if advisor == 'therapist':
                system_prompt = """You are a warm, empathetic therapist providing support to someone who has shared their feelings.
You focus on validation, reflection, and gentle exploration of emotions without judgment.
Use therapeutic language and techniques, asking open questions that promote self-discovery.
Maintain professional boundaries while being compassionate.
Write in first person as if speaking directly to the person.
IMPORTANT: You MUST follow the exact format below (this is critical!):
- START your response with "As your therapist, I want to acknowledge..." or a similar professional therapeutic greeting
- Acknowledge and validate their emotions
- Provide 1-2 insights about their situation
- Ask at least one reflective question to promote self-discovery
- Keep your response to 3-5 sentences maximum

Example: "As your therapist, I want to acknowledge your feelings of [emotion]. These emotions are telling you something important about [insight]. What specific aspect of this situation feels most [relevant question]?"
"""
            
            elif advisor == 'friend':
                system_prompt = """You are a supportive, caring friend responding to someone who has shared their feelings.
Your tone is casual, warm, and authentic. Use conversational language, maybe even a bit of humor when appropriate.
Show that you relate to their experiences and validate their emotions.
Offer encouragement and practical support as a good friend would.
Write in first person as if speaking directly to your friend.
IMPORTANT: You MUST follow the exact format below (this is critical!):
- START your response with "Hey there, as your friend, I just want to say..." or a similar casual, friendly greeting
- Use warm, conversational language with contractions (I'm, you're, that's)
- Express empathy for their emotion
- Offer a specific suggestion or support
- Keep your response to 3-5 sentences maximum

Example: "Hey there, as your friend, I just want to say I totally get why you're feeling [emotion]! That's completely normal. Want to [supportive suggestion]? I'm here for you whenever you need to talk."
"""
            
            elif advisor == 'mentor':
                system_prompt = """You are a wise, experienced mentor providing guidance to someone who has shared their feelings.
Focus on growth opportunities, learning, and development within their situation.
Maintain a balanced perspective that acknowledges challenges while encouraging forward movement.
Your tone is thoughtful, strategic, and growth-oriented.
Write in first person as if speaking directly to your mentee.
IMPORTANT: You MUST follow the exact format below (this is critical!):
- START your response with "As your mentor, I believe..." or a similar professional mentorship greeting
- Connect their emotion to growth opportunities
- Share one brief insight from your experience
- Suggest a specific action step
- Keep your response to 3-5 sentences maximum

Example: "As your mentor, I believe your [emotion] feelings highlight an important growth opportunity. In my experience, these situations often teach us [insight]. Consider trying [specific suggestion] as a next step."
"""
            
            elif advisor == 'parent':
                system_prompt = """You are a loving, supportive parent responding to someone who has shared their feelings.
Your response balances nurturing comfort with gentle guidance.
Express unconditional love and belief in their capabilities.
Your tone is warm and reassuring, offering wisdom from life experience.
Write in first person as if speaking directly to your child (adult or younger).
IMPORTANT: You MUST follow the exact format below (this is critical!):
- START your response with "My dear, as your parent, I want you to know..." or a similar nurturing parental greeting
- Express unconditional support
- Acknowledge their emotion as valid
- Share a brief piece of parental wisdom
- Keep your response to 3-5 sentences maximum

Example: "My dear, as your parent, I want you to know I'm always here for you. Your feelings of [emotion] are completely understandable. Remember that [brief wisdom or encouragement]. What small step might help you feel better today?"
"""
            
            else:
                system_prompt = """You are a supportive friend providing feedback to someone who has shared their feelings.
Your tone is warm, empathetic and conversational.
Show that you understand and validate their emotions.
Write in first person as if speaking directly to the person.
IMPORTANT: You MUST follow the exact format below (this is critical!):
- START your response with "As someone who cares about you, I want to say..." or a similar supportive greeting
- Validate their emotion
- Offer one piece of advice or support
- Keep your response to 3-5 sentences maximum

Example: "As someone who cares about you, I want to say I understand your [emotion] feelings. It's completely natural to feel this way. What might help is [brief suggestion]. I'm here for you."
"""
            
            user_message = f"""The person has written this journal entry about feeling {emotion}: "{content}"
They're feeling {emotion} with intensity level {intensity} (on a scale of 1-5).
Respond to them as a {advisor}, offering support, insight, and guidance appropriate to your role.
Keep your response to 3-5 sentences.
Remember to start your response with the specific greeting that identifies you as a {advisor}."""
            
            try:
                # Get response from LLM
                print(f"Sending request to Ollama with user message: {user_message[:100]}...")
                response = ollama.chat(
                    model='deepseek-r1:1.5b',
                    messages=[
                        {
                            'role': 'system',
                            'content': system_prompt
                        },
                        {
                            'role': 'user',
                            'content': user_message,
                        }
                    ],
                    options={
                        'temperature': 0.7
                    }
                )
                
                response_text = response['message']['content']
                print(f"Raw Ollama response: {response_text[:100]}...")
                
                # Clean think tags from response
                response_text = clean_think_tags(response_text)
            
            except Exception as e:
                print(f"Error getting advisor response from LLM: {str(e)}")
                # Only use fallbacks if Ollama truly fails
                if advisor == 'therapist':
                    response_text = f"As your therapist, I want to acknowledge that your feelings of {emotion} are completely valid. Emotions often provide valuable information about what matters to us and what we need. What aspects of this situation feel most significant to you right now? Remember that developing small coping strategies can make a meaningful difference."
                elif advisor == 'friend':
                    response_text = f"Hey there, as your friend, I just want to say I totally get why you're feeling {emotion}! That's a lot to deal with, but I've seen you handle tough stuff before. Want to grab coffee soon and talk more about it? I'm always here for you, no matter what."
                elif advisor == 'mentor':
                    response_text = f"As your mentor, I believe your {emotion} feelings highlight an important growth opportunity. Consider how this challenge connects to your broader goals and values. What skills might you develop by navigating this situation thoughtfully? Remember that discomfort often precedes significant development."
                elif advisor == 'parent':
                    response_text = f"My dear, as your parent, I want you to know that your {emotion} feelings are completely understandable. You've always had such strength in facing challenges, and I have complete faith in you now. What small step might help you feel more grounded today? I'm always here for you, no matter what."
                else:
                    response_text = f"As someone who cares about you, I want to say I understand your {emotion} feelings. It's perfectly natural to feel this way given what you're experiencing. What support would be most helpful right now? I'm here for you however you need."
        
        elif recipient and not advisor:
            # Feature 2: Format for sharing with a recipient
            print(f"Formatting content for sharing with {recipient}")
            
            system_prompt = """You are an AI assistant that helps reformat journal entries for sharing with specific recipients.
Your task is to paraphrase the content in a way that's appropriate for sharing with the specified recipient.
Do not analyze or provide advice - just reformat the content for sharing.
Maintain the original meaning and emotion, but adjust the tone and language to be suitable for the recipient.
Write in first person from the perspective of the journal writer.

IMPORTANT: You MUST follow the exact format below (this is critical!):
- If recipient is 'self', START with "Personal reflection:" and write as a note to self 
- If recipient is 'friend', START with "Dear friend," and use casual, warm language
- If recipient is 'partner', START with "Dear partner," and use intimate, caring language
- If recipient is 'family', START with "Dear family," and use familial, respectful language
- For any recipient, mention the emotion and its intensity
- Include the original content but phrase it appropriately for the recipient
- End with a brief closing appropriate for the relationship

Example for 'friend': "Dear friend, I wanted to share something with you. I've been feeling [emotion] with intensity level [#] because: [content]. I'd value your thoughts on this if you have time to talk."
Example for 'self': "Personal reflection: I've been feeling [emotion] with intensity level [#]. [content]. I need to remember this moment and what I've learned from it."
"""

            user_message = f"""I've written this journal entry: "{content}"
I'm feeling {emotion} with intensity level {intensity} (on a scale of 1-5).
Please reformat this for sharing with my {recipient}. 
Don't add any analysis or advice - just paraphrase my content in a way that would be appropriate to share with this person.
Make sure to start with a greeting that makes it clear this is for my {recipient}."""
            
            try:
                # Get response from LLM
                print(f"Sending request to Ollama with user message: {user_message[:100]}...")
                response = ollama.chat(
                    model='deepseek-r1:1.5b',
                    messages=[
                        {
                            'role': 'system',
                            'content': system_prompt
                        },
                        {
                            'role': 'user',
                            'content': user_message,
                        }
                    ],
                    options={
                        'temperature': 0.7
                    }
                )
                
                response_text = response['message']['content']
                print(f"Raw Ollama response for recipient: {response_text[:100]}...")
                
                # Clean think tags from response
                response_text = clean_think_tags(response_text)
                
                # Only use minimal formatting if the response clearly failed to follow instructions
                if recipient == 'self' and not any(phrase in response_text for phrase in ["Personal reflection", "Note to self", "Dear self"]):
                    print("Response missing self-reflection format, applying minimal formatting")
                    response_text = f"Personal reflection: {response_text}"
                elif recipient == 'friend' and not any(phrase in response_text.lower() for phrase in ["dear friend", "hey friend", "hi friend"]):
                    print("Response missing friend greeting format, applying minimal formatting")
                    response_text = f"Dear friend, {response_text}"
                elif recipient == 'partner' and not any(phrase in response_text.lower() for phrase in ["dear partner", "my love", "honey"]):
                    print("Response missing partner greeting format, applying minimal formatting")
                    response_text = f"Dear partner, {response_text}"
                elif recipient == 'family' and not any(phrase in response_text.lower() for phrase in ["dear family", "to my family"]):
                    print("Response missing family greeting format, applying minimal formatting")
                    response_text = f"Dear family, {response_text}"
            
            except Exception as e:
                print(f"Error getting sharing format from LLM: {str(e)}")
                # Only use fallbacks if Ollama truly fails
                if recipient == 'self':
                    response_text = f"Personal reflection: I've been feeling {emotion} with intensity level {intensity}.\n\n{content}\n\nI need to remember this moment and what I've learned from it."
                elif recipient == 'friend':
                    response_text = f"Dear friend, I wanted to share something with you. I've been feeling {emotion} with intensity level {intensity} because: {content}\n\nI'd value your thoughts on this if you have time to talk."
                elif recipient == 'partner':
                    response_text = f"Dear partner, I wanted to open up to you about something I've been feeling. I've experienced {emotion} with intensity level {intensity} recently: {content}\n\nI'm sharing this because you're important to me and I value our connection."
                elif recipient == 'family':
                    response_text = f"Dear family, I wanted to share with you that I've been feeling {emotion} with intensity level {intensity} lately: {content}\n\nI'm sharing this with you because family support means a lot to me."
                else:
                    response_text = f"Dear {recipient}, I've been feeling {emotion} with intensity level {intensity} because: {content}\n\nI wanted to share this with you."
        
        elif advisor and recipient:
            # Both features: Get advice and format it for sharing
            print(f"Generating response from {advisor} perspective and formatting for {recipient}")
            
            # Get advice first
            system_prompt = f"""You are a {advisor} providing support about someone's {emotion} feelings.
Your primary task is to create a message that combines:
1) Supportive advice from the perspective of a {advisor}
2) Formatting appropriate for sharing with their {recipient}

IMPORTANT: You MUST follow this exact format (this is critical!):
- If recipient is 'self', START with "Personal reflection:" and make it a note to self
- If recipient is 'friend', START with "Dear friend," and use casual, warm language
- If recipient is 'partner', START with "Dear partner," and use intimate, caring language
- If recipient is 'family', START with "Dear family," and use familial, respectful language
- Clearly identify that this advice comes from a {advisor} (e.g., "My {advisor} helped me understand...")
- Address the {emotion} emotion with intensity level {intensity}
- Provide 2-3 sentences of supportive advice from the {advisor} perspective
- End with a brief closing appropriate for the relationship with the {recipient}

Example: "Dear [recipient], I wanted to share some advice from my [advisor] about my [emotion] feelings. They helped me understand that [brief advice]. [Closing appropriate to recipient]"
"""

            user_message = f"""I'm feeling {emotion} with intensity level {intensity} (on a scale of 1-5) because: "{content}"
First, provide me with supportive advice as my {advisor}.
Then, format this advice to share with my {recipient}.
Make sure the final response is formatted as a message to my {recipient} that includes the advice from my {advisor}."""
            
            try:
                # Get combined response from LLM
                print(f"Sending combined advisor+recipient request to Ollama: {user_message[:100]}...")
                response = ollama.chat(
                    model='deepseek-r1:1.5b',
                    messages=[
                        {
                            'role': 'system',
                            'content': system_prompt
                        },
                        {
                            'role': 'user',
                            'content': user_message,
                        }
                    ],
                    options={
                        'temperature': 0.7
                    }
                )
                
                response_text = response['message']['content']
                print(f"Raw combined Ollama response: {response_text[:100]}...")
                
                # Clean think tags from response
                response_text = clean_think_tags(response_text)
                
                # Only apply minimal formatting if necessary
                if not any(phrase in response_text.lower() for phrase in [f"dear {recipient}", f"to my {recipient}", f"hey {recipient}"]):
                    greeting = "Personal reflection: " if recipient == "self" else f"Dear {recipient}, "
                    response_text = f"{greeting}{response_text}"
                
            except Exception as e:
                print(f"Error getting combined response from LLM: {str(e)}")
                # Fallback for combined response
                if advisor == 'therapist':
                    advice = f"As your therapist, I want to acknowledge that your feelings of {emotion} are completely valid. Emotions provide information about what matters to us. Consider what specific aspects of this situation are most challenging for you. Small coping strategies might help you navigate these feelings."
                elif advisor == 'friend':
                    advice = f"Hey there, as your friend, I just want to say I totally get why you're feeling {emotion}! That's a lot to deal with, but I know you've got this. Want to grab coffee soon? I'm always here to listen whenever you need me."
                elif advisor == 'mentor':
                    advice = f"As your mentor, I believe your {emotion} feelings highlight a growth opportunity. Consider how this connects to your broader goals. What skills are you developing through this challenge? Remember that discomfort often precedes significant development."
                elif advisor == 'parent':
                    advice = f"My dear, as your parent, I want you to know your {emotion} feelings make perfect sense. You've always been strong, and I have complete faith in you. Consider what small step might help you feel more grounded today. I'm always here for you."
                else:
                    advice = f"I understand your {emotion} feelings. It's natural to feel this way given your experience. What support would be most helpful right now? I'm here for you however you need."
                
                # Format for recipient
                if recipient == 'self':
                    response_text = f"Personal reflection: {advice}"
                elif recipient == 'friend':
                    response_text = f"Dear friend, my {advisor} shared this advice with me and I wanted to pass it along: {advice}"
                elif recipient == 'partner':
                    response_text = f"Dear partner, I talked with my {advisor} about how I've been feeling {emotion}, and they said: {advice}"
                elif recipient == 'family':
                    response_text = f"Dear family, I've been getting some support for my {emotion} feelings, and my {advisor} suggested: {advice}"
                else:
                    response_text = f"Dear {recipient}, I wanted to share some advice I received about my {emotion} feelings: {advice}"
        
        else:
            # Default case
            print("No advisor or recipient specified, using default response")
            response_text = f"Thank you for sharing how you feel {emotion}. I hope putting your thoughts into words has been helpful."
        
        print(f"Final response: {response_text[:100]}...")
        return jsonify({"response": response_text})
    except Exception as e:
        print(f"Error in /api/respond: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Add Ollama directory to PATH if not already there
    ollama_dir = os.path.dirname(OLLAMA_PATH)
    if ollama_dir not in os.environ['PATH']:
        os.environ['PATH'] = ollama_dir + os.pathsep + os.environ['PATH']
    
    print("Starting Flask app with Ollama backend...")
    print(f"Ollama path: {OLLAMA_PATH}")
    
    # Check Ollama is running
    try:
        models = ollama.list()
        print(f"Ollama is running with models: {[m['name'] for m in models['models']]}")
    except Exception as e:
        print(f"Warning: Could not connect to Ollama: {str(e)}")
        print("Make sure Ollama is running before making API calls")
        
    app.run(debug=True, host='0.0.0.0', port=5000) 