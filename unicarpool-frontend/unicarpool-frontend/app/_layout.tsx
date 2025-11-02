import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <Stack>
        {/* Splash screen */}
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />

        {/* Login screen */}
        <Stack.Screen
          name="Login"
          options={{ headerShown: false }}
        />

        {/* Register screen */}
        <Stack.Screen
          name="Register"
          options={{ headerShown: false }}
        />

        {/* Reset password screen */}
        <Stack.Screen
          name="ResetPassword"
          options={{ headerShown: false }}
        />

        {/* Main app after login */}
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        {/* Keep modal support */}
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'Modal' }}
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
