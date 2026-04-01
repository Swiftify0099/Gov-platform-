import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const DashboardScreen: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [liveAssignments, setLiveAssignments] = useState<any[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      const [userRes, liveRes, upcomingRes] = await Promise.all([
        axios.get(`${API_URL}/api/users/me`, { headers }),
        axios.get(`${API_URL}/api/assignments/live`, { headers }),
        axios.get(`${API_URL}/api/assignments/upcoming`, { headers }),
      ]);
      setUser(userRes.data);
      setLiveAssignments(liveRes.data);
      setUpcomingAssignments(upcomingRes.data);
    } catch (e) {}
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor="#3b82f6" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'Student'} 👋</Text>
            <Text style={styles.subGreeting}>Ready to practice?</Text>
          </View>
          <View style={styles.headerRight}>
            {user?.profile_photo_url ? (
              <Image source={{ uri: `${API_URL}${user.profile_photo_url}` }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ color: 'white', fontWeight: '700' }}>
                  {user?.name?.charAt(0) || 'S'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Live Exams */}
        {liveAssignments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.liveDot} />
              <Text style={styles.sectionTitle}>Live Now</Text>
            </View>
            {liveAssignments.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={styles.liveCard}
                onPress={() => navigation.navigate('Exam', { assignmentId: a.id })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.assignmentTitle}>{a.title}</Text>
                  <Text style={styles.assignmentMeta}>
                    {a.duration_minutes}m • {a.total_marks} marks
                  </Text>
                </View>
                <View style={styles.startButton}>
                  <Text style={styles.startButtonText}>START →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Upcoming */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          {upcomingAssignments.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No upcoming assignments</Text>
            </View>
          ) : (
            upcomingAssignments.map((a) => (
              <View key={a.id} style={styles.upcomingCard}>
                <Text style={styles.assignmentTitle}>{a.title}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.assignmentMeta}>{a.duration_minutes}m</Text>
                  <Text style={styles.assignmentMeta}>{a.total_marks} marks</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{a.status}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20, paddingTop: 16,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: '#ffffff' },
  subGreeting: { fontSize: 14, color: '#94a3b8', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff', marginBottom: 10 },
  liveCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#ef4444',
    marginBottom: 10,
  },
  assignmentTitle: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  assignmentMeta: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
  startButton: {
    backgroundColor: '#ef4444',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
  },
  startButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
  upcomingCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#334155',
    marginBottom: 10,
  },
  metaRow: { flexDirection: 'row', gap: 10, marginTop: 6, alignItems: 'center' },
  statusBadge: {
    backgroundColor: '#1e40af', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  statusText: { color: '#93c5fd', fontSize: 11, fontWeight: '600' },
  emptyCard: {
    backgroundColor: '#1e293b', borderRadius: 16,
    padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: '#334155',
  },
  emptyText: { color: '#64748b', fontSize: 14 },
  logoutBtn: { margin: 20, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  logoutText: { color: '#ef4444', fontWeight: '600' },
});

export default DashboardScreen;
