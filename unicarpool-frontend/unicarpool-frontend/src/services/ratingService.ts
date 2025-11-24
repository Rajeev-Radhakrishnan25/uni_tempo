import { apiService } from './api';

export interface RatingData {
  rideId: string;
  driverId: string;
  rating: number;
  comment?: string;
}

export interface DriverRatingData {
  rideId: string;
  passengerId: string;
  rating: number;
  comment?: string;
}

class RatingService {
  /**
   * Submit rating for a driver (from passenger)
   */
  async rateDriver(data: RatingData): Promise<any> {
    try {
      const response = await apiService.post('/ratings/driver', data);
      return response;
    } catch (error: any) {
      console.error('Error rating driver:', error);
      throw error;
    }
  }

  /**
   * Submit rating for a passenger (from driver)
   */
  async ratePassenger(data: DriverRatingData): Promise<any> {
    try {
      const response = await apiService.post('/ratings/passenger', data);
      return response;
    } catch (error: any) {
      console.error('Error rating passenger:', error);
      throw error;
    }
  }

  /**
   * Get ratings for a specific user
   */
  async getUserRatings(userId: string): Promise<any> {
    try {
      const response = await apiService.get(`/ratings/user/${userId}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching user ratings:', error);
      throw error;
    }
  }

  /**
   * Get average rating for a user
   */
  async getUserAverageRating(userId: string): Promise<any> {
    try {
      const response: any = await apiService.get(`/ratings/user/${userId}/average`);
      return response.averageRating;
    } catch (error: any) {
      console.error('Error fetching average rating:', error);
      throw error;
    }
  }

  /**
   * Check if a ride has been rated
   */
  async hasRatedRide(rideId: string): Promise<any> {
    try {
      const response: any = await apiService.get(`/ratings/ride/${rideId}/status`);
      return response.hasRated;
    } catch (error: any) {
      console.error('Error checking rating status:', error);
      return false;
    }
  }
}

export default new RatingService();