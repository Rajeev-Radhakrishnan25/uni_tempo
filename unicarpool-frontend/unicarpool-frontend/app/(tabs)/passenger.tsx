import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRoleSwitch } from '@/src/hooks/useRoleSwitch';
import { rideService } from '@/src/services/ride';
import { Ride } from '@/src/types/ride';
import { passengerStyles as styles } from '@/src/styles/screens/passenger.styles';

interface RideRequest {
  id: number;
  rideId: number;
  message: string;
  riderId: string;
  riderName: string;
  riderPhoneNumber: string;
  driverId: string;
  driverName: string;
  driverPhoneNumber: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  departureLocation: string;
  destination: string;
  meetingPoint: string;
  departureDateTime: string;
}

export default function PassengerScreen() {
  const router = useRouter();
  const { currentRole } = useRoleSwitch();

  const [rides, setRides] = useState<Ride[]>([]);
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not a rider
  useEffect(() => {
    if (currentRole !== 'RIDER') {
      Alert.alert(
        'Access Denied',
        'Only riders can access this page. Please switch to rider mode.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [currentRole]);

  const fetchRides = useCallback(async () => {
    try {
      setError(null);
      const data = await rideService.getAllRides();
      setRides(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load rides');
      Alert.alert('Error', err.message || 'Failed to load rides');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchMyRequests = useCallback(async () => {
    try {
      const data = await rideService.getMyRequests();
      // API response now has complete data, use directly
      const mappedRequests: RideRequest[] = data.map((req) => ({
        id: req.id,
        rideId: req.ride_id,
        message: req.message,
        riderId: req.rider_id,
        riderName: req.rider_name,
        riderPhoneNumber: req.rider_phone_number,
        driverId: req.driver_id,
        driverName: req.driver_name,
        driverPhoneNumber: req.driver_phone_number,
        status: req.status,
        departureLocation: req.departure_location,
        destination: req.destination,
        meetingPoint: req.meeting_point,
        departureDateTime: req.departure_date_time,
      }));
      setRequests(mappedRequests);
    } catch (err: any) {
      console.error('Failed to load requests:', err);
      // Don't show alert for requests, just log it
    }
  }, []);

  useEffect(() => {
    if (currentRole === 'RIDER') {
      fetchRides();
      fetchMyRequests();
    }
  }, [currentRole, fetchRides, fetchMyRequests]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchRides(), fetchMyRequests()]).finally(() => {
      setRefreshing(false);
    });
  }, [fetchRides, fetchMyRequests]);

  const openRequestModal = (ride: Ride) => {
    // Check if already requested this ride
    const existingRequest = requests.find(
      (r) => r.rideId === ride.id && r.status !== 'DECLINED'
    );
    if (existingRequest) {
      Alert.alert(
        'Already Requested',
        `You have already requested this ride.\n\nRequest ID: #${existingRequest.id}\nDriver: ${existingRequest.driverName}\nStatus: ${existingRequest.status}`
      );
      return;
    }
    setSelectedRide(ride);
    setModalVisible(true);
  };

  const submitRequest = async () => {
    if (!selectedRide || submitting) return;

    try {
      setSubmitting(true);

      // Call API to submit ride request
      const response = await rideService.bookRide({
        ride_id: selectedRide.id,
        message: message.trim() || undefined,
      });

      // API response now has complete data
      Alert.alert(
        'Success! 🎉',
        `Your ride request has been sent to ${response.driver_name}.\n\nFrom: ${response.departure_location}\nTo: ${response.destination}\nStatus: ${response.status}`
      );
      setMessage('');
      setModalVisible(false);
      setSelectedRide(null);

      // Refresh both rides and requests
      fetchRides();
      fetchMyRequests();
    } catch (error: any) {
      console.error('Book ride error:', error);
      Alert.alert('Error', error.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelRequest = (requestId: number) => {
    Alert.alert('Cancel Request', 'Are you sure you want to cancel this ride request?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            // TODO: Call API to cancel request
            // await rideService.cancelRideRequest(requestId);

            // Remove from local state (or refetch)
            setRequests((prev) => prev.filter((r) => r.id !== requestId));
            Alert.alert('Cancelled', 'Ride request cancelled successfully');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to cancel request');
          }
        },
      },
    ]);
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
    const isRequested = requests.some((r) => r.rideId === item.id);

    return (
      <View style={styles.rideCard}>
        <View style={styles.rideHeader}>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>🚗 {item.driver_name}</Text>
            <Text style={styles.rideId}>Ride #{item.id}</Text>
          </View>
          <View style={styles.seatsbadge}>
            <Text style={styles.seatsText}>{item.available_seats} seats</Text>
          </View>
        </View>

        <View style={styles.routeContainer}>
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
          <View style={styles.detailChip}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>{date}</Text>
          </View>
          <View style={styles.detailChip}>
            <Text style={styles.detailIcon}>⏰</Text>
            <Text style={styles.detailText}>{time}</Text>
          </View>
          <View style={styles.detailChip}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText}>{item.meeting_point}</Text>
          </View>
        </View>

        {item.ride_conditions && (
          <View style={styles.detailChip}>
            <Text style={styles.detailIcon}>ℹ️</Text>
            <Text style={styles.detailText}>{item.ride_conditions}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.requestButton,
            (item.available_seats <= 0 || isRequested) && styles.requestButtonDisabled,
          ]}
          onPress={() => openRequestModal(item)}
          disabled={item.available_seats <= 0 || isRequested}
        >
          <Text style={styles.requestButtonText}>
            {isRequested ? 'Request Sent' : 'Request Ride'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRequestCard = ({ item }: { item: RideRequest }) => {
    const getStatusStyle = () => {
      switch (item.status) {
        case 'PENDING':
          return { badge: styles.statusPending, text: styles.statusTextPending };
        case 'ACCEPTED':
          return { badge: styles.statusConfirmed, text: styles.statusTextConfirmed };
        case 'DECLINED':
          return { badge: styles.statusDeclined, text: styles.statusTextDeclined };
      }
    };

    const statusStyle = getStatusStyle();
    
    const formatDateTime = (dateTimeString: string) => {
      const date = new Date(dateTimeString);
      return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.requestTitle}>
              {item.departureLocation} → {item.destination}
            </Text>
            <Text style={styles.rideId}>
              Request #{item.id} • {formatDateTime(item.departureDateTime)}
            </Text>
          </View>
          <View style={[styles.statusBadge, statusStyle.badge]}>
            <Text style={[styles.statusText, statusStyle.text]}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.requestDetail}>🚗 Driver: {item.driverName}</Text>
        <Text style={styles.requestDetail}>📞 Driver Phone: {item.driverPhoneNumber}</Text>
        <Text style={styles.requestDetail}>📍 Meeting Point: {item.meetingPoint}</Text>
        {item.message && (
          <Text style={styles.requestDetail}>💬 Your Message: {item.message}</Text>
        )}

        {item.status === 'PENDING' && (
          <View style={styles.requestActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => cancelRequest(item.id)}
            >
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                Cancel Request
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'ACCEPTED' && (
          <View style={styles.requestActions}>
            <View
              style={[
                styles.actionButton,
                { backgroundColor: '#E8F5E9', borderWidth: 0 },
              ]}
            >
              <Text style={[styles.actionButtonText, { color: '#2E7D32' }]}>
                ✓ Request Accepted
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (currentRole !== 'RIDER') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>🚫</Text>
        <Text style={styles.errorTitle}>Access Denied</Text>
        <Text style={styles.errorText}>Rider role required to view available rides</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>🔍</Text>
            <Text style={styles.title}>Find Rides</Text>
            <Text style={styles.subtitle}>Discover rides to your destination</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.loadingText}>Loading available rides...</Text>
        </View>
      </View>
    );
  }

  if (error && rides.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>🔍</Text>
            <Text style={styles.title}>Find Rides</Text>
            <Text style={styles.subtitle}>Discover rides to your destination</Text>
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
          <Text style={styles.headerIcon}>🔍</Text>
          <Text style={styles.title}>Find Rides</Text>
          <Text style={styles.subtitle}>Discover rides to your destination</Text>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0A84FF']}
            tintColor="#0A84FF"
          />
        }
      >
        <View style={styles.listContent}>
          <Text style={styles.sectionHeader}>Available Rides</Text>

          {rides.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🚗</Text>
              <Text style={styles.emptyTitle}>No Rides Available</Text>
              <Text style={styles.emptyText}>
                There are no rides available at the moment. Check back later!
              </Text>
            </View>
          ) : (
            <FlatList
              data={rides}
              renderItem={renderRideCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}

          {requests.length > 0 && (
            <View style={styles.requestsSection}>
              <Text style={styles.sectionHeader}>Your Ride Requests</Text>
              <FlatList
                data={requests}
                renderItem={renderRequestCard}
                keyExtractor={(item) => item.rideId.toString()}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Request Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Ride</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Message to Driver (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., I have a backpack, Can we meet at the main entrance?"
                placeholderTextColor="#999"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Text style={[styles.modalButtonText, styles.modalCancelText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalSubmitButton,
                  submitting && { opacity: 0.6 },
                ]}
                onPress={submitRequest}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={[styles.modalButtonText, styles.modalSubmitText]}>
                    Send Request
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
