import { apiService } from './api';
import { API_ENDPOINTS } from '@/src/config/api';
import { 
  LoginRequest, 
  LoginResponse,
  RegisterRequest, 
  RegisterResponse,
  VerificationRequest, 
  VerificationResponse,
  SendVerificationResponse,
  AddRoleRequest,
  AddRoleResponse,
  UpdateProfileRequest,
  User
} from '@/src/types/auth';

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiService.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  static async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return apiService.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, userData);
  }

  static async verifyCode(data: VerificationRequest): Promise<VerificationResponse> {
    return apiService.post<VerificationResponse>(API_ENDPOINTS.AUTH.VERIFY_CODE, data);
  }

  static async sendVerificationCode(bannerId: string): Promise<SendVerificationResponse> {
    return apiService.post<SendVerificationResponse>(
      API_ENDPOINTS.AUTH.SEND_VERIFICATION, 
      { banner_id: bannerId }
    );
  }

  static decodeToken(token: string): User {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        bannerId: payload.sub || payload.bannerId,
        name: payload.name,
        email: payload.email,
        roles: payload.roles || [],
      };
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  static async resetPassword(email: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD, 
      { email }
    );
  }

  static async requestPasswordResetCode(bannerId: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(
      API_ENDPOINTS.AUTH.RECOVER_PASSWORD_CODE,
      { banner_id: bannerId }
    );
  }

  static async recoverPassword(data: {
    banner_id: string;
    verification_code: string;
    password: string;
  }): Promise<{ message: string }> {
    return apiService.post<{ message: string }>(
      API_ENDPOINTS.AUTH.RECOVER_PASSWORD,
      data
    );
  }

 static async changePassword(data: { banner_id: string; password: string }) {
    return apiService.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  }

  static async addUserRole(role: AddRoleRequest): Promise<AddRoleResponse> {
    return apiService.post<AddRoleResponse>(API_ENDPOINTS.USER.ADD_TYPE, role);
  }

  static async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return apiService.post<User>(API_ENDPOINTS.USER.UPDATE_PROFILE, data);
  }
}

export const authService = AuthService;