import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { authService } from '@/src/services/auth';
import { ApiError } from '@/src/types/auth';

export function useVerification(bannerId: string) {
  const { setLoading, setError, clearError } = useAuth();
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);

  const handleCodeChange = (text: string, index: number, inputRefs: React.RefObject<any[]>) => {
    const newCode = [...verificationCode];
    
    if (text.length > 1) {
      const pastedCode = text.slice(0, 6).split('');
      pastedCode.forEach((char, i) => {
        if (i < 6 && /^\d$/.test(char)) {
          newCode[i] = char;
        }
      });
      setVerificationCode(newCode);
      
      const nextIndex = Math.min(pastedCode.length, 5);
      inputRefs.current?.[nextIndex]?.focus();
      return;
    }

    if (/^\d$/.test(text) || text === '') {
      newCode[index] = text;
      setVerificationCode(newCode);

      if (text && index < 5) {
        inputRefs.current?.[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number, inputRefs: React.RefObject<any[]>) => {
    if (e.nativeEvent.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current?.[index - 1]?.focus();
    }
  };

  const verifyCode = async (): Promise<boolean> => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return false;
    }

    try {
      setLoading(true);
      clearError();

      await authService.verifyCode({
        banner_id: bannerId,
        verification_code: code,
      });

      return true;
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Verification failed.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationCode = async (): Promise<boolean> => {
    try {
      await authService.sendVerificationCode(bannerId);
      Alert.alert(
        'Verification Code Sent',
        'A verification code has been sent to your email. Please check your inbox.',
        [{ text: 'OK' }]
      );
      return true;
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Failed to send verification code.');
      return false;
    }
  };

  return {
    verificationCode,
    setVerificationCode,
    handleCodeChange,
    handleKeyPress,
    verifyCode,
    sendVerificationCode,
  };
}