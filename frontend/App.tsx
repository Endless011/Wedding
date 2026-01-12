import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { DataProvider } from './src/context/DataContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { TabParamList } from './src/types';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import ProfileScreen from './src/screens/ProfileScreen'; // Changed from SettingsScreen
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

import { createStackNavigator } from '@react-navigation/stack';
import GroupDetailScreen from './src/screens/GroupDetailScreen';
import CategoryDetailScreen from './src/screens/CategoryDetailScreen';
import AdminUsersScreen from './src/screens/AdminUsersScreen'; // Admin Screen

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator<TabParamList>();

function HomeStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.rose,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Main"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GroupDetail"
        component={GroupDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CategoryDetail"
        component={CategoryDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'HomeStack':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Budget':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.rose,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          height: 70,
          position: 'absolute', // Floating
          bottom: 25,           // Lifted up
          left: 20,
          right: 20,
          borderRadius: 35,     // Rounded corners
          paddingBottom: 5,
          paddingTop: 5
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false, // Stack handles headers for Home
      })}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{
          title: 'Ana Sayfa',
        }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{
          title: 'İstatistik',
          headerShown: true,
          headerStyle: { backgroundColor: colors.rose },
          headerTintColor: '#fff',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          headerShown: false, // Profile has its own header design
        }}
      />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <TabNavigator />
    </>
  );
}

// Auth Navigator - Login ve Register arası geçiş
function AuthNavigator() {
  const [showLogin, setShowLogin] = useState(true);

  if (showLogin) {
    return <LoginScreen onNavigateToRegister={() => setShowLogin(false)} />;
  } else {
    return <RegisterScreen onNavigateToLogin={() => setShowLogin(true)} />;
  }
}

// Loading Screen
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#E8B4BC" />
    </View>
  );
}

// Guest Navigator
import GuestNavigator from './src/screens/GuestScreens';

const RootStack = createStackNavigator();

function MainStackWrapper() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="AppTabs" component={MainNavigator} />
      <RootStack.Screen
        name="Guest"
        component={GuestNavigator}
        options={{
          presentation: 'fullScreenModal',
          headerShown: false
        }}
      />
    </RootStack.Navigator>
  );
}

// Root Navigator - Auth durumuna göre yönlendirme
function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  // Admin Check
  // Note: user is already destructured from useAuth above.

  if (user?.role === 'admin') {
    return (
      <NavigationContainer>
        <AdminUsersScreen />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <MainStackWrapper />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <DataProvider>
              <RootNavigator />
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5E6E8',
  },
});
