export interface Booking {
  id: number;
  rideId: number;
  riderId: string;
  driverName: string;
  departureLocation: string;
  destination: string;
  departureDateTime: string;
  seatsBooked: number;
  status: BookingStatus;
  meetingPoint?: string;
  rideConditions?: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface BookingsResponse {
  current: Booking[];
  completed: Booking[];
}