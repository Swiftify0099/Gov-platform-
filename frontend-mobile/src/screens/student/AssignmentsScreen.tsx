import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import mobileApiClient from '../../api/client';
import { useNavigation } from '@react-navigation/native';

interface Assignment {
  id: string;
  title: string;
  exam_stream: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  total_marks: number;
  duration_minutes: number;
  is_active: boolean;
}

type TabType = 'upcoming' | 'live' | 'completed';

const AssignmentsScreen: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const navigation = useNavigation<unknown>();

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const { data } = await mobileApiClient.get('/assignments');
      setAssignments(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAssignments(); }, []);

  const now = new Date();
  const categorize = (a: Assignment): TabType => {
    const start = new Date(`${a.scheduled_date}T${a.start_time}`);
    const end = new Date(`${a.scheduled_date}T${a.end_time}`);
    if (now >= start && now <= end) return 'live';
    if (now > end) return 'completed';
    return 'upcoming';
  };

  const filtered = assignments.filter((a) => categorize(a) === activeTab);

  const renderItem = ({ item }: { item: Assignment }) => {
    const isLive = categorize(item) === 'live';
    return (
      <TouchableOpacity
        style={[styles.card, isLive && styles.liveCard]}
        onPress={() => isLive && (navigation as unknown as { navigate: (s: string, p: unknown) => void }).navigate('Exam', { assignmentId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.streamBadge, isLive && styles.liveBadge]}>
            <Text style={styles.streamText}>{isLive ? '● LIVE' : item.exam_stream}</Text>
          </View>
          <Text style={styles.marks}>{item.total_marks} marks</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>
          📅 {item.scheduled_date} • ⏰ {item.start_time} – {item.end_time} • {item.duration_minutes} min
        </Text>
        {isLive && (
          <View style={styles.startBtn}>
            <Text style={styles.startBtnText}>Start Exam →</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>My Exams</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['upcoming', 'live', 'completed'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'live' && ' 🔴'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAssignments} tintColor="#6366f1" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No {activeTab} assignments</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 20, paddingBottom: 8 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#6366f1' },
  tabText: { color: '#64748b', fontWeight: '600', fontSize: 13 },
  activeTabText: { color: '#fff' },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  liveCard: { borderColor: '#ef4444', borderWidth: 1.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  streamBadge: { backgroundColor: 'rgba(99,102,241,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  liveBadge: { backgroundColor: 'rgba(239,68,68,0.2)' },
  streamText: { color: '#a5b4fc', fontSize: 12, fontWeight: '700' },
  marks: { color: '#64748b', fontSize: 12 },
  title: { color: '#e2e8f0', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  meta: { color: '#64748b', fontSize: 12, lineHeight: 20 },
  startBtn: { backgroundColor: '#6366f1', borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginTop: 12 },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#475569', fontSize: 14 },
});

export default AssignmentsScreen;
