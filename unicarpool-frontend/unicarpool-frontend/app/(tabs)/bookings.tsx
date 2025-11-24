import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import RatingModal from '@/src/components/RatingModal';
import ratingService from '@/src/services/ratingService';

interface Booking {
  id: string;
  rideId: string;
  driverName: string;
  vehicleInfo: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  price: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  driverId: string;
  hasRated?: boolean;
}

export default function BookingsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'current' | 'completed'>('current');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Rating Modal State
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // TODO: Replace with your actual API call
      // const response = await bookingService.getMyBookings(activeTab);
      // setBookings(response.data);
      
      // Mock data for demonstration
      const mockBookings: Booking[] = [
        {
          id: '1',
          rideId: 'ride-001',
          driverName: 'John Doe',
          vehicleInfo: 'Toyota Camry • ABC-1234',
          from: 'Halifax Downtown',
          to: 'Dalhousie University',
          date: '2024-11-20',
          time: '09:00 AM',
          seats: 2,
          price: 15,
          status: 'COMPLETED',
          driverId: 'driver-001',
          hasRated: false,
        },
        {
          id: '2',
          rideId: 'ride-002',
          driverName: 'Jane Smith',
          vehicleInfo: 'Honda Civic • XYZ-5678',
          from: 'Spring Garden Rd',
          to: 'Bedford',
          date: '2024-11-18',
          time: '02:00 PM',
          seats: 1,
          price: 12,
          status: 'COMPLETED',
          driverId: 'driver-002',
          hasRated: true,
        },
        {
          id: '3',
          rideId: 'ride-003',
          driverName: 'Mike Johnson',
          vehicleInfo: 'Mazda 3 • DEF-9012',
          from: 'Dartmouth',
          to: 'Halifax Airport',
          date: '2024-11-22',
          time: '06:30 AM',
          seats: 3,
          price: 25,
          status: 'CONFIRMED',
          driverId: 'driver-003',
          hasRated: false,
        },
      ];
      
      setBookings(
        activeTab === 'completed' 
          ? mockBookings.filter(b => b.status === 'COMPLETED')
          : mockBookings.filter(b => b.status !== 'COMPLETED')
      );
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const handleRateRide = (booking: Booking) => {
    setSelectedBooking(booking);
    setRatingModalVisible(true);
  };

  const handleSubmitRating = async (rating: number, comment: string) => {
    if (!selectedBooking) return;

    try {
      await ratingService.rateDriver({
        rideId: selectedBooking.rideId,
        driverId: selectedBooking.driverId,
        rating,
        comment,
      });

      Alert.alert('Success! 🎉', 'Thank you for your feedback!');
      
      // Update the booking to mark as rated
      setBookings(prevBookings =>
        prevBookings.map(b =>
          b.id === selectedBooking.id ? { ...b, hasRated: true } : b
        )
      );
      
      setRatingModalVisible(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    }
  };

  const renderBookingCard = (booking: Booking) => {
    const isCompleted = booking.status === 'COMPLETED';
    const canRate = isCompleted && !booking.hasRated;

    return (
      <View key={booking.id} style={styles.bookingCard}>
        {/* Driver Info */}
        <View style={styles.driverSection}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverAvatarText}>
              {booking.driverName.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{booking.driverName}</Text>
            <Text style={styles.vehicleInfo}>{booking.vehicleInfo}</Text>
          </View>
          <View style={[styles.statusBadge, styles[`status${booking.status}`]]}>
            <Text style={styles.statusText}>{booking.status}</Text>
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.tripDetails}>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>From</Text>
              <Text style={styles.locationText}>{booking.from}</Text>
            </View>
          </View>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>🎯</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>To</Text>
              <Text style={styles.locationText}>{booking.to}</Text>
            </View>
          </View>
        </View>

        {/* Time and Price */}
        <View style={styles.bottomSection}>
          <View style={styles.timeSection}>
            <Text style={styles.dateText}>{booking.date}</Text>
            <Text style={styles.timeText}>{booking.time} • {booking.seats} seat(s)</Text>
          </View>
          <Text style={styles.priceText}>${booking.price}</Text>
        </View>

        {/* Rate Button for Completed Rides */}
        {canRate && (
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => handleRateRide(booking)}
          >
            <Text style={styles.rateButtonText}>⭐ Rate this Ride</Text>
          </TouchableOpacity>
        )}

        {booking.hasRated && (
          <View style={styles.ratedBadge}>
            <Text style={styles.ratedText}>✓ Rated</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
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

      {/* Bookings List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              {activeTab === 'current' ? '🚗' : '✅'}
            </Text>
            <Text style={styles.emptyStateTitle}>
              {activeTab === 'current' 
                ? 'No Current Bookings' 
                : 'No Completed Rides'}
            </Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'current'
                ? 'Book a ride to get started!'
                : 'Your completed rides will appear here'}
            </Text>
          </View>
        ) : (
          bookings.map(renderBookingCard)
        )}
      </ScrollView>

      {/* Rating Modal */}
      {selectedBooking && (
        <RatingModal
          visible={ratingModalVisible}
          onClose={() => {
            setRatingModalVisible(false);
            setSelectedBooking(null);
          }}
          onSubmit={handleSubmitRating}
          driverName={selectedBooking.driverName}
          vehicleInfo={selectedBooking.vehicleInfo}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#667eea',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#667eea',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  vehicleInfo: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusCOMPLETED: {
    backgroundColor: '#e8f5e9',
  },
  statusPENDING: {
    backgroundColor: '#fff3e0',
  },
  statusCONFIRMED: {
    backgroundColor: '#e3f2fd',
  },
  statusCANCELLED: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2e7d32',
  },
  tripDetails: {
    marginBottom: 15,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeSection: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 13,
    color: '#999',
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  rateButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  rateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  ratedBadge: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  ratedText: {
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});