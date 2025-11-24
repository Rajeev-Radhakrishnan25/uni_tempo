import { apiService } from './api';
import { API_ENDPOINTS } from '@/src/config/api';
import { Booking, BookingsResponse, CurrentBooking } from '@/src/types/booking';

export class BookingService {
  static async getCurrentBookings(): Promise<CurrentBooking[]> {
    return apiService.get<CurrentBooking[]>(API_ENDPOINTS.RIDE.CURRENT_BOOKINGS);
  }

  static async getMyBookings(): Promise<BookingsResponse> {
    try {
      const currentBookings = await this.getCurrentBookings();
      
      // Transform API response to match UI expectations
      const transformedBookings: Booking[] = currentBookings.map((booking) => ({
        id: booking.ride_request_id,
        rideId: booking.ride_id,
        riderId: booking.rider_id,
        driverName: booking.driver_name,
        driverPhone: booking.driver_phone_number,
        departureLocation: booking.departure_location,
        destination: booking.destination,
        departureDateTime: booking.departure_date_time,
        status: booking.status,
        meetingPoint: booking.meeting_point,
        message: booking.message,
      }));

      // Separate current and completed bookings
      const current = transformedBookings.filter(
        (b) => b.status === 'PENDING' || b.status === 'ACCEPTED'
      );
      const completed = transformedBookings.filter(
        (b) => b.status === 'DECLINED' || b.status === 'COMPLETED' || b.status === 'CANCELLED'
      );

      return { current, completed };
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
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
}

export const bookingService = BookingService;