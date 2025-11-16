import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useRoleSwitch } from '@/src/hooks/useRoleSwitch';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { currentRole } = useRoleSwitch();

  const isRider = currentRole === 'RIDER';
  const isDriver = currentRole === 'DRIVER';

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
      {/* Dashboard - Always visible */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      
      {/* Rider-only tab */}
      <Tabs.Screen
        name="passenger"
        options={{
          href: isRider ? undefined : null,
          title: 'Find Rides',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔍</Text>,
        }}
      />

      {/* Driver-only tabs */}
      <Tabs.Screen
        name="driver"
        options={{
          href: isDriver ? undefined : null,
          title: 'My Rides',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🚗</Text>,
        }}
      />

      <Tabs.Screen
        name="rideRequests"
        options={{
          href: isDriver ? undefined : null,
          title: 'Requests',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📬</Text>,
        }}
      />
      
      {/* Create Ride - Hidden from nav, accessible via button */}
      <Tabs.Screen
        name="createRide"
        options={{
          href: null,
          title: 'Create Ride',
        }}
      />

      {/* Profile - Always visible, last position */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />

      {/* Hidden tabs - not shown in navbar */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
          title: 'Explore',
        }}
      />

      <Tabs.Screen
        name="editProfile"
        options={{
          href: null,
          title: 'Edit Profile',
        }}
      />

      <Tabs.Screen
        name="changePassword"
        options={{
          href: null,
          title: 'Change Password',
        }}
      />

      <Tabs.Screen
        name="bookings"
         options={{
        href: null
         }}
      />
    </Tabs>
  );
}
