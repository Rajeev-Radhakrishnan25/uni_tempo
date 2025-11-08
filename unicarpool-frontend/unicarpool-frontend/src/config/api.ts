export const API_CONFIG = {
  BASE_URL:'http://csci5308-vm4.research.cs.dal.ca:8080/api/v1',
  TIMEOUT: 10000,
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
} as const;