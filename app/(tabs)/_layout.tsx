import { Tabs } from 'expo-router';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF', // Professional Blue
        tabBarInactiveTintColor: '#8E8E93', // Muted Grey
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F2F2F2',
          height: Platform.OS === 'ios' ? 88 : 65, // Adjust for OS height
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          elevation: 0, // Remove shadow on Android for clean look
          shadowOpacity: 0, // Remove shadow on iOS
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      
      <Tabs.Screen
        name="HomePage"
        options={{
          title: 'Accounts',
          tabBarIcon: ({ color, focused }) => (
            <Feather 
              name='shield' // Changed to shield - feels more like "Security"
              size={22} 
              color={color} 
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Settings', // Often called settings in authenticators
          tabBarIcon: ({ color }) => (
            <Feather name='settings' size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}