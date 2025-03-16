import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type Emotion = {
  name: string;
  icon: string; // emoji or icon name
  color: string;
  intensity?: number; // Optional intensity level from 1-5
};

export type JournalEntry = {
  id: string;
  date: Date;
  emotion: Emotion;
  content: string;
  isVoiceNote: boolean;
  aiSummary?: string;
  advisorPerspective?: string;
  recipient?: string;
  isLogged: boolean;
};

export type NavigationParams = {
  EmotionSelection: undefined;
  RecordingMethod: { emotion: Emotion };
  Analysis: { emotion: Emotion; content: string; isVoiceNote: boolean };
  AIResponse: { journalEntry: any };
  Gratitude: { emotion: Emotion };
  Profile: undefined;
  Debug: undefined;
};

export type ScreenProps<T extends keyof NavigationParams> = {
  navigation: NativeStackNavigationProp<NavigationParams, T>;
  route: RouteProp<NavigationParams, T>;
};

export type EmotionTrend = {
  date: Date;
  emotion: Emotion;
};

export type MonthlyStats = {
  month: string;
  dominantEmotion: Emotion;
  emotionCounts: Record<string, number>;
};

export type YearlyOverview = {
  year: number;
  monthlyStats: MonthlyStats[];
  overallMood: 'positive' | 'neutral' | 'negative';
  emotionBreakdown: Record<string, number>; // Map of emotion names to their count
}; 