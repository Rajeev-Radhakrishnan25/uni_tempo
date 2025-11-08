import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useRoleSwitch } from '@/src/hooks/useRoleSwitch';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { currentRole } = useRoleSwitch();

  return (
    <Tabs
      key={currentRole}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopWidth: 1,
          borderTopColor: Colors[colorScheme ?? 'light'].tabIconDefault + '20',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: currentRole === 'RIDER' ? 'Find Rides' : 'Create Ride',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>
            {currentRole === 'RIDER' ? '🔍' : '🚗'}
          </Text>,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />

      <Tabs.Screen
        name="editProfile"
        options={{
          href: null,
          title: 'Edit Profile',
        }}
      />
    </Tabs>
  );
}
