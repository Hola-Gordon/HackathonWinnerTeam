import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Text, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { NavigationParams, Emotion } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<NavigationParams, 'Gratitude'>;
  route: RouteProp<NavigationParams, 'Gratitude'>;
};

export const GratitudeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { emotion } = route.params;

  const handleContinue = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'EmotionSelection' }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.confettiContainer}>
          <Text style={styles.confetti}>🎉 ✨ 🎊 ✨ 🎉</Text>
        </View>
        
        <Text style={styles.title}>Great Job!</Text>
        
        <Text style={styles.message}>
          Thank you for taking the time to reflect on your emotions. Regular journaling can help
          improve emotional well-being and build self-awareness.
        </Text>
        
        <View style={styles.emoticonContainer}>
          <Text style={styles.emoticon}>{emotion.icon}</Text>
        </View>
        
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
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
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiContainer: {
    width: '100%',
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  confetti: {
    fontSize: 36,
    letterSpacing: 8,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  emoticonContainer: {
    backgroundColor: theme.colors.card,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emoticon: {
    fontSize: 36,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: '500',
  },
}); 