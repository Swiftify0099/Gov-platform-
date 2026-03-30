import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, Image, Alert, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import mobileApiClient from '../../api/client';
import { useNavigation } from '@react-navigation/native';

const EXAM_STREAMS = [
  'MPSC', 'UPSC', 'Group B', 'Group C', 'Group D', 'All India Services',
];
const LANGUAGES = [
  { value: 'en', label: '🇺🇸 English' },
  { value: 'mr', label: '🇮🇳 मराठी' },
  { value: 'hi', label: '🇮🇳 हिंदी' },
];

const ProfileSetupScreen: React.FC = () => {
  const navigation = useNavigation();
  const [form, setForm] = useState({ full_name: '', email: '', exam_stream: '', preferred_language: 'en' });
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPhoto(asset.uri);
      setPhotoFile({ uri: asset.uri, name: 'profile.jpg', type: 'image/jpeg' });
    }
  };

  const handleSave = async () => {
    if (!photo) return Alert.alert('Photo required', 'Please upload a profile photo');
    if (!form.full_name.trim()) return Alert.alert('Required', 'Full name is required');
    if (!form.exam_stream) return Alert.alert('Required', 'Please select an exam stream');

    setLoading(true);
    try {
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile as unknown);
        await mobileApiClient.post('/uploads/profile-photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      await mobileApiClient.put('/users/me', null, { params: form });
      Alert.alert('Success', 'Profile saved!');
    } catch {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Profile Setup</Text>
        <Text style={styles.subtitle}>Complete your profile to access exams</Text>

        {/* Photo */}
        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photoImage} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>📷</Text>
              <Text style={styles.photoHint}>Tap to upload photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Full Name *</Text>
          <View style={styles.input}>
            {/* TextInput would go here in full implementation */}
          </View>
        </View>

        {/* Streams */}
        <View style={styles.field}>
          <Text style={styles.label}>Exam Stream *</Text>
          <View style={styles.grid}>
            {EXAM_STREAMS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, form.exam_stream === s && styles.chipActive]}
                onPress={() => setForm((p) => ({ ...p, exam_stream: s }))}
              >
                <Text style={[styles.chipText, form.exam_stream === s && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Language */}
        <View style={styles.field}>
          <Text style={styles.label}>Language</Text>
          <View style={styles.row}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.value}
                style={[styles.chipFull, form.preferred_language === lang.value && styles.chipActive]}
                onPress={() => setForm((p) => ({ ...p, preferred_language: lang.value }))}
              >
                <Text style={[styles.chipText, form.preferred_language === lang.value && styles.chipTextActive]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save Profile →</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { padding: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 6 },
  subtitle: { color: '#64748b', marginBottom: 28 },
  photoButton: { alignItems: 'center', marginBottom: 28 },
  photoImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#6366f1' },
  photoPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#1e293b', borderWidth: 2, borderColor: '#334155',
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
  },
  photoPlaceholderText: { fontSize: 28, marginBottom: 4 },
  photoHint: { color: '#64748b', fontSize: 11 },
  field: { marginBottom: 20 },
  label: { color: '#94a3b8', fontWeight: '600', fontSize: 13, marginBottom: 8 },
  input: { height: 48, backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155',
  },
  chipFull: {
    flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
    backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155',
  },
  chipActive: { backgroundColor: 'rgba(99,102,241,0.2)', borderColor: '#6366f1' },
  chipText: { color: '#64748b', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#a5b4fc' },
  saveBtn: {
    backgroundColor: '#6366f1', borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: '#6366f1', shadowOpacity: 0.4, shadowRadius: 20, elevation: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default ProfileSetupScreen;
