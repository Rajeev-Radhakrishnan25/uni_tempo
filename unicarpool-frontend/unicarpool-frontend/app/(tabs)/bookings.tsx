import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { bookingService } from '@/src/services/booking';
import { Booking } from '@/src/types/booking';

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<'current' | 'completed'>('current');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings();
      
      console.log('Bookings response:', response);
      console.log('Current bookings:', response.current);
      console.log('Completed bookings:', response.completed);
      console.log('Active tab:', activeTab);
      
      const selectedBookings = activeTab === 'completed' 
        ? response.completed
        : response.current;

      setBookings(selectedBookings);

      const latestToReview = selectedBookings.filter(booking => 
        booking.status === 'COMPLETED' && !booking.reviewed)
        .sort((a, b) => b.id - a.id)[0];

      if (latestToReview) {
        setTimeout(() => {
          promptReview(latestToReview);
        }, 300);
      }

    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', error.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const hasStartedRide = bookings.some(
    (booking) => booking.status.toUpperCase() === 'STARTED'
  );

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const promptReview = (booking: Booking) => {
    setCurrentBooking(booking);
    setReviewComment('');
    setSelectedRating(0);
    setShowReviewPrompt(true);
  };

  const renderBookingCard = ({ item: booking }: { item: Booking }) => {
    const getStatusStyle = () => {
      const status = booking.status.toUpperCase();
      switch (status) {
        case 'WAITING':
        case 'ACTIVE':
        case 'PENDING':
          return { badge: styles.statusWaiting, text: styles.statusTextWaiting };
        case 'STARTED':
          return { badge: styles.statusStarted, text: styles.statusTextStarted };
        case 'ACCEPTED':
          return { badge: styles.statusAccepted, text: styles.statusTextAccepted };
        case 'DECLINED':
          return { badge: styles.statusDeclined, text: styles.statusTextDeclined };
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
      <View style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>🚗 {booking.driverName}</Text>
            <Text style={styles.bookingId}>Booking #{booking.id}</Text>
          </View>
          <View style={[styles.statusBadge, statusStyle.badge]}>
            <Text style={[styles.statusText, statusStyle.text]}>{booking.status}</Text>
          </View>
        </View>

        <View style={styles.routeContainer}>
          <View style={styles.routeRow}>
            <Text style={styles.routeIcon}>📍</Text>
            <Text style={styles.routeText}>{booking.departureLocation}</Text>
          </View>
          <View style={styles.routeDivider} />
          <View style={styles.routeRow}>
            <Text style={styles.routeIcon}>🎯</Text>
            <Text style={styles.routeText}>{booking.destination}</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📞</Text>
            <Text style={styles.detailText}>{booking.driverPhone}</Text>
          </View>
          {booking.meetingPoint && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📍</Text>
              <Text style={styles.detailText}>{booking.meetingPoint}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>{formatDateTime(booking.departureDateTime)}</Text>
          </View>
        </View>

         {activeTab === 'completed' && (
            booking.reviewed ? (
              <Text style={{ color: '#2E7D32', fontWeight: '600', marginTop: 12 }}>
                ✅ Reviewed
              </Text>
            ) : (
              <TouchableOpacity
                style={styles.reviewButton}
                onPress={() => promptReview(booking)}
              >
                <Text style={styles.reviewButtonText}>Submit Review</Text>
              </TouchableOpacity>
            )
          )}
      </View>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return '#2e7d32';
      case 'PENDING':
        return '#f57c00';
      case 'COMPLETED':
        return '#1976d2';
      case 'DECLINED':
      case 'CANCELLED':
        return '#d32f2f';
      default:
        return '#666';
    }
  };

  if (loading) {

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerIcon}>📋</Text>
            <Text style={styles.title}>My Bookings</Text>
            <Text style={styles.subtitle}>Track your ride bookings</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" 
          color="#0A84FF" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      </View>
    );
  }

  return (
  <View style={styles.container}>
    {showReviewPrompt && currentBooking && (
      <Modal transparent animationType="slide" visible={showReviewPrompt}>
        <View style={styles.modaloverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Submit Review for {currentBooking.driverName}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 16 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setSelectedRating(star)}>
                  <Text style={{ fontSize: 32, color: star <= selectedRating ? '#FFD700' : '#ccc' }}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Write your comments..."
              multiline
              value={reviewComment}
              onChangeText={setReviewComment}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={async () => {
                if (!currentBooking) return;
                try {
                  await bookingService.submitReview(
                    currentBooking.rideId,
                    selectedRating,
                    reviewComment
                  );
                  setShowReviewPrompt(false);
                  fetchBookings();
                  Alert.alert('Thank you!', 'Your review has been submitted');
                } catch (err: any) {
                  Alert.alert('Error', err.message || 'Failed to submit review');
                }
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Submit Review</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: '#ccc', marginTop: 12 }]}
              onPress={() => setShowReviewPrompt(false)}
            >
              <Text style={{ color: '#333', fontWeight: '600' }}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )}
    <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>📋</Text>
          <Text style={styles.title}>My Bookings</Text>
          <Text style={styles.subtitle}>Track your ride bookings</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'current' && styles.activeTab]}
          onPress={() => setActiveTab('current')}
        >
          <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>
            Current
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={bookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => {
          const id =
            item.bookingId ??
            item.rideRequestId ??
            item.rideId ??
            item.id;

          return id ? id.toString() : Math.random().toString();
        }}

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
            <Text style={styles.emptyIcon}>
              {activeTab === 'current' ? '🚗' : '✅'}
            </Text>
            <Text style={styles.emptyTitle}>
              {activeTab === 'current' 
                ? 'No Current Bookings' 
                : 'No Completed Rides'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'current'
                ? 'Book a ride to get started!'
                : 'Your completed rides will appear here'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  reviewButton: {
  backgroundColor: '#0A84FF',
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 12,
  alignItems: 'center',
  marginTop: 12,
},

modaloverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContainer: {
  backgroundColor: 'white',
  borderRadius: 16,
  padding: 20,
  width: '85%',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
},

modalTitle: {
  fontSize: 20,
  fontWeight: '600',
  marginBottom: 16,
  textAlign: 'center',
},
commentInput: {
  borderColor: '#E0E0E0',
  borderWidth: 1,
  borderRadius: 12,
  padding: 12,
  textAlignVertical: 'top',
  marginBottom: 16,
  fontSize: 14,
  color: '#1A1A1A',
},
submitButton: {
  backgroundColor: '#0A84FF',
  paddingVertical: 12,
  borderRadius: 12,
  alignItems: 'center',
},

reviewButtonText: {
  color: 'white',
  fontWeight: '600',
  fontSize: 16,
},

  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#0A84FF',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#0A84FF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#0A84FF',
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  bookingId: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusWaiting: {
    backgroundColor: '#E3F2FD',
  },
  statusStarted: {
    backgroundColor: '#FFF3E0',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusAccepted: {
    backgroundColor: '#E8F5E9',
  },
  statusDeclined: {
    backgroundColor: '#FFEBEE',
  },
  statusCompleted: {
    backgroundColor: '#E3F2FD',
  },
  statusCancelled: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextWaiting: {
    color: '#1976D2',
  },
  statusTextStarted: {
    color: '#E65100',
  },
  statusTextPending: {
    color: '#E65100',
  },
  statusTextAccepted: {
    color: '#2E7D32',
  },
  statusTextDeclined: {
    color: '#C62828',
  },
  statusTextCompleted: {
    color: '#1976D2',
  },
  statusTextCancelled: {
    color: '#C62828',
  },
  routeContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  routeText: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
    flex: 1,
  },
  routeDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
    marginLeft: 24,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  messageContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});