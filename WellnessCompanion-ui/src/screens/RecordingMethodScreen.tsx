import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Text, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { NavigationParams, Emotion } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<NavigationParams, 'RecordingMethod'>;
  route: RouteProp<NavigationParams, 'RecordingMethod'>;
};

export const RecordingMethodScreen: React.FC<Props> = ({ navigation, route }) => {
  const { emotion } = route.params;
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const handleSubmit = () => {
    navigation.navigate('Analysis', {
      emotion,
      content,
      isVoiceNote: false,
    });
  };

  // Helper function to render intensity dots
  const renderIntensityDots = () => {
    const intensity = emotion.intensity || 3;
    return (
      <View style={styles.intensityContainer}>
        <Text style={styles.intensityLabel}>Intensity:</Text>
        <View style={styles.intensityDots}>
          {[1, 2, 3, 4, 5].map(level => (
            <View
              key={level}
              style={[
                styles.intensityDot,
                level <= intensity && { backgroundColor: emotion.color }
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  // Helper function to get a description based on emotion and intensity
  const getPromptText = () => {
    const intensity = emotion.intensity || 3;
    const intensityText = intensity <= 2 ? 'slightly ' :
                         intensity === 3 ? 'moderately ' :
                         'very ';
    
    return `Tell me more about why you're feeling ${intensityText}${emotion.name.toLowerCase()}...`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.header}>
            <Text style={styles.emotion}>{emotion.icon}</Text>
            <Text style={styles.title}>{emotion.name}</Text>
            {renderIntensityDots()}
          </View>

          <Text style={styles.prompt}>
            {getPromptText()}
          </Text>

          <View style={styles.methodSelector}>
            <TouchableOpacity
              style={[
                styles.methodOption,
                !isRecording && styles.selectedMethod,
              ]}
              onPress={() => setIsRecording(false)}
            >
              <Text style={styles.methodText}>Write</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.methodOption,
                isRecording && styles.selectedMethod,
              ]}
              onPress={() => setIsRecording(true)}
            >
              <Text style={styles.methodText}>Record</Text>
            </TouchableOpacity>
          </View>

          {!isRecording ? (
            <TextInput
              style={styles.textInput}
              placeholder="Start typing here..."
              placeholderTextColor={theme.colors.text + '80'}
              multiline
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />
          ) : (
            <View style={styles.recordingContainer}>
              <View style={styles.recordButton}>
                <View style={styles.recordIndicator} />
              </View>
              <Text style={styles.recordingText}>
                Tap to start recording your thoughts...
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={[
              styles.submitButton,
              !content && !isRecording && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={!content && !isRecording}
          >
            <Text style={styles.submitButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  emotion: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
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
  prompt: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  methodSelector: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    overflow: 'hidden',
  },
  methodOption: {
    flex: 1,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  selectedMethod: {
    backgroundColor: theme.colors.primary + '20',
  },
  methodText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    minHeight: 200,
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  recordingContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: theme.spacing.lg,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recordIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
  },
  recordingText: {
    ...theme.typography.body,
    color: theme.colors.text,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: theme.spacing.md,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '500',
  },
}); 