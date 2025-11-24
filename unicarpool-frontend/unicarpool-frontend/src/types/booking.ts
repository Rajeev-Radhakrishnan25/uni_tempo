export interface CurrentBooking {
  message: string;
  ride_id: number;
  ride_request_id: number;
  rider_id: string;
  rider_name: string;
  rider_phone_number: string;
  driver_id: string;
  driver_name: string;
  driver_phone_number: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  departure_location: string;
  destination: string;
  meeting_point: string;
  departure_date_time: string;
}

export interface Booking {
  id: number;
  rideId: number;
  riderId: string;
  driverName: string;
  driverPhone: string;
  departureLocation: string;
  destination: string;
  departureDateTime: string;
  status: BookingStatus;
  meetingPoint?: string;
  message?: string;
}

export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';

export interface BookingsResponse {
  current: Booking[];
  completed: Booking[];
}