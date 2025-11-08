import { useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { authService } from '@/src/services/auth';
import { LoginRequest, RegisterRequest, ApiError } from '@/src/types/auth';

export function useLogin() {
  const { login, setLoading, setError, clearError } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({
    banner_id: '',
    password: '',
  });

  const updateField = (field: keyof LoginRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError();
  };

  const validate = (): string | null => {
    if (!formData.banner_id || !formData.password) {
      return 'Please enter Banner ID and password.';
    }
    return null;
  };

  const handleLogin = async (): Promise<boolean> => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return false;
    }

    try {
      setLoading(true);
      const response = await authService.login(formData);
      const user = authService.decodeToken(response.token);
      
      await login(user, response.token);
      return true;
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    updateField,
    handleLogin,
  };
}

export function useRegister() {
  const { setLoading, setError, clearError } = useAuth();
  const [formData, setFormData] = useState<RegisterRequest>({
    banner_id: '',
    full_name: '',
    school_email: '',
    phone_number: '',
    password: '',
    selected_role: 'RIDER',
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  const updateField = (field: keyof RegisterRequest | 'confirmPassword', value: string) => {
    if (field === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    clearError();
  };

  const validate = (): string | null => {
    const { banner_id, full_name, school_email, phone_number, password } = formData;
    
    if (!banner_id || !full_name || !school_email || !phone_number || !password || !confirmPassword) {
      return 'All fields are required.';
    }

    if (!school_email.toLowerCase().endsWith('@dal.ca')) {
      return 'Please use your @dal.ca email.';
    }

    if (phone_number.length < 7) {
      return 'Please enter a valid phone number.';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }

    return null;
  };

  const handleRegister = async (): Promise<boolean> => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return false;
    }

    try {
      setLoading(true);
      await authService.register({
        ...formData,
        school_email: formData.school_email.toLowerCase().trim(),
      });
      return true;
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    confirmPassword,
    updateField,
    handleRegister,
  };
}