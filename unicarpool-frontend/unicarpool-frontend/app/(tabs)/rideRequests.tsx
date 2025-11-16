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
import { DriverRideRequest } from '@/src/types/ride';
import { rideRequestsStyles as styles } from '@/src/styles/screens/rideRequests.styles';

export default function RideRequestsScreen() {
  const router = useRouter();
  const { currentRole } = useRoleSwitch();

  const [requests, setRequests] = useState<DriverRideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (currentRole !== 'DRIVER') {
      Alert.alert(
        'Access Denied',
        'Only drivers can access this page. Please switch to driver mode.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [currentRole]);

  const fetchRequests = useCallback(async () => {
    try {
      setError(null);
      const data = await rideService.getRideRequests();

      const validRequests = data.filter(req => req && req.ride_id && req.rider_id);
      setRequests(validRequests);
      
      if (validRequests.length !== data.length) {
        console.warn('Some requests were filtered out due to missing data');
      }
    } catch (err: any) {
      console.error('Failed to load ride requests:', err);
      setError(err.message || 'Failed to load ride requests');
      Alert.alert('Error', err.message || 'Failed to load ride requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (currentRole === 'DRIVER') {
      fetchRequests();
    }
  }, [currentRole, fetchRequests]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequests();
  }, [fetchRequests]);

  const handleAccept = async (request: DriverRideRequest) => {
    Alert.alert(
      'Accept Request',
      `Accept ride request from ${request.rider_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            const requestKey = `${request.ride_request_id}`;
            try {
              setProcessingId(requestKey);              
              const response = await rideService.acceptRideRequest(request.ride_request_id);

              setRequests((prev) =>
                prev.map((r) =>
                  r.ride_id === request.ride_id && r.rider_id === request.rider_id
                    ? { ...r, status: 'ACCEPTED' }
                    : r
                )
              );

              Alert.alert('Success! 🎉', response.message || 'Ride request accepted successfully');
              
              fetchRequests();
            } catch (error: any) {
              console.error('Accept request error:', error);
              Alert.alert(
                'Error',
                error.message || 'Failed to accept request. Please try again.'
              );
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = async (request: DriverRideRequest) => {
    Alert.alert(
      'Reject Request',
      `Reject ride request from ${request.rider_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            const requestKey = `${request.ride_request_id}`;
            try {
              setProcessingId(requestKey);
              
              const response = await rideService.rejectRideRequest(request.ride_request_id);

              setRequests((prev) =>
                prev.map((r) =>
                  r.ride_id === request.ride_id && r.rider_id === request.rider_id
                    ? { ...r, status: 'DECLINED' }
                    : r
                )
              );

              Alert.alert('Request Rejected', response.message || 'Ride request rejected');
              
              fetchRequests();
            } catch (error: any) {
              console.error('Reject request error:', error);
              Alert.alert(
                'Error',
                error.message || 'Failed to reject request. Please try again.'
              );
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const renderRequestCard = ({ item }: { item: DriverRideRequest }) => {
    if (!item || !item.ride_id || !item.rider_id) {
      console.error('Invalid request item:', item);
      return null;
    }

    const getStatusStyle = () => {
      switch (item.status) {
        case 'PENDING':
          return { badge: styles.statusPending, text: styles.statusTextPending };
        case 'ACCEPTED':
          return { badge: styles.statusAccepted, text: styles.statusTextAccepted };
        case 'DECLINED':
          return { badge: styles.statusDeclined, text: styles.statusTextDeclined };
      }
    };

    const statusStyle = getStatusStyle();
    const requestKey = `${item.ride_request_id}`;
    const isProcessing = processingId === requestKey;

    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.riderInfo}>
            <Text style={styles.riderName}>👤 {item.rider_name}</Text>
            <Text style={styles.requestId}>
              Request #{item.ride_request_id} • Ride #{item.ride_id}
            </Text>
          </View>
          <View style={[styles.statusBadge, statusStyle.badge]}>
            <Text style={[styles.statusText, statusStyle.text]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.rideInfo}>
          <View style={styles.rideInfoRow}>
            <Text style={styles.rideInfoIcon}>📍</Text>
            <Text style={styles.rideInfoText}>
              {item.departure_location} → {item.destination}
            </Text>
          </View>
          <View style={styles.rideInfoRow}>
            <Text style={styles.rideInfoIcon}>🆔</Text>
            <Text style={styles.rideInfoText}>Rider ID: {item.rider_id}</Text>
          </View>
          <View style={styles.rideInfoRow}>
            <Text style={styles.rideInfoIcon}>📍</Text>
            <Text style={styles.rideInfoText}>Meeting: {item.meeting_point}</Text>
          </View>
          <View style={styles.rideInfoRow}>
            <Text style={styles.rideInfoIcon}>📅</Text>
            <Text style={styles.rideInfoText}>
              {new Date(item.departure_date_time).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>Message from Rider:</Text>
          <Text style={styles.messageText}>
            {item.message || '(No message provided)'}
          </Text>
        </View>

        {item.status === 'PENDING' && (
          <View style={styles.requestActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAccept(item)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={[styles.actionButtonText, styles.acceptButtonText]}>
                  Accept
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleReject(item)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FF3B30" size="small" />
              ) : (
                <Text style={[styles.actionButtonText, styles.rejectButtonText]}>
                  Reject
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'ACCEPTED' && (
          <View style={[styles.actionButton, { backgroundColor: '#E8F5E9', borderWidth: 0 }]}>
            <Text style={[styles.actionButtonText, { color: '#2E7D32' }]}>
              ✓ Request Accepted
            </Text>
          </View>
        )}

        {item.status === 'DECLINED' && (
          <View style={[styles.actionButton, { backgroundColor: '#FFEBEE', borderWidth: 0 }]}>
            <Text style={[styles.actionButtonText, { color: '#C62828' }]}>
              ✗ Request Declined
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (currentRole !== 'DRIVER') {
    return (
      <View style={styles.accessDeniedContainer}>
        <Text style={styles.accessDeniedIcon}>🚫</Text>
        <Text style={styles.accessDeniedText}>Access Denied</Text>
        <Text style={styles.accessDeniedSubtext}>
          Driver role required to view ride requests
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>📬</Text>
            <Text style={styles.title}>Ride Requests</Text>
            <Text style={styles.subtitle}>Manage incoming ride requests</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.loadingText}>Loading ride requests...</Text>
        </View>
      </View>
    );
  }

  if (error && requests.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>📬</Text>
            <Text style={styles.title}>Ride Requests</Text>
            <Text style={styles.subtitle}>Manage incoming ride requests</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Failed to Load Requests</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRequests}>
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
          <Text style={styles.headerIcon}>📬</Text>
          <Text style={styles.title}>Ride Requests</Text>
          <Text style={styles.subtitle}>Manage incoming ride requests</Text>
        </View>
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequestCard}
        keyExtractor={(item, index) => 
          item.ride_id && item.rider_id 
            ? `${item.ride_id}-${item.rider_id}` 
            : `request-${index}`
        }
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
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No Ride Requests</Text>
            <Text style={styles.emptyText}>
              You don't have any ride requests at the moment. Requests will appear here when riders want to join your rides.
            </Text>
          </View>
        }
      />
    </View>
  );
}
