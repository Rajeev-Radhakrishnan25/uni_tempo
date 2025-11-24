export interface ReviewSubmission {
  ride_id: string;
  reviewed_user_id: string;
  rating: number;
  comment?: string;
}

export interface Review {
  id: string;
  ride_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface UserRating {
  user_id: string;
  average_rating: number;
  total_reviews: number;
  reviews: Review[];
}

export interface RatingStats {
  average: number;
  total: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}