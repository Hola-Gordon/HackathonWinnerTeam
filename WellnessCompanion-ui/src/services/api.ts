import { JournalEntry } from '../types';
import { config } from '../config';

// Get the API base URL from the config
const API_BASE_URL = config.api.baseUrl;

/**
 * Service to handle API calls to the local agent service
 */
export const apiService = {
  /**
   * Get available AI models
   * @returns Promise with the list of available models
   */
  getModels: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/models`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting models:', error);
      throw error;
    }
  },

  /**
   * Get AI analysis for a journal entry
   * @param content The journal entry content
   * @param emotion The emotion associated with the entry
   * @param intensity Optional intensity level (1-5)
   * @returns Promise with the AI analysis
   */
  getAnalysis: async (content: string, emotion: string, intensity?: number): Promise<string> => {
    try {
      console.log('Sending analysis request:', { content: content.substring(0, 50), emotion, intensity });
      
      // Create a system prompt for the analysis task
      const systemPrompt = `You are an empathetic and insightful AI assistant analyzing a journal entry.
Your task is to provide a thoughtful analysis of the writer's emotions and thoughts.
The journal entry is about feeling ${emotion} with intensity level ${intensity || 3} (on a scale of 1-5).
Focus on providing validation, insight, and gentle observations about patterns in the text.
Keep your response to 3-4 sentences, written in second person (addressing the writer directly).`;

      // Create the request to the Ollama backend
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `The user has written a journal entry about feeling ${emotion} with intensity level ${intensity || 3} (on a scale of 1-5). 
Here's their entry: "${content}"

Provide an empathetic and insightful analysis of their emotions and thoughts. Focus on validation, insight, and gentle observations.`,
          system_prompt: systemPrompt,
          model: 'deepseek-r1:1.5b',
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        console.error(`API error: ${response.status}`, await response.text());
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Analysis response received:', data);
      return data.response;
    } catch (error) {
      console.error('Error getting analysis:', error);
      throw error;
    }
  },

  /**
   * FEATURE 1: Get personalized advice from a specific perspective
   * @param content The journal entry content
   * @param emotion The emotion name
   * @param advisorPerspective The selected advisor perspective (therapist, friend, etc)
   * @param intensity Optional intensity level (1-5)
   * @returns Promise with the AI advice response
   */
  getAdvice: async (content: string, emotion: string, advisorPerspective: string, intensity?: number): Promise<string> => {
    try {
      console.log('Sending advice request:', { 
        content: content.substring(0, 50), 
        emotion, 
        advisorPerspective,
        intensity 
      });
      
      // Use the /api/respond endpoint directly
      const response = await fetch(`${API_BASE_URL}/api/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          emotion,
          advisorPerspective,
          intensity: intensity || 3
        }),
      });

      if (!response.ok) {
        console.error(`API error: ${response.status}`, await response.text());
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Advice response received:', data);
      return data.response;
    } catch (error) {
      console.error('Error getting advice:', error);
      
      // Try direct fetch as fallback
      try {
        console.log('Trying direct fetch fallback for advice');
        const fallbackResponse = await fetch(`${API_BASE_URL}/api/respond`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            emotion,
            advisorPerspective,
            intensity: intensity || 3
          }),
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          return fallbackData.response;
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
      
      throw error;
    }
  },

  /**
   * FEATURE 2: Format content for sharing with a specific recipient
   * @param content The journal entry content
   * @param emotion The emotion name
   * @param recipient The intended recipient (self, friend, partner, family)
   * @param intensity Optional intensity level (1-5)
   * @returns Promise with the formatted sharing text
   */
  formatForSharing: async (content: string, emotion: string, recipient: string, intensity?: number): Promise<string> => {
    try {
      console.log('Sending sharing format request:', { 
        content: content.substring(0, 50), 
        emotion,
        recipient,
        intensity 
      });
      
      // Use the /api/respond endpoint directly
      const response = await fetch(`${API_BASE_URL}/api/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          emotion,
          recipient,
          intensity: intensity || 3
        }),
      });

      if (!response.ok) {
        console.error(`API error: ${response.status}`, await response.text());
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Share formatting response received:', data);
      return data.response;
    } catch (error) {
      console.error('Error formatting for sharing:', error);
      
      // Try direct fetch as fallback
      try {
        console.log('Trying direct fetch fallback for sharing');
        const fallbackResponse = await fetch(`${API_BASE_URL}/api/respond`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            emotion,
            recipient,
            intensity: intensity || 3
          }),
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          return fallbackData.response;
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
      
      throw error;
    }
  },

  /**
   * Legacy method for backward compatibility
   * @deprecated Use getAdvice or formatForSharing instead
   */
  getResponse: async (content: string, emotion: string, advisorPerspective: string, intensity?: number, recipient?: string): Promise<string> => {
    try {
      // Determine which specific method to use based on parameters
      if (advisorPerspective && !recipient) {
        return await apiService.getAdvice(content, emotion, advisorPerspective, intensity);
      } else if (recipient && !advisorPerspective) {
        return await apiService.formatForSharing(content, emotion, recipient, intensity);
      }
      
      // If both or neither are provided, use the old approach
      console.log('Using legacy response method');
      
      // Determine which feature to prioritize
      if (advisorPerspective) {
        return await apiService.getAdvice(content, emotion, advisorPerspective, intensity);
      } else if (recipient) {
        return await apiService.formatForSharing(content, emotion, recipient, intensity);
      } else {
        // Generic response if neither is provided
        return "Thank you for sharing your feelings. I hope writing them down has been helpful for you.";
      }
    } catch (error) {
      console.error('Error getting response:', error);
      throw error;
    }
  },
}; 