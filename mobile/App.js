import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import StudentRegisterScreen from './screens/StudentRegisterScreen';
import ManagerRegisterScreen from './screens/ManagerRegisterScreen';
import StudentDashboard from './screens/StudentDashboard';
import ManagerDashboard from './screens/ManagerDashboard';
import MenuEditorScreen from './screens/MenuEditorScreen';
import MessTimingsScreen from './screens/MessTimingsScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: false,
  animation: 'slide_from_right',
};

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="StudentRegister" component={StudentRegisterScreen} />
      <Stack.Screen name="ManagerRegister" component={ManagerRegisterScreen} />
    </Stack.Navigator>
  );
}

function StudentStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
    </Stack.Navigator>
  );
}

function ManagerStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ManagerDashboard" component={ManagerDashboard} />
      <Stack.Screen name="MenuEditor" component={MenuEditorScreen} />
      <Stack.Screen name="MessTimings" component={MessTimingsScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  // Explicit boolean check for loading state
  if (loading === true) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  // Explicit null/undefined check for user
  const isLoggedIn = user !== null && user !== undefined;
  const isStudent = isLoggedIn && user.role === 'student';
  const isManager = isLoggedIn && user.role === 'manager';

  return (
    <NavigationContainer>
      {isLoggedIn === false ? (
        <AuthStack />
      ) : isStudent === true ? (
        <StudentStack />
      ) : isManager === true ? (
        <ManagerStack />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <RootNavigator />
        <Toast />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
});
