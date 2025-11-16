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
              await rideService.cancelRide(ride.id.toString());
              Alert.alert('Success', 'Ride cancelled successfully');
              fetchRides();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel ride');
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

    return (
      <View style={styles.rideCard}>
        <View style={styles.rideHeader}>
          <Text style={styles.rideId}>Ride #{item.id}</Text>
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

        <View style={styles.rideActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => handleViewRide(item)}
          >
            <Text style={[styles.actionButtonText, styles.viewButtonText]}>
              View Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => handleCancelRide(item)}
          >
            <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
              Cancel Ride
            </Text>
          </TouchableOpacity>
        </View>
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
