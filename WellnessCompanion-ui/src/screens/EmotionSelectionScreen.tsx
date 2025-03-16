import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TextInput,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Text, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { NavigationParams, Emotion } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<NavigationParams, 'EmotionSelection'>;
};

// All emotions in a flat array
const allEmotions = [
  // Happy emotions
  { name: 'Happy', icon: '😊', color: '#FFD700' },
  { name: 'Excited', icon: '🤩', color: '#FFA500' },
  { name: 'Peaceful', icon: '😌', color: '#98FB98' },
  { name: 'Grateful', icon: '🙏', color: '#9370DB' },
  { name: 'Amused', icon: '😄', color: '#FFFF00' },
  { name: 'Optimistic', icon: '🌈', color: '#FF69B4' },
  // Sad emotions
  { name: 'Sad', icon: '😢', color: '#6495ED' },
  { name: 'Disappointed', icon: '😔', color: '#7B68EE' },
  { name: 'Lonely', icon: '🥺', color: '#9FB6CD' },
  { name: 'Heartbroken', icon: '💔', color: '#E066FF' },
  { name: 'Melancholy', icon: '😞', color: '#87CEFA' },
  { name: 'Hopeless', icon: '😖', color: '#4682B4' },
  // Angry emotions
  { name: 'Angry', icon: '😠', color: '#FF6347' },
  { name: 'Frustrated', icon: '😤', color: '#FF7F50' },
  { name: 'Irritated', icon: '😒', color: '#F08080' },
  { name: 'Resentful', icon: '😑', color: '#CD5C5C' },
  { name: 'Furious', icon: '😡', color: '#DC143C' },
  { name: 'Annoyed', icon: '🙄', color: '#FA8072' },
  // Anxious emotions
  { name: 'Anxious', icon: '😰', color: '#FFDAB9' },
  { name: 'Overwhelmed', icon: '😩', color: '#F0E68C' },
  { name: 'Stressed', icon: '😫', color: '#FFFACD' },
  { name: 'Worried', icon: '😟', color: '#EEE8AA' },
  { name: 'Nervous', icon: '😬', color: '#FFE4B5' },
  { name: 'Fearful', icon: '😨', color: '#FFE4E1' },
  // Other emotions
  { name: 'Surprised', icon: '😲', color: '#00CED1' },
  { name: 'Confused', icon: '🤔', color: '#9932CC' },
  { name: 'Proud', icon: '🦚', color: '#4169E1' },
  { name: 'Bored', icon: '😴', color: '#D3D3D3' },
  { name: 'Content', icon: '🥰', color: '#FFC0CB' },
  { name: 'Confident', icon: '😎', color: '#00BFFF' },
];

// More emotion icons for custom selection
const emotionIcons = ['😊', '😢', '😠', '😰', '🤩', '😔', '😤', '😩', '😌', '🥺', '😒', '😫', '🙏', '💔', '😑', '😟', '😎', '😭', '🥰', '😱', '🤔', '😴', '🥳', '😣'];

export const EmotionSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [intensityLevel, setIntensityLevel] = useState<number>(3);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customEmotionName, setCustomEmotionName] = useState('');
  const [customEmotionIcon, setCustomEmotionIcon] = useState('😊');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmotions, setFilteredEmotions] = useState(allEmotions);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEmotions(allEmotions);
      setShowSuggestions(false);
      return;
    }
    
    // Enhance fuzzy matching to better handle repeated characters
    const fuzzyMatch = (query: string, target: string): number => {
      // Normalize both strings by removing repeated characters
      const normalizeString = (str: string): string => {
        return str.toLowerCase().replace(/(.)\1+/g, '$1');
      };
      
      const normalizedQuery = normalizeString(query);
      const normalizedTarget = normalizeString(target);
      
      // Exact match gets highest score
      if (query.toLowerCase() === target.toLowerCase()) return 100;
      
      // Normalized match gets high score (helps with repeated characters)
      if (normalizedQuery === normalizedTarget) return 90;
      
      // Contains the query as a substring
      if (target.toLowerCase().includes(query.toLowerCase())) return 80;
      
      // Check for similar starting characters
      let matchScore = 0;
      for (let i = 0; i < Math.min(normalizedQuery.length, normalizedTarget.length); i++) {
        if (normalizedQuery[i] === normalizedTarget[i]) matchScore += 5;
        else break;
      }
      
      // Check for similar characters in any position
      const queryChars = new Set(normalizedQuery.split(''));
      const targetChars = new Set(normalizedTarget.split(''));
      let commonChars = 0;
      
      queryChars.forEach(char => {
        if (targetChars.has(char)) commonChars++;
      });
      
      matchScore += (commonChars / Math.max(queryChars.size, targetChars.size)) * 50;
      
      return matchScore;
    };
    
    // Filter and sort emotions by fuzzy match score
    const scoredEmotions = allEmotions.map(emotion => ({
      emotion,
      score: fuzzyMatch(searchQuery, emotion.name)
    }));
    
    // Filter out low-scoring matches
    const matches = scoredEmotions
      .filter(item => item.score > 30)
      .sort((a, b) => b.score - a.score)
      .map(item => item.emotion);
    
    setFilteredEmotions(matches.length > 0 ? matches : allEmotions);
    setShowSuggestions(matches.length > 0);
  }, [searchQuery]);
  
  const handleEmotionSelection = (emotion: Emotion) => {
    console.log("Selecting emotion:", emotion.name);
    setSelectedEmotion(emotion);
    setSearchQuery(emotion.name);
    setShowSuggestions(false);
  };

  const handleEmotionSubmit = () => {
    if (searchQuery.trim()) {
      // Always use exactly what the user typed
      const customEmotion = {
        name: searchQuery.trim(),
        icon: '',
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        intensity: intensityLevel
      };
      setSelectedEmotion(customEmotion);
      proceedWithEmotion(customEmotion);
    } else if (selectedEmotion) {
      // Just proceed with the already selected emotion
      proceedWithEmotion(selectedEmotion);
    }
  };
  
  const proceedWithEmotion = (emotion: Emotion) => {
    // Apply intensity to the emotion
    const emotionWithIntensity = {
      ...emotion,
      intensity: intensityLevel
    };
    navigation.navigate('RecordingMethod', { emotion: emotionWithIntensity });
  };

  const handleIntensityChange = (value: number) => {
    setIntensityLevel(Math.round(value));
  };

  const handleCustomEmotionSubmit = () => {
    if (customEmotionName.trim()) {
      const customEmotion = {
        name: customEmotionName,
        icon: customEmotionIcon,
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        intensity: intensityLevel
      };
      setCustomModalVisible(false);
      setCustomEmotionName('');
      navigation.navigate('RecordingMethod', { emotion: customEmotion });
    }
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  // Function to render custom intensity slider
  const renderIntensitySlider = () => {
    return (
      <View style={styles.intensityContainer}>
        <Text style={styles.intensityLabel}>Intensity: {intensityLevel}/5</Text>
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${(intensityLevel / 5) * 100}%` }]} />
          </View>
          <View style={styles.sliderButtonsContainer}>
            {[1, 2, 3, 4, 5].map(level => (
              <TouchableOpacity 
                key={level}
                style={[
                  styles.sliderButton,
                  intensityLevel === level && styles.sliderButtonActive
                ]}
                onPress={() => setIntensityLevel(level)}
              >
                <Text style={[
                  styles.sliderButtonText, 
                  intensityLevel === level && styles.sliderButtonTextActive
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.intensityLabels}>
          <Text style={styles.intensityMinLabel}>Mild</Text>
          <Text style={styles.intensityMaxLabel}>Strong</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableWithoutFeedback onPress={() => {
          Keyboard.dismiss();
          setShowSuggestions(false);
        }}>
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>How are you feeling?</Text>
              <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
                <Text style={styles.profileText}>Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>

        {/* Chat-like input panel */}
        <View style={styles.chatBox}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.trim() === '') {
                  setSelectedEmotion(null);
                }
                // Don't show suggestions while typing
                setShowSuggestions(false);
              }}
              placeholder="Type how you feel..."
              placeholderTextColor={theme.colors.text + '50'}
              returnKeyType="send"
              onSubmitEditing={handleEmotionSubmit}
            />
            
            <TouchableOpacity 
              style={[styles.sendButton, !searchQuery.trim() && styles.disabledButton]} 
              onPress={handleEmotionSubmit}
              disabled={!searchQuery.trim()}
            >
              <Text style={styles.sendButtonText}>↑</Text>
            </TouchableOpacity>
          </View>
          
          {/* Only show selected emotion after submission */}
          {selectedEmotion && searchQuery.trim() !== '' && (
            <View style={styles.typedEmotionResult}>
              <Text style={styles.typedEmotionText}>
                {selectedEmotion.icon ? <Text style={styles.typedEmotionIcon}>{selectedEmotion.icon} </Text> : null}
                {selectedEmotion.name}
              </Text>
            </View>
          )}
        </View>

        {/* Divider with "or" text */}
        <View style={styles.orDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Common feelings grid */}
        <Text style={styles.gridTitle}>Choose what you feel</Text>
        <View style={styles.emotionsGrid} pointerEvents="auto">
          {allEmotions.slice(0, 9).map((emotion) => (
            <TouchableOpacity
              key={emotion.name}
              style={[
                styles.emotionCard, 
                { backgroundColor: `${emotion.color}20` },
                selectedEmotion?.name === emotion.name && styles.selectedEmotionCard
              ]}
              onPress={() => handleEmotionSelection(emotion)}
              activeOpacity={0.6}
            >
              <Text style={styles.emotionIcon}>{emotion.icon}</Text>
              <Text style={styles.emotionName}>{emotion.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.moreEmotionsButton}
          onPress={() => setCustomModalVisible(true)}
        >
          <Text style={styles.moreEmotionsText}>+ More feelings</Text>
        </TouchableOpacity>

        {/* Selected Emotion Indicator */}
        {selectedEmotion && (
          <View style={styles.selectedEmotionIndicator}>
            <Text style={styles.selectedEmotionText}>
              You feel: {selectedEmotion.icon ? selectedEmotion.icon + ' ' : ''}{selectedEmotion.name}
            </Text>
          </View>
        )}

        {/* Intensity question */}
        <Text style={styles.intensityQuestion}>How strong is this feeling?</Text>

        {/* Intensity Slider at the end */}
        {renderIntensitySlider()}

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedEmotion && !searchQuery.trim()) && styles.disabledButton
          ]}
          onPress={handleEmotionSubmit}
          disabled={!selectedEmotion && !searchQuery.trim()}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        {/* Custom Emotion Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={customModalVisible}
          onRequestClose={() => setCustomModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create Your Own</Text>
              
              <Text style={styles.modalLabel}>What are you feeling?</Text>
              <TextInput
                style={styles.modalInput}
                value={customEmotionName}
                onChangeText={setCustomEmotionName}
                placeholder="Name your feeling..."
                placeholderTextColor={theme.colors.text + '50'}
                autoFocus
              />
              
              <Text style={styles.modalLabel}>Pick an emoji:</Text>
              <View style={styles.iconGrid}>
                {emotionIcons.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      customEmotionIcon === icon && styles.selectedIconOption
                    ]}
                    onPress={() => setCustomEmotionIcon(icon)}
                  >
                    <Text style={styles.iconText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setCustomModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    !customEmotionName.trim() && styles.disabledButton
                  ]}
                  onPress={handleCustomEmotionSubmit}
                  disabled={!customEmotionName.trim()}
                >
                  <Text style={styles.submitButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  profileButton: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 8,
  },
  profileText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  chatBox: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.text + '40',
  },
  orText: {
    ...theme.typography.body,
    color: theme.colors.text + '80',
    marginHorizontal: theme.spacing.md,
  },
  gridTitle: {
    ...theme.typography.h2,
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    zIndex: 0,
  },
  emotionCard: {
    width: '31%',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: 12,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 100,
  },
  selectedEmotionCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
  },
  emotionIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  emotionName: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  moreEmotionsButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  moreEmotionsText: {
    ...theme.typography.body,
    color: theme.colors.primary,
  },
  intensityQuestion: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    fontSize: 16,
  },
  intensityContainer: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.card,
  },
  intensityLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  sliderContainer: {
    width: '100%',
    height: 40,
    marginBottom: theme.spacing.sm,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: theme.colors.card,
    borderRadius: 3,
    marginTop: 12,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  sliderButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    width: '100%',
    top: 0,
  },
  sliderButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  sliderButtonText: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  sliderButtonTextActive: {
    color: 'white',
  },
  intensityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  intensityMinLabel: {
    ...theme.typography.caption,
    color: theme.colors.text,
  },
  intensityMaxLabel: {
    ...theme.typography.caption,
    color: theme.colors.text,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  modalLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  modalInput: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  iconOption: {
    width: '16.66%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: theme.spacing.sm,
  },
  selectedIconOption: {
    backgroundColor: theme.colors.primary + '20',
  },
  iconText: {
    fontSize: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  selectedEmotionIndicator: {
    backgroundColor: theme.colors.primary + '20',
    padding: theme.spacing.md,
    borderRadius: 8,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  selectedEmotionText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  typedEmotionResult: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 8,
  },
  typedEmotionText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  typedEmotionIcon: {
    fontSize: 18,
  },
  typedEmotionNote: {
    ...theme.typography.body,
    color: theme.colors.text + '80',
    fontWeight: 'normal',
    fontStyle: 'italic',
    fontSize: 13,
  },
}); 