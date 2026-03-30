import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { View, Text } from 'react-native';
import { RootState } from '../store';

// Student screens
import DashboardScreen from '../screens/student/DashboardScreen';
import AssignmentsScreen from '../screens/student/AssignmentsScreen';
import ExamScreen from '../screens/student/ExamScreen';
import ResultsScreen from '../screens/student/ResultsScreen';
import ProfileSetupScreen from '../screens/student/ProfileSetupScreen';

// Admin screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import StudentsScreen from '../screens/admin/StudentsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <Text style={{ fontSize: focused ? 22 : 18, opacity: focused ? 1 : 0.5 }}>{name}</Text>
);

const StudentTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#1e293b',
        borderTopColor: '#334155',
        paddingBottom: 4,
        height: 60,
      },
      tabBarActiveTintColor: '#6366f1',
      tabBarInactiveTintColor: '#64748b',
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{ tabBarLabel: 'Home', tabBarIcon: ({ focused }) => <TabIcon name="🏠" focused={focused} /> }}
    />
    <Tab.Screen
      name="Assignments"
      component={AssignmentsScreen}
      options={{ tabBarLabel: 'Exams', tabBarIcon: ({ focused }) => <TabIcon name="📝" focused={focused} /> }}
    />
    <Tab.Screen
      name="Results"
      component={ResultsScreen}
      options={{ tabBarLabel: 'Results', tabBarIcon: ({ focused }) => <TabIcon name="📊" focused={focused} /> }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileSetupScreen}
      options={{ tabBarLabel: 'Profile', tabBarIcon: ({ focused }) => <TabIcon name="👤" focused={focused} /> }}
    />
  </Tab.Navigator>
);

const AdminTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#1e293b',
        borderTopColor: '#334155',
        height: 60,
      },
      tabBarActiveTintColor: '#6366f1',
      tabBarInactiveTintColor: '#64748b',
    }}
  >
    <Tab.Screen
      name="AdminDashboard"
      component={AdminDashboardScreen}
      options={{ tabBarLabel: 'Dashboard', tabBarIcon: ({ focused }) => <TabIcon name="📊" focused={focused} /> }}
    />
    <Tab.Screen
      name="Students"
      component={StudentsScreen}
      options={{ tabBarLabel: 'Students', tabBarIcon: ({ focused }) => <TabIcon name="👥" focused={focused} /> }}
    />
  </Tab.Navigator>
);

export const MainNavigator: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user?.role === 'institute_admin' || user?.role === 'super_admin' ? (
        <Stack.Screen name="AdminTabs" component={AdminTabs} />
      ) : (
        <>
          <Stack.Screen name="StudentTabs" component={StudentTabs} />
          <Stack.Screen name="Exam" component={ExamScreen} options={{ animation: 'slide_from_bottom' }} />
        </>
      )}
    </Stack.Navigator>
  );
};
