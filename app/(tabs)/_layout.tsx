import HomePage from '@/app/(tabs)/HomePage';
import { Tabs } from 'expo-router';
import React from 'react';
import {Feather} from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false
      }}>
      <Tabs.Screen
        name="HomePage"
        options={{
          title: 'Home',
          tabBarIcon:() => (
            <Feather name='home' size={20}/>
          )
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon:() => (
            <Feather name='user' size={20}/>
          ),
        }}
      />
    </Tabs>
  );
}
