import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '@/src/services/auth';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { resetPasswordStyles as styles } from '@/src/styles/screens/resetPassword.styles';

export default function ResetPasswordScreen() {
  const [bannerId, setBannerId] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const router = useRouter();

  const inputRefs = React.useRef<(TextInput | null)[]>(Array(6).fill(null));

  const handleRequestCode = async () => {
    setMessage('');
    
    if (!bannerId.trim()) {
      setMessage('Please enter your Banner ID');
      return;
    }

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      await authService.requestPasswordResetCode(bannerId);

      Alert.alert(
        'Verification Code Sent!',
        'A 6-digit verification code has been sent to your registered email.',
        [{ text: 'OK', onPress: () => setStep(2) }]
      );
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to send verification code.';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text: string, index: number) => {
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
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (/^\d$/.test(text) || text === '') {
      newCode[index] = text;
      setVerificationCode(newCode);

      if (text && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResetPassword = async () => {
    setMessage('');

    const code = verificationCode.join('');
    if (code.length !== 6) {
      setMessage('Please enter all 6 digits');
      return;
    }

    try {
      setLoading(true);

      await authService.recoverPassword({
        banner_id: bannerId,
        verification_code: code,
        password: password,
      });

      Alert.alert(
        'Success!',
        'Your password has been reset successfully. Please login with your new password.',
        [
          {
            text: 'Go to Login',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to reset password.';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setMessage('');
    try {
      setLoading(true);
      await authService.requestPasswordResetCode(bannerId);
      Alert.alert('Success', 'Verification code has been resent to your email');
    } catch (error: any) {
      setMessage(error.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {step === 2 && (
          <View style={styles.topNav}>
            <TouchableOpacity
              onPress={() => setStep(1)}
              style={styles.backButtonTop}
              disabled={loading}
            >
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.centerWrapper}>
            <View style={styles.header}>
              <Text style={styles.emoji}>{step === 1 ? '🔐' : '📧'}</Text>
              <Text style={styles.title}>
                {step === 1 ? 'Forgot Password?' : 'Reset Password'}
              </Text>
              <Text style={styles.subtitle}>
                {step === 1
                  ? "Enter your Banner ID and new password. We'll send a verification code to confirm."
                  : 'Enter the 6-digit code sent to your email to complete password reset.'}
              </Text>
            </View>

            {step === 1 && (
              <View style={styles.form}>
                <Input
                  label="Banner ID"
                  placeholder="e.g., B00123456"
                  value={bannerId}
                  onChangeText={setBannerId}
                  autoCapitalize="none"
                  editable={!loading}
                />

                <Input
                  label="New Password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  showPasswordToggle
                  editable={!loading}
                />

                <Input
                  label="Confirm New Password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  showPasswordToggle
                  editable={!loading}
                />

                {message ? <Text style={styles.errorText}>{message}</Text> : null}

                <Button
                  title="Continue"
                  onPress={handleRequestCode}
                  loading={loading}
                  disabled={loading}
                />
              </View>
            )}

            {step === 2 && (
              <View style={styles.form}>
                <View style={styles.codeInputContainer}>
                  {verificationCode.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        inputRefs.current[index] = ref;
                      }}
                      style={[
                        styles.codeInput,
                        digit !== '' ? styles.codeInputFilled : null,
                      ]}
                      value={digit}
                      onChangeText={(text) => handleCodeChange(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      editable={!loading}
                    />
                  ))}
                </View>

                <Text style={styles.codeHint}>
                  Check your email for the 6-digit code
                </Text>

                {message ? <Text style={styles.errorText}>{message}</Text> : null}

                <Button
                  title="Reset Password"
                  onPress={handleResetPassword}
                  loading={loading}
                  disabled={loading}
                />

                <TouchableOpacity
                  onPress={resendCode}
                  style={styles.resendButton}
                  disabled={loading}
                >
                  <Text style={styles.resendText}>Resend Code</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>Remember your password?</Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.linkText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}