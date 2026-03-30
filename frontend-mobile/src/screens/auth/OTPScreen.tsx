import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { OTPInput } from '../../components/OTPInput';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import mobileApiClient from '../../api/client';
import { setCredentials } from '../../store/authSlice';
import * as SecureStore from 'expo-secure-store';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTP'>;

const OTPScreen: React.FC<Props> = ({ route, navigation }) => {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await mobileApiClient.post('/auth/verify-otp', {
        phone_number: phone,
        otp,
      });
      await SecureStore.setItemAsync('access_token', data.access_token);
      await SecureStore.setItemAsync('refresh_token', data.refresh_token);
      dispatch(setCredentials({ token: data.access_token, user: data.user }));
    } catch {
      setError('Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await mobileApiClient.post('/auth/send-otp', { phone_number: phone });
      Alert.alert('OTP Sent', `OTP sent to +91 ${phone}`);
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            OTP sent to{' '}
            <Text style={styles.phone}>+91 {phone}</Text>
          </Text>

          <View style={styles.otpWrapper}>
            <OTPInput value={otp} onChange={setOtp} disabled={loading} />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, otp.length !== 6 && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={otp.length !== 6 || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResend} style={styles.resendBtn}>
            <Text style={styles.resendText}>Resend OTP</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>Default OTP for demo: 123456</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { flexGrow: 1, padding: 24 },
  back: { marginBottom: 32 },
  backText: { color: '#6366f1', fontSize: 15, fontWeight: '600' },
  content: { alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 },
  subtitle: { color: '#94a3b8', fontSize: 15, textAlign: 'center', marginBottom: 40 },
  phone: { color: '#6366f1', fontWeight: '700' },
  otpWrapper: { marginBottom: 24, width: '100%' },
  error: { color: '#ef4444', fontSize: 13, marginBottom: 16, textAlign: 'center' },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resendBtn: { marginTop: 16 },
  resendText: { color: '#6366f1', fontWeight: '600' },
  hint: { color: '#475569', fontSize: 12, marginTop: 24 },
});

export default OTPScreen;
