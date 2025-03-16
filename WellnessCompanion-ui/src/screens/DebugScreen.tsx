import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../theme';

/**
 * Debug screen to test API connections directly
 */
export const DebugScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [testType, setTestType] = useState<'advisor' | 'recipient'>('advisor');

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setResponse('');
    
    try {
      console.log(`Testing ${testType} API directly`);
      
      // Create appropriate test data based on test type
      const requestBody = {
        content: 'I just got a promotion at work!',
        emotion: 'happy',
        ...(testType === 'advisor' 
          ? { advisorPerspective: 'friend' } 
          : { recipient: 'friend' }
        ),
        intensity: 4
      };
      
      console.log('Request body:', requestBody);
      
      const result = await fetch('http://localhost:5000/api/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('API response status:', result.status);
      
      if (!result.ok) {
        throw new Error(`API error: ${result.status}`);
      }
      
      const data = await result.json();
      console.log('API response data:', data);
      
      setResponse(data.response || 'No response data');
    } catch (err: any) {
      console.error('Error testing API:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>API Debug Screen</Text>
        <Text style={styles.description}>Test the API directly to verify connections</Text>
        
        <View style={styles.controlRow}>
          <TouchableOpacity 
            style={[
              styles.controlButton,
              testType === 'advisor' && styles.activeButton
            ]}
            onPress={() => setTestType('advisor')}
          >
            <Text style={styles.buttonText}>Test Advisor</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.controlButton,
              testType === 'recipient' && styles.activeButton
            ]}
            onPress={() => setTestType('recipient')}
          >
            <Text style={styles.buttonText}>Test Recipient</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={testApi}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.testButtonText}>Run API Test</Text>
          )}
        </TouchableOpacity>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {response && (
          <View style={styles.responseContainer}>
            <Text style={styles.responseTitle}>Response</Text>
            <Text style={styles.responseText}>{response}</Text>
          </View>
        )}
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
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.text + '80',
    marginBottom: theme.spacing.xl,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  controlButton: {
    flex: 1,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: theme.spacing.sm,
  },
  activeButton: {
    backgroundColor: theme.colors.primary + '20',
  },
  buttonText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: theme.spacing.md,
    borderRadius: 8,
    marginBottom: theme.spacing.lg,
  },
  errorTitle: {
    ...theme.typography.h2,
    color: '#d44',
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  responseContainer: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: 8,
    marginBottom: theme.spacing.lg,
  },
  responseTitle: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  responseText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
}); 