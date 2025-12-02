import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useRoleSwitch } from '@/src/hooks/useRoleSwitch';
import { dashboardStyles as styles } from '@/src/styles/screens/dashboard.styles';
import { useState, useEffect, useCallback } from 'react';
import { bookingService } from '@/src/services/booking';

const SOS_PHONE_NUMBER = process.env.EXPO_PUBLIC_SOS_PHONE_NUMBER;

export default function DashboardScreen() {
  const { user } = useAuth();
  const { currentRole } = useRoleSwitch();
  const router = useRouter();
  const [sosTapCount, setSosTapCount] = useState(0);
  const [sosTapTimer, setSosTapTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [hasStartedRide, setHasStartedRide] = useState(false);

  const checkForStartedRides = useCallback(async () => {
    if (currentRole !== 'RIDER') {
      setHasStartedRide(false);
      return;
    }

    try {
      const response = await bookingService.getMyBookings();
      const hasStarted = response.current.some(
        (booking) => booking.status.toUpperCase() === 'STARTED'
      );
      setHasStartedRide(hasStarted);
    } catch (error) {
      console.error('Error checking for started rides:', error);
      setHasStartedRide(false);
    }
  }, [currentRole]);

  useEffect(() => {
    checkForStartedRides();
    const interval = setInterval(checkForStartedRides, 30000);
    return () => clearInterval(interval);
  }, [checkForStartedRides]);

  const handleSOSTap = () => {
    const newCount = sosTapCount + 1;
    setSosTapCount(newCount);

    if (sosTapTimer) {
      clearTimeout(sosTapTimer);
    }

    if (newCount === 3) {
      triggerSOS();
      setSosTapCount(0);
      setSosTapTimer(null);
    } else {
      const timer = setTimeout(() => {
        setSosTapCount(0);
        setSosTapTimer(null);
      }, 1000);
      setSosTapTimer(timer);
    }
  };

  const triggerSOS = async () => {
    try {
      const phoneUrl = `tel:${SOS_PHONE_NUMBER}`;
      
      const canCall = await Linking.canOpenURL(phoneUrl);
      
      if (canCall) {
        Alert.alert(
          '🚨 Emergency SOS',
          `Calling campus security at ${SOS_PHONE_NUMBER}.\n\nYour location and ride details will be shared.\n\nStay safe!`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Call Now',
              style: 'destructive',
              onPress: async () => {
                try {
                  await Linking.openURL(phoneUrl);
                  // TODO: Send SOS alert to backend with location and ride details
                  console.log('SOS call initiated to:', SOS_PHONE_NUMBER);
                } catch (error) {
                  console.error('Error making call:', error);
                  Alert.alert('Error', 'Failed to initiate call. Please dial manually: ' + SOS_PHONE_NUMBER);
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          '🚨 Emergency Contact',
          `Please call campus security:\n\n${SOS_PHONE_NUMBER}`,
          [
            {
              text: 'Copy Number',
              onPress: () => {
                // TODO: Implement clipboard copy
                console.log('Copy number:', SOS_PHONE_NUMBER);
              },
            },
            { text: 'OK' },
          ]
        );
      }
    } catch (error) {
      console.error('Error triggering SOS:', error);
      Alert.alert(
        'Emergency Contact',
        `Please call campus security at:\n${SOS_PHONE_NUMBER}`
      );
    }
  };

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

      {/* SOS Button - Only show for riders with started rides */}
      {currentRole === 'RIDER' && hasStartedRide && (
        <View style={sosStyles.sosContainer}>
          <TouchableOpacity
            style={sosStyles.sosButton}
            onPress={handleSOSTap}
            activeOpacity={0.7}
          >
            <Text style={sosStyles.sosIcon}>🚨</Text>
            <Text style={sosStyles.sosText}>SOS</Text>
            <Text style={sosStyles.sosSubtext}>
              {sosTapCount > 0 
                ? `Tap ${3 - sosTapCount} more time${3 - sosTapCount > 1 ? 's' : ''}` 
                : 'Triple tap for emergency'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

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

              <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/cabbooking')}
              >
                  <Text style={styles.actionIcon}>🚕</Text>
                <Text style={styles.actionTitle}>Cab Booking</Text>
                <Text style={styles.actionDescription}>
                Book a cab instantly!
                </Text>
              </TouchableOpacity>
            </>
          )}
          
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



const sosStyles = StyleSheet.create({
  sosContainer: {
    backgroundColor: '#FF3B30',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  sosButton: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    minWidth: 220,
  },
  sosIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  sosText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
    letterSpacing: 2,
  },
  sosSubtext: {
    fontSize: 13,
    color: 'white',
    opacity: 0.95,
    textAlign: 'center',
    fontWeight: '500',
  },
});
