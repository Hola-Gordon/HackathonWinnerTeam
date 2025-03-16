import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { theme } from '../theme';
import { NavigationParams, EmotionTrend, MonthlyStats, YearlyOverview } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

type Props = {
  navigation: NativeStackNavigationProp<NavigationParams, 'Profile'>;
};

// Mock data - in real app, this would come from a database
const mockDailyMood: EmotionTrend[] = [
  { date: new Date('2024-01-01'), emotion: { name: 'Happy', icon: '😊', color: '#FFD700', intensity: 4 } },
  { date: new Date('2024-01-02'), emotion: { name: 'Peaceful', icon: '😌', color: '#98FB98', intensity: 3 } },
  { date: new Date('2024-01-03'), emotion: { name: 'Happy', icon: '😊', color: '#FFD700', intensity: 5 } },
  { date: new Date('2024-01-04'), emotion: { name: 'Sad', icon: '😢', color: '#6495ED', intensity: 3 } },
  { date: new Date('2024-01-05'), emotion: { name: 'Anxious', icon: '😰', color: '#FFDAB9', intensity: 4 } },
  { date: new Date('2024-01-06'), emotion: { name: 'Excited', icon: '🤩', color: '#FFA500', intensity: 5 } },
  { date: new Date('2024-01-07'), emotion: { name: 'Peaceful', icon: '😌', color: '#98FB98', intensity: 2 } },
];

const mockMonthlyStats: MonthlyStats[] = [
  {
    month: 'January',
    dominantEmotion: { name: 'Happy', icon: '😊', color: '#FFD700' },
    emotionCounts: { 'Happy': 15, 'Sad': 5, 'Anxious': 3, 'Peaceful': 8 },
  },
  {
    month: 'February',
    dominantEmotion: { name: 'Peaceful', icon: '😌', color: '#98FB98' },
    emotionCounts: { 'Happy': 10, 'Sad': 3, 'Anxious': 5, 'Peaceful': 12 },
  },
  {
    month: 'March',
    dominantEmotion: { name: 'Anxious', icon: '😰', color: '#FFDAB9' },
    emotionCounts: { 'Happy': 8, 'Sad': 4, 'Anxious': 14, 'Peaceful': 5 },
  },
];

const mockYearlyOverview: YearlyOverview = {
  year: 2024,
  monthlyStats: mockMonthlyStats,
  overallMood: 'positive',
  emotionBreakdown: {
    'Happy': 33,
    'Sad': 12,
    'Anxious': 22,
    'Peaceful': 25,
    'Excited': 8,
  }
};

// Helper function to get a nice color for each emotion category
const getEmotionColor = (emotion: string) => {
  const colorMap: Record<string, string> = {
    'Happy': '#FFD700',
    'Sad': '#6495ED',
    'Anxious': '#FFDAB9',
    'Peaceful': '#98FB98', 
    'Excited': '#FFA500',
    'Angry': '#FF6347',
    'Frustrated': '#FF7F50',
    'Worried': '#EEE8AA',
  };
  
  return colorMap[emotion] || '#ccc';
};

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);
  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundColor: theme.colors.card,
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(124, 152, 133, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  const renderDailyView = () => {
    const labels = mockDailyMood.map(item => {
      const date = item.date;
      return date.getDate().toString();
    });
    
    const intensityData = mockDailyMood.map(item => 
      item.emotion.intensity || 3
    );
    
    const emotionColors = mockDailyMood.map(item => item.emotion.color);
    
    return (
      <>
        <Text style={styles.chartTitle}>Daily Mood Intensity</Text>
        <LineChart
          data={{
            labels,
            datasets: [{
              data: intensityData,
              color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
              strokeWidth: 2
            }],
            legend: ["Emotion Intensity"]
          }}
          width={screenWidth - theme.spacing.lg * 2}
          height={220}
          chartConfig={{
            ...chartConfig,
            strokeWidth: 2,
            propsForDots: {
              r: "6",
              strokeWidth: "2",
            }
          }}
          bezier
          style={styles.chart}
        />
        
        <View style={styles.emotionHistory}>
          <Text style={styles.sectionTitle}>Recent Emotions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScroll}>
            {mockDailyMood.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.historyItem,
                  selectedHistoryIndex === index && styles.selectedHistoryItem
                ]}
                onPress={() => setSelectedHistoryIndex(index)}
              >
                <Text style={styles.historyDate}>{item.date.getDate()}/{item.date.getMonth() + 1}</Text>
                <Text style={styles.historyIcon}>{item.emotion.icon}</Text>
                <Text style={styles.historyName}>{item.emotion.name}</Text>
                <View style={styles.intensityIndicator}>
                  {[1, 2, 3, 4, 5].map(level => (
                    <View 
                      key={level} 
                      style={[
                        styles.intensityDot, 
                        level <= (item.emotion.intensity || 3) && { backgroundColor: item.emotion.color }
                      ]} 
                    />
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </>
    );
  };

  const renderMonthlyView = () => {
    const currentMonth = mockMonthlyStats[0];
    const emotionLabels = Object.keys(currentMonth.emotionCounts);
    const emotionValues = emotionLabels.map(e => currentMonth.emotionCounts[e]);
    const emotionColors = emotionLabels.map(emotion => getEmotionColor(emotion));
    
    return (
      <>
        <Text style={styles.chartTitle}>Monthly Emotion Distribution</Text>
        <BarChart
          data={{
            labels: emotionLabels,
            datasets: [{
              data: emotionValues,
              colors: emotionColors.map(color => (opacity = 1) => color + (opacity * 255).toString(16).padStart(2, '0')),
            }],
          }}
          width={screenWidth - theme.spacing.lg * 2}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix=""
          fromZero
          showValuesOnTopOfBars
        />
        
        <View style={styles.monthSelector}>
          <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
            {mockMonthlyStats.map((monthData, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.monthButton,
                  index === 0 && styles.selectedMonthButton
                ]}
                onPress={() => {/* Would update selected month */}}
              >
                <Text style={[
                  styles.monthText,
                  index === 0 && styles.selectedMonthText
                ]}>{monthData.month}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.dominantEmotionCard}>
          <Text style={styles.dominantEmotionTitle}>Dominant Emotion</Text>
          <View style={styles.dominantEmotionContent}>
            <Text style={styles.dominantEmotionIcon}>{currentMonth.dominantEmotion.icon}</Text>
            <View style={styles.dominantEmotionInfo}>
              <Text style={styles.dominantEmotionName}>{currentMonth.dominantEmotion.name}</Text>
              <Text style={styles.dominantEmotionPercentage}>
                {Math.round((currentMonth.emotionCounts[currentMonth.dominantEmotion.name] / 
                  Object.values(currentMonth.emotionCounts).reduce((sum, count) => sum + count, 0)) * 100)}% of entries
              </Text>
            </View>
          </View>
        </View>
      </>
    );
  };

  const renderYearlyView = () => {
    const year = mockYearlyOverview.year;
    const emotionBreakdown = mockYearlyOverview.emotionBreakdown;
    const emotionLabels = Object.keys(emotionBreakdown);
    const emotionValues = emotionLabels.map(e => emotionBreakdown[e]);
    
    // Create data for pie chart
    const pieData = emotionLabels.map((emotion, index) => ({
      name: emotion,
      population: emotionBreakdown[emotion],
      color: getEmotionColor(emotion),
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    }));
    
    return (
      <>
        <Text style={styles.chartTitle}>Yearly Emotion Breakdown - {year}</Text>
        <PieChart
          data={pieData}
          width={screenWidth - theme.spacing.lg * 2}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          style={styles.chart}
        />
        
        <View style={styles.yearlyOverviewCard}>
          <Text style={styles.yearlyOverviewTitle}>Year in Review</Text>
          <Text style={styles.yearlyOverviewText}>
            Your overall emotional state this year has been {" "}
            <Text style={[
              styles.moodHighlight, 
              { color: mockYearlyOverview.overallMood === 'positive' ? '#4CAF50' : 
                       mockYearlyOverview.overallMood === 'negative' ? '#F44336' : '#FFC107' }
            ]}>
              {mockYearlyOverview.overallMood}
            </Text>.
          </Text>
          
          {/* Would include more insights based on real data */}
          <Text style={styles.yearlyInsight}>
            You've experienced <Text style={styles.insightHighlight}>Happy</Text> emotions most frequently, 
            followed by <Text style={styles.insightHighlight}>Peaceful</Text> and <Text style={styles.insightHighlight}>Anxious</Text>.
          </Text>
          
          <Text style={styles.yearlyInsight}>
            Your emotions have been most intense during March, with an average intensity of 4.2 out of 5.
          </Text>
        </View>
        
        <TouchableOpacity style={styles.downloadButton}>
          <Text style={styles.downloadButtonText}>Download Year Report</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Emotional Journey</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.newEntryButton, styles.debugButton]}
            onPress={() => navigation.navigate('Debug')}
          >
            <Text style={styles.buttonText}>Debug</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.newEntryButton}
            onPress={() => navigation.navigate('EmotionSelection')}
          >
            <Text style={styles.buttonText}>New Entry</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.timeframeSelector}>
        {(['daily', 'monthly', 'yearly'] as const).map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.timeframeOption,
              timeframe === option && styles.selectedTimeframe,
            ]}
            onPress={() => setTimeframe(option)}
          >
            <Text
              style={[
                styles.timeframeText,
                timeframe === option && styles.selectedTimeframeText,
              ]}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <View style={styles.chartContainer}>
          {timeframe === 'daily' && renderDailyView()}
          {timeframe === 'monthly' && renderMonthlyView()}
          {timeframe === 'yearly' && renderYearlyView()}

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Most Common Emotion</Text>
              <Text style={styles.statValue}>Happy 😊</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Journaling Streak</Text>
              <Text style={styles.statValue}>7 days</Text>
            </View>
          </View>

          <View style={styles.insightsContainer}>
            <Text style={styles.insightsTitle}>Insights</Text>
            <Text style={styles.insightsText}>
              Your emotional well-being has been generally positive this week. 
              You've shown great consistency in journaling, which contributes to better self-awareness.
            </Text>
            <Text style={styles.insightsText}>
              Consider reflecting on what triggered your anxious feelings on Friday, as understanding 
              these patterns can help you develop coping strategies.
            </Text>
          </View>
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newEntryButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
  timeframeSelector: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    marginBottom: theme.spacing.lg,
  },
  timeframeOption: {
    flex: 1,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedTimeframe: {
    backgroundColor: theme.colors.primary + '20',
  },
  timeframeText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  selectedTimeframeText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  chartContainer: {
    padding: theme.spacing.lg,
  },
  chartTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  chart: {
    marginVertical: theme.spacing.lg,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: 12,
    marginHorizontal: theme.spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statLabel: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  insightsContainer: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: 12,
    marginTop: theme.spacing.lg,
  },
  insightsTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  insightsText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  // New styles for enhanced profile
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emotionHistory: {
    marginVertical: theme.spacing.lg,
  },
  historyScroll: {
    flexDirection: 'row',
  },
  historyItem: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: 12,
    marginRight: theme.spacing.md,
    alignItems: 'center',
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedHistoryItem: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  historyDate: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.sm,
  },
  historyIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  historyName: {
    ...theme.typography.body,
    fontWeight: '500',
    textAlign: 'center',
  },
  intensityIndicator: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
  },
  intensityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 2,
  },
  monthSelector: {
    marginVertical: theme.spacing.lg,
  },
  monthScroll: {
    flexDirection: 'row',
  },
  monthButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    marginRight: theme.spacing.md,
  },
  selectedMonthButton: {
    backgroundColor: theme.colors.primary,
  },
  monthText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  selectedMonthText: {
    color: 'white',
  },
  dominantEmotionCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: 12,
    marginVertical: theme.spacing.lg,
  },
  dominantEmotionTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  dominantEmotionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dominantEmotionIcon: {
    fontSize: 40,
    marginRight: theme.spacing.lg,
  },
  dominantEmotionInfo: {
    flex: 1,
  },
  dominantEmotionName: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  dominantEmotionPercentage: {
    ...theme.typography.body,
    color: theme.colors.text + 'aa',
  },
  yearlyOverviewCard: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: 12,
    marginVertical: theme.spacing.lg,
  },
  yearlyOverviewTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  yearlyOverviewText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  moodHighlight: {
    fontWeight: '600',
  },
  yearlyInsight: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  insightHighlight: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  downloadButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  downloadButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  debugButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: 8,
    marginRight: theme.spacing.md,
  },
}); 