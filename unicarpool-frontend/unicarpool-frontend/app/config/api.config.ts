export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api/v1',
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      VERIFICATION_CODE: '/auth/verification-code',
      VERIFY_CODE: '/auth/verify-code',
      RECOVER_PASSWORD_CODE: '/auth/recover-password-code',
      RECOVER_PASSWORD: '/auth/recover-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    USER: {
      REGISTER: '/user/register',
      UPDATE: '/user/update',
      ADD_TYPE: '/user/add-type',
      GET_DETAILS: '/user',
    },
  },
  
  TIMEOUT: 10000,
};

export default API_CONFIG;