import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ScoreCardProps {
  score: number;
  totalMarks: number;
  percentage: number;
  correct: number;
  wrong: number;
  skipped: number;
  isPassed: boolean;
  timeTaken: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  score,
  totalMarks,
  percentage,
  correct,
  wrong,
  skipped,
  isPassed,
  timeTaken,
}) => {
  const scoreColor = percentage >= 85 ? '#10b981' : percentage >= 40 ? '#f59e0b' : '#ef4444';
  const statusBg = isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
  const statusBorder = isPassed ? '#10b981' : '#ef4444';

  return (
    <View style={styles.card}>
      {/* Score */}
      <View style={styles.scoreSection}>
        <Text style={[styles.score, { color: scoreColor }]}>{score}</Text>
        <Text style={styles.totalMarks}>/{totalMarks}</Text>
      </View>

      {/* Status badge */}
      <View style={[styles.statusBadge, { backgroundColor: statusBg, borderColor: statusBorder }]}>
        <Text style={[styles.statusText, { color: isPassed ? '#10b981' : '#ef4444' }]}>
          {isPassed ? '✓ PASSED' : '✗ FAILED'} • {percentage.toFixed(1)}%
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percentage}%` as unknown as number, backgroundColor: scoreColor }]} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatBox label="Correct" value={correct} color="#10b981" />
        <StatBox label="Wrong" value={wrong} color="#ef4444" />
        <StatBox label="Skipped" value={skipped} color="#64748b" />
        <StatBox label="Time" value={timeTaken} color="#60a5fa" isText />
      </View>
    </View>
  );
};

const StatBox: React.FC<{ label: string; value: number | string; color: string; isText?: boolean }> = ({
  label, value, color, isText = false,
}) => (
  <View style={stat.box}>
    <Text style={[stat.value, { color, fontSize: isText ? 13 : 22 }]}>{value}</Text>
    <Text style={stat.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  scoreSection: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  score: { fontSize: 64, fontWeight: '900' },
  totalMarks: { fontSize: 24, color: '#64748b', marginLeft: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusText: { fontWeight: 'bold', fontSize: 14 },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  statsRow: { flexDirection: 'row', gap: 8, width: '100%' },
});

const stat = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  value: { fontWeight: 'bold', marginBottom: 2 },
  label: { color: '#64748b', fontSize: 10 },
});
