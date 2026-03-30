import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || '[localhost](http://localhost:8000)';

const DEFAULT_LOGINS = [
  { label: 'Super Admin', phone: '9000000000', otp: '123456', color: '#ef4444' },
  { label: 'Institute Admin', phone: '9000000001', otp: '123456', color: '#3b82f6' },
  { label: 'Student', phone: '9876543210', otp: '123456', color: '#10b981' },
];

export const LoginScreen: React.FC = () => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const navigation = useNavigation<any>();

  const handleSendOTP = async (phoneNum?: string) => {
    const target = phoneNum || phone;
    if (!target || target.length !== 10) {
      Alert.alert('Error', 'Enter a valid 10-digit number');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/send-otp`, { phone: target });
      setPhone(target);
      setDevOtp(res.data.dev_otp || '');
      setStep('otp');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otpStr?: string) => {
    const target = otpStr || otp;
    if (target.length !== 6) { Alert.alert('Error', 'Enter 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, { phone, otp: target });
      await AsyncStorage.setItem('access_token', res.data.access_token);
      await AsyncStorage.setItem('refresh_token', res.data.refresh_token);
      await AsyncStorage.setItem('user_role', res.data.role);

      const role = res.data.role;
      if (role === 'super_admin') navigation.replace('SuperAdminDashboard');
      else if (role === 'institute_admin') navigation.replace('AdminDashboard');
      else navigation.replace('StudentDashboard');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (cred: typeof DEFAULT_LOGINS[0]) => {
    setPhone(cred.phone);
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/send-otp`, { phone: cred.phone });
      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, { phone: cred.phone, otp: cred.otp });
      await AsyncStorage.setItem('access_token', res.data.access_token);
      await AsyncStorage.setItem('refresh_token', res.data.refresh_token);
      const role = res.data.role;
      if (role === 'super_admin') navigation.replace('SuperAdminDashboard');
      else if (role === 'institute_admin') navigation.replace('AdminDashboard');
      else navigation.replace('StudentDashboard');
    } catch (e: any) {
      Alert.alert('Error', 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>📚</Text>
            </View>
            <Text style={styles.title}>ExamPrep</Text>
            <Text style={styles.subtitle}>Government Exam Platform</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {step === 'phone' ? 'Welcome Back' : 'Verify OTP'}
            </Text>
            <Text style={styles.cardSubtitle}>
              {step === 'phone' ? 'Enter your mobile number' : `OTP sent to +91 ${phone}`}
            </Text>

            {step === 'phone' ? (
              <View>
                <View style={styles.phoneRow}>
                  <View style={styles.countryCode}>
                    <Text style={styles.countryCodeText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="9000000000"
                    placeholderTextColor="#64748b"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={() => handleSendOTP()}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Sending...' : 'Send OTP'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {devOtp ? (
                  <View style={styles.devBox}>
                    <Text style={styles.devText}>Dev OTP: {devOtp}</Text>
                  </View>
                ) : null}
                <TextInput
                  style={[styles.input, { textAlign: 'center', letterSpacing: 8, fontSize: 20 }]}
                  placeholder="• • • • • •"
                  placeholderTextColor="#64748b"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={() => handleVerifyOTP()}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setStep('phone')} style={{ marginTop: 12 }}>
                  <Text style={styles.linkText}>← Change Number</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Quick Login */}
          <View style={styles.quickLoginSection}>
            <Text style={styles.quickLoginTitle}>⚡ Quick Login (Dev)</Text>
            <View style={styles.quickLoginRow}>
              {DEFAULT_LOGINS.map((cred) => (
                <TouchableOpacity
                  key={cred.label}
                  style={[styles.quickButton, { backgroundColor: cred.color }]}
                  onPress={() => quickLogin(cred)}
                  disabled={loading}
                >
                  <Text style={styles.quickButtonText}>{cred.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.quickOtpText}>Default OTP: 123456</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { flexGrow: 1, padding: 20 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 32 },
  logoBox: {
    width: 64, height: 64,
    backgroundColor: '#1e40af',
    borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: { fontSize: 28 },
  title: { fontSize: 28, fontWeight: '800', color: '#ffffff' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1, borderColor: '#334155',
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 20 },
  phoneRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  countryCode: {
    backgroundColor: '#334155', borderRadius: 12,
    paddingHorizontal: 14, justifyContent: 'center',
    borderWidth: 1, borderColor: '#475569',
  },
  countryCodeText: { color: '#cbd5e1', fontWeight: '600' },
  input: {
    flex: 1, backgroundColor: '#334155',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    color: '#ffffff', fontSize: 16,
    borderWidth: 1, borderColor: '#475569',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginBottom: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  linkText: { color: '#94a3b8', textAlign: 'center', fontSize: 14, paddingVertical: 8 },
  devBox: {
    backgroundColor: '#fef3c7', borderRadius: 8,
    padding: 10, marginBottom: 12, alignItems: 'center',
  },
  devText: { color: '#92400e', fontWeight: '600', fontSize: 13 },
  quickLoginSection: { marginTop: 28 },
  quickLoginTitle: { color: '#64748b', fontSize: 12, textAlign: 'center', marginBottom: 12 },
  quickLoginRow: { flexDirection: 'row', gap: 8 },
  quickButton: {
    flex: 1, paddingVertical: 12,
    borderRadius: 12, alignItems: 'center',
  },
  quickButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
  quickOtpText: { color: '#475569', fontSize: 11, textAlign: 'center', marginTop: 8 },
});

export default LoginScreen;
