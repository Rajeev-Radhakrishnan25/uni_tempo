export interface CreateRideRequest {
  departure_location: string;
  destination: string;
  departure_date_time: string; // ISO 8601 format
  available_seats: number;
  meeting_point: string;
  ride_conditions?: string;
}

export interface CreateRideResponse {
  id: number;
  driver_name: string;
  driver_id: string;
  departure_location: string;
  destination: string;
  departure_date_time: string;
  available_seats: number;
  meeting_point: string;
  ride_conditions?: string;
}

export interface Ride {
  id: number;
  driver_id: string;
  driver_name: string;
  departure_location: string;
  destination: string;
  departure_date_time: string;
  available_seats: number;
  meeting_point: string;
  ride_conditions?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  created_at?: string;
}

export interface PassengerRequest {
  id: string;
  passenger_id: number;
  passenger_name: string;
  ride_id: string;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  created_at: string;
}

export interface RideRequestData {
  ride_id: number;
  message?: string;
}

export interface RideRequestResponse {
  id: number;
  ride_id: number;
  message: string;
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

export interface DriverRideRequest {
  ride_id: number;
  ride_request_id: number;
  message: string,
  rider_id: string;
  rider_name: string;
  driver_id: string;
  driver_name: string;
  driver_phone_number: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  departure_location: string;
  destination: string;
  meeting_point: string;
  departure_date_time: string;
}

export interface AcceptRejectResponse {
  message: string;
}

export interface RiderRequest {
  id: number;
  ride_id: number;
  message: string;
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
