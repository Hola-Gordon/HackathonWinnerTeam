import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, Share } from 'react-native';
import { Text, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { NavigationParams, JournalEntry } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { apiService } from '../services/api';

type Props = {
  navigation: NativeStackNavigationProp<NavigationParams, 'AIResponse'>;
  route: RouteProp<NavigationParams, 'AIResponse'>;
};

// Advisor options
const advisorOptions = [
  { id: 'therapist', label: 'Therapist', icon: '🧠' },
  { id: 'friend', label: 'Friend', icon: '👋' },
  { id: 'mentor', label: 'Mentor', icon: '🌟' },
  { id: 'parent', label: 'Parent', icon: '💖' },
];

// Recipient options
const recipientOptions = [
  { id: 'self', label: 'Myself', icon: '🤔' },
  { id: 'friend', label: 'Friend', icon: '👋' },
  { id: 'partner', label: 'Partner', icon: '💕' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
];

export const AIResponseScreen: React.FC<Props> = ({ navigation, route }) => {
  const { journalEntry } = route.params;
  const [loading, setLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Helper function to render intensity dots
  const renderIntensityDots = () => {
    const intensity = journalEntry.emotion.intensity || 3;
    return (
      <View style={styles.intensityContainer}>
        <Text style={styles.intensityLabel}>Intensity:</Text>
        <View style={styles.intensityDots}>
          {[1, 2, 3, 4, 5].map(level => (
            <View
              key={level}
              style={[
                styles.intensityDot,
                level <= intensity && { backgroundColor: journalEntry.emotion.color }
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  // Get the response from the selected advisor or format for recipient
  useEffect(() => {
    const getResponse = async () => {
      try {
        setLoading(true);
        // Add more detailed debugging for the journal entry
        console.log('AIResponseScreen: Journal Entry Details:', {
          hasAdvisor: !!journalEntry.advisorPerspective,
          advisor: journalEntry.advisorPerspective,
          hasRecipient: !!journalEntry.recipient,
          recipient: journalEntry.recipient,
          emotion: journalEntry.emotion.name,
          intensity: journalEntry.emotion.intensity,
          content: journalEntry.content.substring(0, 30) + '...',
          emotionObject: JSON.stringify(journalEntry.emotion),
        });
        
        // Add basic fetch test to verify API is reachable
        try {
          console.log('AIResponseScreen: Testing direct API call');
          const testResponse = await fetch('http://localhost:5000/api/respond', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: journalEntry.content,
              emotion: journalEntry.emotion.name,
              advisorPerspective: journalEntry.advisorPerspective || undefined,
              recipient: journalEntry.recipient || undefined,
              intensity: journalEntry.emotion.intensity || 3
            }),
          });
          
          console.log('AIResponseScreen: Direct API test status:', testResponse.status);
          
          if (testResponse.ok) {
            const directData = await testResponse.json();
            console.log('AIResponseScreen: Direct API test response:', directData);
            
            // Use the direct response if we get one
            setAiResponse(directData.response || 'No response from direct API test');
            setLoading(false);
            return;
          }
        } catch (directError) {
          console.error('AIResponseScreen: Direct API test error:', directError);
        }
        
        // Use the specific API methods based on which feature is being used
        let response;
        
        if (journalEntry.advisorPerspective) {
          // Using the first logic - getting advice from an advisor
          console.log('AIResponseScreen: Getting advice from', journalEntry.advisorPerspective);
          try {
            response = await apiService.getAdvice(
              journalEntry.content,
              journalEntry.emotion.name,
              journalEntry.advisorPerspective,
              journalEntry.emotion.intensity
            );
            console.log('AIResponseScreen: Successfully received advice response:', response.substring(0, 100));
          } catch (adviceError) {
            console.error('AIResponseScreen: Error getting advice:', adviceError);
            throw adviceError;
          }
        } else if (journalEntry.recipient) {
          // Using the second logic - formatting for a recipient
          console.log('AIResponseScreen: Formatting for recipient', journalEntry.recipient);
          try {
            response = await apiService.formatForSharing(
              journalEntry.content,
              journalEntry.emotion.name,
              journalEntry.recipient,
              journalEntry.emotion.intensity
            );
            console.log('AIResponseScreen: Successfully received formatting response:', response.substring(0, 100));
          } catch (formatError) {
            console.error('AIResponseScreen: Error formatting for sharing:', formatError);
            throw formatError;
          }
        } else {
          // Default - should not typically happen as button is disabled
          console.log('AIResponseScreen: No advisor or recipient selected, using default message');
          response = "Thank you for sharing how you feel. I hope putting your thoughts into words has been helpful.";
        }
        
        setAiResponse(response);
        setError(null);
      } catch (err) {
        console.error('AIResponseScreen: Failed to get AI response:', err);
        setError('Failed to connect to the AI service. Using fallback response.');
        
        // Different fallbacks based on whether it's advisor perspective or recipient sharing
        if (journalEntry.advisorPerspective) {
          // Fallback responses for advisor perspectives
          const fallbackResponses: Record<string, string> = {
            therapist: `As your therapist, I want to acknowledge that your feelings of ${journalEntry.emotion.name} with intensity level ${journalEntry.emotion.intensity || 3} are completely valid. Emotions are natural responses to our experiences. Consider what these feelings might be telling you about your needs right now. What small step could you take toward addressing those needs?`,
            friend: `Hey there, as your friend, I just want to say I totally get why you're feeling ${journalEntry.emotion.name} with that intensity level ${journalEntry.emotion.intensity || 3}! That's a lot to deal with, but I've seen you handle tough stuff before. Want to grab coffee soon and talk more about it? I'm always here for you, no matter what.`,
            mentor: `As your mentor, I believe your ${journalEntry.emotion.name} feelings with intensity level ${journalEntry.emotion.intensity || 3} highlight an important growth opportunity. Consider how this challenge connects to your broader goals and values. What skills might you develop by navigating this situation thoughtfully? Remember that discomfort often precedes significant development.`,
            parent: `My dear, as your parent, I want you to know that your ${journalEntry.emotion.name} feelings with intensity level ${journalEntry.emotion.intensity || 3} are completely understandable. You've always had such strength in facing challenges, and I have complete faith in you now. What small step might help you feel more grounded today?`,
          };
          
          console.log('AIResponseScreen: Using fallback response for advisor:', journalEntry.advisorPerspective);
          setAiResponse(fallbackResponses[journalEntry.advisorPerspective] || fallbackResponses.friend);
        } else if (journalEntry.recipient) {
          // Fallback responses for recipient sharing
          const fallbackResponses: Record<string, string> = {
            self: `Personal reflection: I've been feeling ${journalEntry.emotion.name} with intensity level ${journalEntry.emotion.intensity || 3}.\n\n${journalEntry.content}\n\nI need to remember this moment and what I've learned from it.`,
            friend: `Dear friend, I wanted to share something with you. I've been feeling ${journalEntry.emotion.name} with intensity level ${journalEntry.emotion.intensity || 3} because:\n\n${journalEntry.content}\n\nI'd value your thoughts on this if you have time to talk.`,
            partner: `Dear partner, I wanted to open up to you about something I've been feeling. I've experienced ${journalEntry.emotion.name} with intensity level ${journalEntry.emotion.intensity || 3} recently:\n\n${journalEntry.content}\n\nI'm sharing this because you're important to me and I value our connection.`,
            family: `Dear family, I wanted to share with you that I've been feeling ${journalEntry.emotion.name} with intensity level ${journalEntry.emotion.intensity || 3} lately:\n\n${journalEntry.content}\n\nI'm sharing this with you because family support means a lot to me.`,
          };
          
          console.log('AIResponseScreen: Using fallback response for recipient:', journalEntry.recipient);
          setAiResponse(fallbackResponses[journalEntry.recipient] || fallbackResponses.friend);
        } else {
          // Generic fallback
          console.log('AIResponseScreen: Using generic fallback response');
          setAiResponse("Thank you for sharing how you feel. I hope putting your thoughts into words has been helpful.");
        }
      } finally {
        setLoading(false);
      }
    };

    getResponse();
  }, [journalEntry]);
  
  const handleShare = async () => {
    try {
      if (journalEntry.advisorPerspective) {
        const advisorName = getAdvisorName(journalEntry.advisorPerspective);
        await Share.share({
          message: `Advice from ${advisorName}:\n\n${aiResponse}`,
          title: 'Advice from my Wellness Companion',
        });
      } else if (journalEntry.recipient) {
        const recipientName = getRecipientName(journalEntry.recipient);
        await Share.share({
          message: `Sharing with ${recipientName}:\n\n${aiResponse}`,
          title: 'Shared from my Wellness Companion',
        });
      } else {
        await Share.share({
          message: aiResponse,
          title: 'From my Wellness Companion',
        });
      }
    } catch (error) {
      console.error('Error sharing response:', error);
    }
  };

  const getAdvisorName = (advisorId: string): string => {
    const advisor = advisorOptions.find(a => a.id === advisorId);
    return advisor ? advisor.label : 'Advisor';
  };
  
  const getRecipientName = (recipientId: string): string => {
    const recipient = recipientOptions.find(r => r.id === recipientId);
    return recipient ? recipient.label : 'Someone';
  };

  const handleComplete = () => {
    // Would normally save the entry to a database here
    navigation.navigate('Gratitude', { emotion: journalEntry.emotion });
  };

  // Determine the header text based on whether we're showing advisor perspective or recipient sharing
  const getHeaderText = () => {
    if (journalEntry.advisorPerspective && !journalEntry.recipient) {
      return (
        <View style={styles.advisorInfo}>
          <Text style={styles.fromText}>Words from your</Text>
          <Text style={styles.advisorName}>
            {getAdvisorName(journalEntry.advisorPerspective)}
          </Text>
        </View>
      );
    } else if (journalEntry.recipient) {
      return (
        <View style={styles.advisorInfo}>
          <Text style={styles.fromText}>Sharing with</Text>
          <Text style={styles.advisorName}>
            {getRecipientName(journalEntry.recipient)}
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.advisorInfo}>
          <Text style={styles.fromText}>Your Reflection</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.emotionHeader}>
          {journalEntry.emotion.icon ? (
            <Text style={styles.emotionIcon}>{journalEntry.emotion.icon}</Text>
          ) : null}
          <Text style={styles.emotionName}>{journalEntry.emotion.name}</Text>
          {renderIntensityDots()}
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            {journalEntry.recipient ? "Your Sharing" : "Your Support"}
          </Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Text style={styles.iconText}>Share</Text>
          </TouchableOpacity>
        </View>

        {getHeaderText()}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={styles.loadingText}>
              {journalEntry.advisorPerspective 
                ? "Preparing your personal support..." 
                : "Formatting your message for sharing..."}
            </Text>
          </View>
        ) : (
          <View style={styles.responseCard}>
            <Text style={styles.responseText}>{aiResponse}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.completeButtonText}>Continue Your Journey</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
  },
  emotionHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emotionIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  emotionName: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  intensityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensityLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  intensityDots: {
    flexDirection: 'row',
  },
  intensityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  shareButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: 8,
  },
  iconText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  responseCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: 12,
    marginBottom: theme.spacing.xl,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  advisorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  fromText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  advisorName: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    fontSize: 20,
    marginLeft: theme.spacing.sm,
  },
  responseText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 24,
  },
  completeButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: '500',
  },
}); 