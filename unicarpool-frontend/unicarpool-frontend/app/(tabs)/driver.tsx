import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRoleSwitch } from '@/src/hooks/useRoleSwitch';
import { rideService } from '@/src/services/ride';
import { Ride } from '@/src/types/ride';
import { driverRidesStyles as styles } from '@/src/styles/screens/driverRides.styles';

export default function DriverRidesScreen() {
  const router = useRouter();
  const { currentRole } = useRoleSwitch();

  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingRideId, setProcessingRideId] = useState<number | null>(null);

  // Redirect if not a driver
  useEffect(() => {
    if (currentRole !== 'DRIVER') {
      Alert.alert(
        "Access Denied",
        "Only drivers can access this page. Please switch to driver mode.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    }
  }, [currentRole]);

  const fetchRides = useCallback(async () => {
    try {
      setError(null);
      const data = await rideService.getDriverRides();
      console.log('Fetched driver rides:', data);
      console.log('First ride status:', data[0]?.status);
      setRides(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load rides');
      Alert.alert('Error', err.message || 'Failed to load rides');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (currentRole === 'DRIVER') {
      fetchRides();
    }
  }, [currentRole, fetchRides]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRides();
  }, [fetchRides]);

  const handleCreateRide = () => {
    router.push('/(tabs)/createRide');
  };

  const handleViewRide = (ride: Ride) => {
    // TODO: Navigate to ride details page
    Alert.alert(
      'Ride Details',
      `Ride #${ride.id}\nFrom: ${ride.departure_location}\nTo: ${ride.destination}`,
      [{ text: 'OK' }]
    );
  };

  const handleStartRide = (ride: Ride) => {
    Alert.alert(
      'Start Ride',
      `Start the ride from ${ride.departure_location} to ${ride.destination}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            try {
              setProcessingRideId(ride.id);
              const response = await rideService.startRide(ride.id);
              Alert.alert('Success! 🚀', response.message || 'Ride started successfully');
              fetchRides();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to start ride');
            } finally {
              setProcessingRideId(null);
            }
          },
        },
      ]
    );
  };

  const handleCompleteRide = (ride: Ride) => {
    Alert.alert(
      'Complete Ride',
      `Mark this ride as completed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              setProcessingRideId(ride.id);
              const response = await rideService.completeRide(ride.id);
              Alert.alert('Success! ✅', response.message || 'Ride completed successfully');
              fetchRides();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to complete ride');
            } finally {
              setProcessingRideId(null);
            }
          },
        },
      ]
    );
  };

  const handleCancelRide = (ride: Ride) => {
    Alert.alert(
      'Cancel Ride',
      `Are you sure you want to cancel this ride from ${ride.departure_location} to ${ride.destination}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingRideId(ride.id);
              const response = await rideService.cancelRideByDriver(ride.id);
              Alert.alert('Success', response.message || 'Ride cancelled successfully');
              fetchRides();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel ride');
            } finally {
              setProcessingRideId(null);
            }
          },
        },
      ]
    );
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return { date: dateStr, time: timeStr };
  };

  const renderRideCard = ({ item }: { item: Ride }) => {
    const { date, time } = formatDateTime(item.departure_date_time);
    const isProcessing = processingRideId === item.id;
    const rideStatus = item.status || 'Waiting';

    const getStatusStyle = () => {
      switch (rideStatus) {
        case 'Waiting':
        case 'ACTIVE':
          return { badge: styles.statusWaiting, text: styles.statusTextWaiting };
        case 'Started':
        case 'STARTED':
          return { badge: styles.statusStarted, text: styles.statusTextStarted };
        case 'Completed':
        case 'COMPLETED':
          return { badge: styles.statusCompleted, text: styles.statusTextCompleted };
        case 'CANCELLED':
          return { badge: styles.statusCancelled, text: styles.statusTextCancelled };
        default:
          return { badge: styles.statusWaiting, text: styles.statusTextWaiting };
      }
    };

    const statusStyle = getStatusStyle();

    return (
      <View style={styles.rideCard}>
        <View style={styles.rideHeader}>
          <Text style={styles.rideId}>Ride #{item.id}</Text>
          <View style={[styles.statusBadge, statusStyle.badge]}>
            <Text style={[styles.statusText, statusStyle.text]}>{rideStatus}</Text>
          </View>
        </View>

        <View style={styles.rideRoute}>
          <View style={styles.routeRow}>
            <Text style={styles.routeIcon}>📍</Text>
            <Text style={styles.routeText}>{item.departure_location}</Text>
          </View>
          <View style={styles.routeDivider} />
          <View style={styles.routeRow}>
            <Text style={styles.routeIcon}>🎯</Text>
            <Text style={styles.routeText}>{item.destination}</Text>
          </View>
        </View>

        <View style={styles.rideDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>{date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>⏰</Text>
            <Text style={styles.detailText}>{time}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>🪑</Text>
            <Text style={styles.detailText}>{item.available_seats} seats</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText}>{item.meeting_point}</Text>
          </View>
        </View>

        {item.ride_conditions && (
          <View style={styles.rideConditions}>
            <Text style={styles.conditionsLabel}>Ride Conditions</Text>
            <Text style={styles.conditionsText}>{item.ride_conditions}</Text>
          </View>
        )}

        {/* Show Complete button only for Started rides */}
        {(rideStatus === 'Started' || rideStatus === 'STARTED') && (
          <View style={styles.rideActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleCompleteRide(item)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={[styles.actionButtonText, styles.completeButtonText]}>
                  ✅ Complete Ride
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Show read-only status for Completed/Cancelled rides */}
        {(rideStatus === 'Completed' || rideStatus === 'COMPLETED' || rideStatus === 'CANCELLED') && (
          <View style={styles.rideActions}>
            <View style={[styles.actionButton, { backgroundColor: '#F0F0F0', borderWidth: 0 }]}>
              <Text style={[styles.actionButtonText, { color: '#666' }]}>
                {rideStatus === 'Completed' || rideStatus === 'COMPLETED' ? '✓ Ride Completed' : '✗ Ride Cancelled'}
              </Text>
            </View>
          </View>
        )}

        {/* Show Start and Cancel buttons for Waiting/Active rides */}
        {rideStatus !== 'Started' && rideStatus !== 'STARTED' && 
         rideStatus !== 'Completed' && rideStatus !== 'COMPLETED' && 
         rideStatus !== 'CANCELLED' && (
          <View style={styles.rideActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={() => handleStartRide(item)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={[styles.actionButtonText, styles.startButtonText]}>
                  🚀 Start Ride
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelRide(item)}
              disabled={isProcessing}
            >
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Don't render if not a driver
  if (currentRole !== 'DRIVER') {
    return (
      <View style={styles.accessDeniedContainer}>
        <Text style={styles.accessDeniedIcon}>🚫</Text>
        <Text style={styles.accessDeniedText}>Access Denied</Text>
        <Text style={styles.accessDeniedSubtext}>
          Driver role required to view rides
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>🚗</Text>
            <Text style={styles.title}>My Rides</Text>
            <Text style={styles.subtitle}>Manage your active ride offers</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.loadingText}>Loading your rides...</Text>
        </View>
      </View>
    );
  }

  if (error && rides.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>🚗</Text>
            <Text style={styles.title}>My Rides</Text>
            <Text style={styles.subtitle}>Manage your active ride offers</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Failed to Load Rides</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRides}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>🚗</Text>
          <Text style={styles.title}>My Rides</Text>
          <Text style={styles.subtitle}>Manage your active ride offers</Text>
        </View>
      </View>

      <View style={styles.createButtonContainer}>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateRide}>
          <Text style={styles.createButtonIcon}>➕</Text>
          <Text style={styles.createButtonText}>Create New Ride</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={rides}
        renderItem={renderRideCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0A84FF']}
            tintColor="#0A84FF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyTitle}>No Active Rides</Text>
            <Text style={styles.emptyText}>
              You haven't created any rides yet. Start by creating your first ride offer!
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleCreateRide}>
              <Text style={styles.emptyButtonText}>Create Your First Ride</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
