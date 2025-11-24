export const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:8080/api/v1',
  // BASE_URL:'http://csci5308-vm4.research.cs.dal.ca:8080/api/v1',
  TIMEOUT: 120000,
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/user/register',
    VERIFY_CODE: '/auth/verify-code',
    SEND_VERIFICATION: '/auth/verification-code',
    RESET_PASSWORD: '/auth/reset-password',
    RECOVER_PASSWORD_CODE: '/auth/recover-password-code',
    RECOVER_PASSWORD: '/auth/recover-password',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/update',
    ADD_TYPE: '/user/add-type',
  },
  RIDE: {
    CREATE: '/driver/create-ride',
    GET_DRIVER_RIDES: '/driver/ride',
    CANCEL: '/driver/rides',
    GET_ALL_RIDES: '/rider/ride/active',
    BOOK_RIDE: '/rider/book-ride',
    GET_RIDE_REQUESTS: '/driver/ride-request',
    GET_MY_REQUESTS: '/rider/my-request',
    ACCEPT_REQUEST: '/driver',
    REJECT_REQUEST: '/driver',
    CURRENT_BOOKINGS: '/rider/current-bookings',
  },
} as const;