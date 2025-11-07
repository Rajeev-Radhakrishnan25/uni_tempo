import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' }
        }}
      >
        {/* All screens will inherit headerShown: false from screenOptions */}
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="ResetPassword" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="modal"
          options={{ 
            presentation: 'modal',
            headerShown: true,
            title: 'Modal' 
          }}
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}