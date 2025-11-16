import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useRoleSwitch } from '@/src/hooks/useRoleSwitch';
import { dashboardStyles as styles } from '@/src/styles/screens/dashboard.styles';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { currentRole } = useRoleSwitch();
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Good day! 👋</Text>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>
            {currentRole.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionsGrid}>
          {currentRole === 'DRIVER' ? (
            <>
              <TouchableOpacity 
                style={[styles.actionCard, styles.primaryCard]}
                onPress={() => router.push('/(tabs)/createRide')}
              >
                <Text style={styles.actionIcon}>🚗</Text>
                <Text style={[styles.actionTitle, styles.primaryText]}>Create Ride</Text>
                <Text style={[styles.actionDescription, styles.primaryTextSecondary]}>
                  Offer a new ride
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => router.push('/(tabs)/driver')}
              >
                <Text style={styles.actionIcon}>📋</Text>
                <Text style={styles.actionTitle}>My Rides</Text>
                <Text style={styles.actionDescription}>
                  Manage your rides
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.actionCard, styles.primaryCard]}
                onPress={() => router.push('/(tabs)/passenger')}
              >
                <Text style={styles.actionIcon}>🔍</Text>
                <Text style={[styles.actionTitle, styles.primaryText]}>Find Rides</Text>
                <Text style={[styles.actionDescription, styles.primaryTextSecondary]}>
                  Search available rides
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => router.push('/(tabs)/bookings')}
              >
                <Text style={styles.actionIcon}>📱</Text>
                <Text style={styles.actionTitle}>My Bookings</Text>
                <Text style={styles.actionDescription}>
                  View booked rides
                </Text>
              </TouchableOpacity>
            </>
          )}
          
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionTitle}>History</Text>
            <Text style={styles.actionDescription}>
              Past rides & activity
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionTitle}>Settings</Text>
            <Text style={styles.actionDescription}>
              Account & preferences
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your {currentRole === 'DRIVER' ? 'Driver' : 'Rider'} Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>
                {currentRole === 'DRIVER' ? 'Rides Offered' : 'Rides Taken'}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>
                {currentRole === 'DRIVER' ? 'Passengers' : 'This Month'}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>5.0</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}


