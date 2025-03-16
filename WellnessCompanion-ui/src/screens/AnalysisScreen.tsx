import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { Text, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { NavigationParams, JournalEntry } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { apiService } from '../services/api';

type Props = {
  navigation: NativeStackNavigationProp<NavigationParams, 'Analysis'>;
  route: RouteProp<NavigationParams, 'Analysis'>;
};

const advisorOptions = [
  { id: 'therapist', label: 'Therapist', icon: '👩‍⚕️' },
  { id: 'friend', label: 'Close Friend', icon: '🤝' },
  { id: 'parent', label: 'Parent', icon: '👨‍👩‍👧‍👦' },
  { id: 'mentor', label: 'Mentor', icon: '🎓' },
];

const recipientOptions = [
  { id: 'self', label: 'Myself', icon: '🤔' },
  { id: 'friend', label: 'A Friend', icon: '👥' },
  { id: 'partner', label: 'Partner', icon: '💑' },
  { id: 'family', label: 'Family Member', icon: '👨‍👩‍👧‍👦' },
];

export const AnalysisScreen: React.FC<Props> = ({ navigation, route }) => {
  const { emotion, content, isVoiceNote } = route.params;
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState('');
  const [selectedAdvisor, setSelectedAdvisor] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [saveToJournal, setSaveToJournal] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Use API service to get analysis
  React.useEffect(() => {
    const getAnalysis = async () => {
      try {
        setLoading(true);
        
        // First check if we can get models to verify the API is accessible
        await apiService.getModels();
        
        // Then get the analysis, including emotion intensity
        const summary = await apiService.getAnalysis(
          content, 
          emotion.name,
          emotion.intensity || 3
        );
        setAiSummary(summary);
        setError(null);
      } catch (err) {
        console.error('Failed to get analysis:', err);
        setError('Failed to connect to the AI service. Using fallback response.');
        // Fallback to a default response if the API call fails
        setAiSummary(
          "Based on your entry, it seems you're experiencing strong emotions due to a challenging situation. Your response shows self-awareness and a desire to understand these feelings better."
        );
      } finally {
        setLoading(false);
      }
    };

    getAnalysis();
  }, [content, emotion]);

  const handleContinue = () => {
    const journalEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date(),
      emotion,
      content,
      isVoiceNote,
      aiSummary,
      isLogged: saveToJournal,
    };

    // Only add the advisor perspective if one is selected
    if (selectedAdvisor) {
      journalEntry.advisorPerspective = selectedAdvisor;
    }

    // Only add the recipient if one is selected
    if (selectedRecipient) {
      journalEntry.recipient = selectedRecipient;
    }

    navigation.navigate('AIResponse', { journalEntry });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.emotionHeader}>
          {emotion.icon ? (
            <Text style={styles.emotionIcon}>{emotion.icon}</Text>
          ) : null}
          <Text style={styles.emotionName}>{emotion.name}</Text>
          {renderIntensityDots()}
        </View>

        <Text style={styles.title}>Your Journey</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
            <Text style={styles.loadingText}>Taking a moment with your thoughts...</Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>How We See Your Story</Text>
              <Text style={styles.summaryText}>{aiSummary}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Who Would You Like Support From?</Text>
              <Text style={styles.sectionDescription}>
                Select to get advice from this perspective (optional)
              </Text>
              <View style={styles.optionsGrid}>
                {advisorOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionCard,
                      selectedAdvisor === option.id && styles.selectedOption,
                    ]}
                    onPress={() => setSelectedAdvisor(option.id)}
                  >
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.divider}></View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Who Are You Sharing With?</Text>
              <Text style={styles.sectionDescription}>
                Select to format your thoughts for sharing (optional)
              </Text>
              <View style={styles.optionsGrid}>
                {recipientOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionCard,
                      selectedRecipient === option.id && styles.selectedOption,
                    ]}
                    onPress={() => {
                      console.log(`Selecting recipient: ${option.id}`);
                      setSelectedRecipient(option.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.saveSection}>
              <TouchableOpacity
                style={styles.saveToggle}
                onPress={() => setSaveToJournal(!saveToJournal)}
              >
                <View style={[styles.checkbox, saveToJournal && styles.checked]} />
                <Text style={styles.saveText}>Keep this in your personal journey</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.continueButton,
                (!selectedAdvisor && !selectedRecipient) && styles.disabledButton,
              ]}
              onPress={handleContinue}
              disabled={!selectedAdvisor && !selectedRecipient}
            >
              <Text style={styles.continueButtonText}>
                {selectedAdvisor && selectedRecipient 
                  ? "Hear Support & Share" 
                  : selectedAdvisor 
                    ? "Hear Your Support" 
                    : "Format for Sharing"}
              </Text>
            </TouchableOpacity>
          </>
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
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  summaryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  summaryText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  sectionDescription: {
    ...theme.typography.body,
    color: theme.colors.text + '80',
    marginBottom: theme.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.text + '20',
    marginVertical: theme.spacing.lg,
    position: 'relative',
    zIndex: 0,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
    marginBottom: theme.spacing.md,
  },
  optionCard: {
    width: '48%',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 1,
    borderWidth: 1,
    borderColor: theme.colors.text + '20',
  },
  selectedOption: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.sm,
  },
  optionLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  saveSection: {
    marginBottom: theme.spacing.xl,
  },
  saveToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.md,
  },
  checked: {
    backgroundColor: theme.colors.primary,
  },
  saveText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: '500',
  },
}); 