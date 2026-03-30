import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import mobileApiClient from '../../api/client';

interface Student {
  id: string;
  full_name: string;
  phone_number: string;
  exam_stream?: string;
  is_active: boolean;
}

const StudentsScreen: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await mobileApiClient.get('/admin/students');
      setStudents(data.students || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, []);

  const renderItem = ({ item }: { item: Student }) => (
    <View style={styles.studentCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.full_name?.[0] || '?'}</Text>
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.full_name || 'No name'}</Text>
        <Text style={styles.studentPhone}>📱 {item.phone_number}</Text>
        {item.exam_stream && (
          <View style={styles.streamBadge}>
            <Text style={styles.streamText}>{item.exam_stream}</Text>
          </View>
        )}
      </View>
      <View style={[styles.statusDot, { backgroundColor: item.is_active ? '#10b981' : '#ef4444' }]} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Students</Text>
        <Text style={styles.count}>{students.length} total</Text>
      </View>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStudents} tintColor="#6366f1" />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No students found</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: '#fff' },
  count: { color: '#64748b', fontSize: 13, marginTop: 2 },
  list: { padding: 16, gap: 10 },
  studentCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(99,102,241,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#a5b4fc', fontSize: 18, fontWeight: '800' },
  studentInfo: { flex: 1 },
  studentName: { color: '#e2e8f0', fontWeight: '700', fontSize: 15, marginBottom: 2 },
  studentPhone: { color: '#64748b', fontSize: 12, marginBottom: 4 },
  streamBadge: {
    backgroundColor: 'rgba(99,102,241,0.2)', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 12, alignSelf: 'flex-start',
  },
  streamText: { color: '#a5b4fc', fontSize: 11, fontWeight: '600' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#475569' },
});

export default StudentsScreen;
