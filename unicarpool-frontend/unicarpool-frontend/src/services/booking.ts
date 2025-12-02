import { apiService } from './api';
import { API_ENDPOINTS } from '@/src/config/api';
import { Booking, BookingsResponse, CurrentBooking, BookingStatus } from '@/src/types/booking';
import { storageService, STORAGE_KEYS } from './storage';

export class BookingService {
  static async getCurrentBookings(): Promise<CurrentBooking[]> {
    return apiService.get<CurrentBooking[]>(API_ENDPOINTS.RIDE.CURRENT_BOOKINGS);
  }

  static async getCompletedBookings(): Promise<CurrentBooking[]> {
    return apiService.get<CurrentBooking[]>(API_ENDPOINTS.RIDE.COMPLETED_BOOKINGS);
  }

  static async getMyBookings(): Promise<BookingsResponse> {
    try {
      // Fetch both current and completed bookings in parallel
      const [currentBookings, completedBookings] = await Promise.all([
        this.getCurrentBookings(),
        this.getCompletedBookings(),
      ]);
      
      console.log('Raw current bookings from API:', currentBookings);
      console.log('Raw completed bookings from API:', completedBookings);
      
      // Transform current bookings - use ride_status for display
      const transformedCurrent: Booking[] = currentBookings.map((booking) => {
        const status = booking.ride_status || booking.status || 'Waiting';
        return {
          id: booking.ride_request_id,
          rideId: booking.ride_id,
          riderId: booking.rider_id || '',
          driverName: booking.driver_name,
          driverPhone: booking.driver_phone_number,
          departureLocation: booking.departure_location,
          destination: booking.destination,
          departureDateTime: booking.departure_date_time,
          status: status as BookingStatus,
          meetingPoint: booking.meeting_point,
          message: booking.message,
          reviewed: Boolean(booking.reviewed),
        };
      });

      // Transform completed bookings - use ride_status for display
      const transformedCompleted: Booking[] = completedBookings.map((booking) => {
        const status = booking.ride_status || booking.status || 'Completed';
        return {
          id: booking.ride_request_id,
          rideId: booking.ride_id,
          riderId: booking.rider_id || '',
          driverName: booking.driver_name,
          driverPhone: booking.driver_phone_number,
          departureLocation: booking.departure_location,
          destination: booking.destination,
          departureDateTime: booking.departure_date_time,
          status: status as BookingStatus,
          meetingPoint: booking.meeting_point,
          message: booking.message,
          reviewed: Boolean(booking.reviewed),
        };
      });

      console.log('Transformed current bookings:', transformedCurrent);
      console.log('Transformed completed bookings:', transformedCompleted);

      return { 
        current: transformedCurrent, 
        completed: transformedCompleted 
      };
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      throw error;
    }
  }


  static async submitReview(rideId: number, rating: number, comment: string): Promise<{ message: string }> {
    try {
      const payload = { rideId, rating, comment };
      const response = await apiService.post<{ message: string }>(API_ENDPOINTS.RIDE.SUBMIT_REVIEW, payload);
      return response;
    } catch (error) {
      console.error('Failed to submit review:', error);
      throw error;
    }
  }

  static async cancelBooking(bookingId: number): Promise<{ message: string }> {
    // TODO: Implement cancel booking API when available
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ message: 'Booking cancelled successfully' });
      }, 500);
    });
  }

  static async toggleDriverAvailability(isAvailable: boolean): Promise<{ message: string }> {
  try {
    const endpoint = API_ENDPOINTS.RIDE.DRIVER_AVAILABILITY + (!isAvailable);
    const response = await apiService.post<{ message: string }>(endpoint, {});
    return response;
  } catch (error) {
    console.error("Failed to toggle driver availability:", error);
    throw error;
    }
  }

  static async bookCab(pickup: string, dropoff: string,numRiders: number): Promise<any> {
  try {
    const payload = {
      pickup_location: pickup,
      dropoff_location: dropoff,
      passenger_count: numRiders,
    };

    const response = await apiService.post<any>(API_ENDPOINTS.RIDE.CAB_BOOKING, payload);
    return response;
  } catch (error) {
    console.error('Failed to book cab:', error);
    throw error;
  }
}



}

export const bookingService = BookingService;