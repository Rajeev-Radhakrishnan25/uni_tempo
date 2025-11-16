import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { bookingService } from '@/src/services/booking';
import { Booking, BookingsResponse } from '@/src/types/booking';
import { ApiError } from '@/src/types/auth';

export function useBookings() {
  const [bookings, setBookings] = useState<BookingsResponse>({
    current: [],
    completed: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async (isRefreshing: boolean = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Failed to fetch bookings';
      setError(errorMessage);
      
      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const cancelBooking = async (bookingId: number) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await bookingService.cancelBooking(bookingId);
              
              Alert.alert(
                'Success',
                'Booking cancelled successfully',
                [
                  {
                    text: 'OK',
                    onPress: () => fetchBookings(),
                  },
                ]
              );
            } catch (err) {
              const apiError = err as ApiError;
              Alert.alert(
                'Error',
                apiError.message || 'Failed to cancel booking',
                [{ text: 'OK' }]
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const refresh = async () => {
    await fetchBookings(true);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return {
    bookings,
    loading,
    error,
    refreshing,
    refresh,
    cancelBooking,
  };
}