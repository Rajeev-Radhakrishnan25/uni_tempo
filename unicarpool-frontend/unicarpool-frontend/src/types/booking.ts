import { Ride } from "./ride";

  export interface CurrentBooking {
    message: string;
    ride_id: number;
    ride_request_id: number;
    rider_id?: string;
    rider_name?: string;
    rider_phone_number?: string;
    driver_id: string;
    driver_name: string;
    driver_phone_number: string;
    ride_status: 'Waiting' | 'Started' | 'Completed' | 'COMPLETED' | 'ACTIVE' | 'STARTED';
    ride_request_status: 'Pending' | 'Accepted' | 'Declined' | 'PENDING' | 'ACCEPTED' | 'DECLINED';
    status?: 'Pending' | 'Accepted' | 'Declined' | 'PENDING' | 'ACCEPTED' | 'DECLINED'; // For backward compatibility
    departure_location: string;
    destination: string;
    meeting_point: string;
    departure_date_time: string;
    reviewed?: boolean;
  }

  export interface Booking {
    //This is for the booking for carpooling rides
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
    reviewed?: boolean;

    //This is to store the id of ride request associated with the booking
    rideRequestId?: number;

    //These below are for the cab booking specifically
    bookingId?: number;          
    pickupLocation?: string;      
    dropoffLocation?: string;
    etaMinutes?: number;
    estimatedFare?: number;
    arrivalTime?: string;

  }

  export type BookingStatus = 
    | 'Waiting' | 'Started' | 'Completed' | 'Cancelled'  // Ride status values (capitalized)
    | 'ACTIVE' | 'STARTED' | 'COMPLETED' | 'CANCELLED'   // Ride status values (uppercase)
    | 'Pending' | 'Accepted' | 'Declined'                // Request status values (capitalized)
    | 'PENDING' | 'ACCEPTED' | 'DECLINED';               // Request status values (uppercase)

  export interface BookingsResponse {
    current: Booking[];
    completed: Booking[];
  }