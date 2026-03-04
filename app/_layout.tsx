import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* index refers to app/index.tsx (Login) */}
      <Stack.Screen name="IndexPage" /> 
      
      {/* (tabs) refers to the app/(tabs) folder */}
      <Stack.Screen name="(tabs)" /> 
    </Stack>
  );
}