# WellnessCompanion

A React Native application that helps users process their emotions through AI-powered feedback and communication assistance.

## Overview

WellnessCompanion is a mobile app designed to help users understand and communicate their emotions effectively. The application follows a two-step process:

1. **Emotion Recognition & Journaling**: Users identify their emotional state and record their thoughts
2. **AI-Powered Response**: Users can choose between two features:
   - **Advisor Perspective**: Get supportive feedback from different perspectives (therapist, friend, mentor, parent)
   - **Communication Formatting**: Receive help paraphrasing emotional experiences for specific audiences (self, friend, partner, family)

## Development Team

- Zheng Gu: gu.zhen@northeastern.edu
- Chenchen (Jane) Feng: feng.chenc@northeastern.edu
- Langze (Michael) An: an.l@northeastern.edu
- Jiahui Song: song.jiahui@northeastern.edu
- Lian Liu: liu.lian1@northeastern.edu

## Features

### Step 1: Emotion Recognition

- Select from a variety of emotions with customizable intensity levels
- Record thoughts via text input
- Review and reflect on the emotional journey

### Step 2: Choose Your Support Path

#### Feature 1: Advisor Perspectives
Get supportive feedback from different viewpoints:
- **Therapist**: Professional, empathetic guidance with validation and gentle questions
- **Friend**: Casual, authentic support with practical suggestions
- **Mentor**: Growth-oriented guidance focused on learning opportunities
- **Parent**: Nurturing support with unconditional acceptance

#### Feature 2: Communication Formatting
Format your emotional experiences for sharing with:
- **Self**: Personal reflections for private journaling
- **Friend**: Casual, approachable messages for peers
- **Partner**: Intimate, connection-focused communication
- **Family**: Respectful, thoughtful messages for family members

## Technical Implementation

The application uses a React Native frontend with a Flask backend powered by the DeepSeek LLM through Ollama:

### Frontend (React Native)
- Emotion selection screen with intensity adjustment
- Recording methods for capturing thoughts
- Analysis screen showing emotional insights
- Response screen displaying AI-generated feedback

### Backend (Flask + Ollama)
- Complete backend implementation is in the single `app.py` file
- Uses DeepSeek-r1:1.5b, a lightweight local LLM model through Ollama
- `/api/respond` endpoint handles both advisor perspective and communication formatting
- DeepSeek LLM generates personalized responses based on:
  - The emotional content
  - Selected perspective or recipient
  - Emotion intensity
- Fallback responses for offline usage

### Edge Computing Integration
- The entire application runs locally (on the edge) without requiring cloud services
- LLM processing happens on-device through Ollama
- Local Flask server handles all API requests
- Provides privacy and offline functionality for sensitive emotional data

## Setup Instructions

### Prerequisites
- Node.js (v14+) and npm (v6+)
- Python 3.7+
- Ollama with DeepSeek-r1:1.5b model installed (`ollama pull deepseek-r1:1.5b`)

### Installation

1. Clone the repository:
```
git clone https://github.com/qchenxu/WellnessCompanion.git
cd WellnessCompanion
```

2. Install frontend dependencies:
```
npm install
```

3. Install backend dependencies:
```
pip install -r requirements.txt
```

4. Start Ollama service:
```
ollama serve
```

5. Start the Flask backend:
```
python app.py
```

6. Start the React Native app:
```
npm start
```

## Usage Guide

1. **Start Your Journey**: Open the app and select your current emotion
2. **Record Your Thoughts**: Enter your thoughts related to that emotion
3. **Review Your Analysis**: See insights about your emotional state
4. **Choose Support Type**:
   - Select "Get Advice" to receive perspective-based guidance
   - Select "Format for Sharing" to get help communicating your feelings
5. **View Response**: Review the AI-generated response based on your selections

## Testing Instructions

To verify the app setup is working correctly:

1. After starting both the backend and frontend, navigate to the Debug screen from the Profile page
2. Click "Test Advisor" to verify the advisor perspective feature
3. Click "Test Recipient" to verify the sharing format feature
4. Both tests should return properly formatted responses from the DeepSeek model

If you encounter issues:
- Check the browser console for error messages
- Verify that Ollama is running with `ollama list`
- Ensure the Flask server is running on port 5000
- Check that the correct model (DeepSeek-r1:1.5b) is installed

## API Documentation

### `/api/respond` Endpoint

**Request Format**:
```json
{
  "content": "Your journaled content",
  "emotion": "happy|sad|angry|etc",
  "intensity": 1-5,
  "advisorPerspective": "therapist|friend|mentor|parent", // For Feature 1
  "recipient": "self|friend|partner|family" // For Feature 2
}
```

**Response Format**:
```json
{
  "response": "AI-generated response based on parameters"
}
```

## Additional Notes

- The application includes fallback responses when Ollama is unavailable, ensuring functionality even offline
- The intensity level (1-5) allows for more nuanced emotional understanding
- The Debug screen provides direct API testing without navigating the full app flow
- Flask CORS is configured to allow local development across different ports

## References

- React Native Documentation: https://reactnative.dev/docs/getting-started
- Flask Documentation: https://flask.palletsprojects.com/
- Ollama Project: https://ollama.ai/
- DeepSeek Model: https://ollama.ai/library/deepseek
- React Navigation: https://reactnavigation.org/
- Material Design Color System: https://material.io/design/color/the-color-system.html

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

Copyright (c) 2023 WellnessCompanion Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
