import { apiService } from './api';
import { API_ENDPOINTS } from '@/src/config/api';
import {
  CreateRideRequest,
  CreateRideResponse,
  Ride,
  RideRequestData,
  RideRequestResponse,
  DriverRideRequest,
  AcceptRejectResponse,
  RiderRequest,
} from '@/src/types/ride';

export class RideService {
  static async createRide(data: CreateRideRequest): Promise<CreateRideResponse> {
    return apiService.post<CreateRideResponse>(API_ENDPOINTS.RIDE.CREATE, data);
  }

  static async getDriverRides(): Promise<Ride[]> {
    return apiService.get<Ride[]>(API_ENDPOINTS.RIDE.GET_DRIVER_RIDES);
  }

  static async getAllRides(): Promise<Ride[]> {
    return apiService.get<Ride[]>(API_ENDPOINTS.RIDE.GET_ALL_RIDES);
  }

  static async bookRide(data: RideRequestData): Promise<RideRequestResponse> {
    return apiService.post<RideRequestResponse>(API_ENDPOINTS.RIDE.BOOK_RIDE, data);
  }

  static async cancelRide(rideId: string): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(
      `${API_ENDPOINTS.RIDE.CANCEL}/${rideId}`
    );
  }

  static async getRideRequests(): Promise<DriverRideRequest[]> {
    return apiService.get<DriverRideRequest[]>(API_ENDPOINTS.RIDE.GET_RIDE_REQUESTS);
  }

  static async getMyRequests(): Promise<RiderRequest[]> {
    return apiService.get<RiderRequest[]>(API_ENDPOINTS.RIDE.GET_MY_REQUESTS);
  }

  static async acceptRideRequest(requestId: number): Promise<AcceptRejectResponse> {
    return apiService.put<AcceptRejectResponse>(
      `${API_ENDPOINTS.RIDE.ACCEPT_REQUEST}/${requestId}/accept`,
      {}
    );
  }

  static async rejectRideRequest(requestId: number): Promise<AcceptRejectResponse> {
    return apiService.put<AcceptRejectResponse>(
      `${API_ENDPOINTS.RIDE.REJECT_REQUEST}/${requestId}/reject`,
      {}
    );
  }
}

export const rideService = RideService;
