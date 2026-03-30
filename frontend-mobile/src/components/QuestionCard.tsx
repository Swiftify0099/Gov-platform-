import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Question } from '../store/index';

interface QuestionCardProps {
  question: {
    id: string;
    text: string;
    options: string[];
    marks: number;
    negative_marks: number;
    is_multiple_correct?: boolean;
  };
  selectedOptions: number[];
  onSelect: (optionIndex: number) => void;
  questionNumber: number;
  disabled?: boolean;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOptions,
  onSelect,
  questionNumber,
  disabled = false,
}) => {
  return (
    <View style={styles.card}>
      {/* Question header */}
      <View style={styles.header}>
        <Text style={styles.qNumber}>Q{questionNumber}</Text>
        <View style={styles.marks}>
          <Text style={styles.marksText}>+{question.marks} / -{question.negative_marks}</Text>
        </View>
      </View>

      {/* Question text */}
      <Text style={styles.questionText}>{question.text}</Text>

      {/* Options */}
      <View style={styles.options}>
        {question.options.map((option, i) => {
          const isSelected = selectedOptions.includes(i);
          return (
            <TouchableOpacity
              key={i}
              style={[styles.option, isSelected && styles.selectedOption]}
              onPress={() => !disabled && onSelect(i)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <View style={[styles.optionBadge, isSelected && styles.selectedBadge]}>
                <Text style={[styles.optionLabel, isSelected && styles.selectedLabel]}>
                  {OPTION_LABELS[i]}
                </Text>
              </View>
              <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  qNumber: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  marks: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  marksText: { color: '#a5b4fc', fontSize: 12, fontWeight: '600' },
  questionText: { color: '#e2e8f0', fontSize: 15, lineHeight: 22, marginBottom: 16 },
  options: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#1e293b',
  },
  selectedOption: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: '#6366f1',
  },
  optionBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  selectedBadge: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  optionLabel: { color: '#64748b', fontWeight: 'bold', fontSize: 13 },
  selectedLabel: { color: '#ffffff' },
  optionText: { color: '#94a3b8', fontSize: 14, flex: 1 },
  selectedOptionText: { color: '#e2e8f0' },
});
