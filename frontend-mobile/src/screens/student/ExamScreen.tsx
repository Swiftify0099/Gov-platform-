import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Alert, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { QuestionCard } from '../../components/QuestionCard';
import { Timer } from '../../components/Timer';
import mobileApiClient from '../../api/client';

type Props = NativeStackScreenProps<{ Exam: { assignmentId: string } }, 'Exam'>;

interface Question {
  id: string;
  text: string;
  options: string[];
  marks: number;
  negative_marks: number;
}

const ExamScreen: React.FC<Props> = ({ route, navigation }) => {
  const { assignmentId } = route.params;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(3600);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [violationCount, setViolationCount] = useState(0);

  useEffect(() => {
    const setup = async () => {
      try {
        // Start exam session
        const { data: session } = await mobileApiClient.post('/submissions/start', {
          assignment_id: assignmentId,
          face_verified: true, // Mobile face verification is simplified
        });
        setSubmissionId(session.id);
        setSecondsLeft(session.duration_seconds || 3600);

        // Load questions
        const { data: qs } = await mobileApiClient.get(`/questions/assignment/${assignmentId}`);
        setQuestions(qs);
      } catch {
        Alert.alert('Error', 'Failed to start exam');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    setup();
  }, []);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submissionId]);

  const handleAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      const updated = current.includes(optionIndex)
        ? current.filter((i) => i !== optionIndex)
        : [...current, optionIndex];
      return { ...prev, [questionId]: updated };
    });
  };

  const handleSubmit = async () => {
    if (!submissionId) return;
    setSubmitting(true);
    try {
      const { data } = await mobileApiClient.post(`/submissions/${submissionId}/submit`);
      navigation.replace('Results', { submissionId: data.id });
    } catch {
      Alert.alert('Error', 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmSubmit = () => {
    const answered = Object.keys(answers).length;
    const unanswered = questions.length - answered;
    Alert.alert(
      'Submit Exam?',
      unanswered > 0 ? `You have ${unanswered} unanswered questions.` : 'Submit all answers?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', style: 'destructive', onPress: handleSubmit },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#6366f1" size="large" />
        <Text style={{ color: '#64748b', marginTop: 12 }}>Loading exam...</Text>
      </View>
    );
  }

  const question = questions[currentIndex];
  const selectedOptions = answers[question?.id] || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Exam header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.questionCount}>
            Q{currentIndex + 1}/{questions.length}
          </Text>
          {violationCount > 0 && (
            <Text style={styles.violationBadge}>⚠️ Warning {violationCount}/3</Text>
          )}
        </View>
        <Timer secondsLeft={secondsLeft} isLow={secondsLeft < 300} isCritical={secondsLeft < 60} />
      </View>

      {/* Question */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {question && (
          <QuestionCard
            question={question}
            selectedOptions={selectedOptions}
            onSelect={(i) => handleAnswer(question.id, i)}
            questionNumber={currentIndex + 1}
          />
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
          onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navBtnText}>← Prev</Text>
        </TouchableOpacity>

        {currentIndex === questions.length - 1 ? (
          <TouchableOpacity style={styles.submitBtn} onPress={confirmSubmit} disabled={submitting}>
            <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
          >
            <Text style={styles.navBtnText}>Next →</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  questionCount: { color: '#94a3b8', fontSize: 14, fontWeight: '700' },
  violationBadge: { color: '#f59e0b', fontSize: 12, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  navBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { color: '#e2e8f0', fontWeight: '700' },
  submitBtn: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default ExamScreen;
