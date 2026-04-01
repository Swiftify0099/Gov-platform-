import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { LoginScreen } from '../screens/auth/LoginScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import { DashboardScreen } from '../screens/student/DashboardScreen';
import ExamScreen from '../screens/student/ExamScreen';
import ResultsScreen from '../screens/student/ResultsScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('access_token');
      const role = await AsyncStorage.getItem('user_role');
      if (token) {
        if (role === 'super_admin' || role === 'institute_admin') setInitialRoute('AdminDashboard');
        else setInitialRoute('StudentDashboard');
      } else {
        setInitialRoute('Login');
      }
    };
    checkAuth();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: '#1e293b' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#0f172a' },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OTP" component={OTPScreen} options={{ title: 'Verify OTP' }} />
        <Stack.Screen name="StudentDashboard" component={DashboardScreen} options={{ title: 'Dashboard', headerLeft: () => null }} />
        <Stack.Screen name="Exam" component={ExamScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Results' }} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin Panel', headerLeft: () => null }} />
        <Stack.Screen name="SuperAdminDashboard" component={AdminDashboardScreen} options={{ title: 'Super Admin', headerLeft: () => null }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
