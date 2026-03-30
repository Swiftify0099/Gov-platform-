import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScoreCard } from '../../components/ScoreCard';
import mobileApiClient from '../../api/client';

type Props = NativeStackScreenProps<{ Results: { submissionId: string } }, 'Results'>;

interface SubmissionResult {
  id: string;
  score: number;
  total_marks: number;
  percentage: number;
  correct_count: number;
  wrong_count: number;
  skipped_count: number;
  is_passed: boolean;
  time_taken_seconds: number;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

const ResultsScreen: React.FC<Props> = ({ route }) => {
  const { submissionId } = route.params;
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mobileApiClient
      .get(`/submissions/${submissionId}`)
      .then(({ data }) => setResult(data))
      .finally(() => setLoading(false));
  }, [submissionId]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  if (!result) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#64748b' }}>Result not found</Text>
      </View>
    );
  }

  const performanceMessage =
    result.percentage >= 85
      ? '🏆 Outstanding! You\'re exam-ready!'
      : result.percentage >= 60
      ? '👍 Good job! Keep practicing!'
      : result.percentage >= 40
      ? '📚 Keep studying, you can do better!'
      : '💪 Don\'t give up! Review and try again!';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Exam Results</Text>

        <Text style={[
          styles.message,
          { color: result.percentage >= 40 ? '#10b981' : '#ef4444' },
        ]}>
          {performanceMessage}
        </Text>

        <ScoreCard
          score={result.score}
          totalMarks={result.total_marks}
          percentage={result.percentage}
          correct={result.correct_count}
          wrong={result.wrong_count}
          skipped={result.skipped_count}
          isPassed={result.is_passed}
          timeTaken={formatTime(result.time_taken_seconds)}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { padding: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 8 },
  message: { fontSize: 15, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
});

export default ResultsScreen;
