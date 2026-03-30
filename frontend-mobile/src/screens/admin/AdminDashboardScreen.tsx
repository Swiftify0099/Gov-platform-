import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import mobileApiClient from '../../api/client';

interface Stats {
  total_students: number;
  total_assignments: number;
  total_submissions: number;
  total_violations: number;
}

const AdminDashboardScreen: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await mobileApiClient.get('/admin/dashboard/stats');
      setStats(data.stats);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const statCards = stats ? [
    { label: 'Students', value: stats.total_students, emoji: '👥', color: '#6366f1' },
    { label: 'Assignments', value: stats.total_assignments, emoji: '📝', color: '#10b981' },
    { label: 'Submissions', value: stats.total_submissions, emoji: '✅', color: '#f59e0b' },
    { label: 'Violations', value: stats.total_violations, emoji: '⚠️', color: '#ef4444' },
  ] : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStats} tintColor="#6366f1" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, Admin 👋</Text>
          <Text style={styles.subtitle}>Institute Dashboard</Text>
        </View>

        {/* Stats grid */}
        <View style={styles.grid}>
          {statCards.map((card, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.emoji}>{card.emoji}</Text>
              <Text style={[styles.statValue, { color: card.color }]}>{card.value}</Text>
              <Text style={styles.statLabel}>{card.label}</Text>
            </View>
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📱 Mobile Admin Portal</Text>
          <Text style={styles.infoText}>
            For full admin features including question management, bulk upload, and analytics,
            please use the web admin dashboard.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { padding: 20 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4 },
  subtitle: { color: '#64748b', fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: {
    width: '47%',
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emoji: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 32, fontWeight: '900', marginBottom: 4 },
  statLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  infoCard: {
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
  },
  infoTitle: { color: '#a5b4fc', fontWeight: '700', marginBottom: 8 },
  infoText: { color: '#64748b', fontSize: 13, lineHeight: 20 },
});

export default AdminDashboardScreen;
