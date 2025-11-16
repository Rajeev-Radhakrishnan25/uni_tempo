import { apiService } from './api';
import { Booking, BookingsResponse } from '@/src/types/booking';

// Note: Update these endpoints when backend is ready
const BOOKING_ENDPOINTS = {
  MY_BOOKINGS: '/bookings/my-bookings',
  BOOK_RIDE: '/bookings/book',
  CANCEL_BOOKING: '/bookings/cancel',
} as const;

export class BookingService {
  static async getMyBookings(): Promise<BookingsResponse> {
    // TODO: Replace with actual API call when backend is ready
    // return apiService.get<BookingsResponse>(BOOKING_ENDPOINTS.MY_BOOKINGS);
    
    // Mock data for now - following existing pattern
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          current: [],
          completed: [],
        });
      }, 500);
    });
  }

  static async bookRide(rideId: number, seatsBooked: number): Promise<{ message: string }> {
    // TODO: Replace with actual API call when backend is ready
    // return apiService.post<{ message: string }>(BOOKING_ENDPOINTS.BOOK_RIDE, {
    //   ride_id: rideId,
    //   seats_booked: seatsBooked,
    // });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ message: 'Booking successful' });
      }, 500);
    });
  }

  static async cancelBooking(bookingId: number): Promise<{ message: string }> {
    // TODO: Replace with actual API call when backend is ready
    // return apiService.post<{ message: string }>(
    //   `${BOOKING_ENDPOINTS.CANCEL_BOOKING}/${bookingId}`
    // );
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ message: 'Booking cancelled successfully' });
      }, 500);
    });
  }
}

export const bookingService = BookingService;