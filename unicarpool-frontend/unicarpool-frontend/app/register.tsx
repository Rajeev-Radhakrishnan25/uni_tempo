import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useNavigation } from 'expo-router';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export default function RegisterScreen() {
  const [bannerId, setBannerId] = useState('');
  const [fullName, setFullName] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'RIDER' | 'DRIVER'>('RIDER');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const router = useRouter();
  const navigation = useNavigation();

  // Force hide header when component mounts
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      title: '',
      headerTitle: '',
    });
  }, [navigation]);

  // Refs for verification code inputs
  const inputRefs = React.useRef<(TextInput | null)[]>(Array(6).fill(null));

  const validate = () => {
    if (!bannerId || !fullName || !schoolEmail || !phoneNumber || !password) {
      return 'All fields are required.';
    }

    const lowered = schoolEmail.trim().toLowerCase();
    if (!lowered.endsWith('@dal.ca')) {
      return 'Please use your @dal.ca email.';
    }

    if (phoneNumber.length < 7) {
      return 'Please enter a valid phone number.';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }

    return null;
  };

  const handleRegister = async () => {
    setMessage('');
    const problem = validate();
    if (problem) {
      setMessage(problem);
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(`${API_BASE_URL}/user/register`, {
        banner_id: bannerId,
        full_name: fullName,
        school_email: schoolEmail.trim().toLowerCase(),
        phone_number: phoneNumber,
        password: password,
        selected_role: role,
      });

      console.log('Register response:', response.data);
      setStep(2);
      await sendVerificationCode();
    } catch (error: any) {
      console.log('Registration error:', error?.response?.data || error.message);

      const backendMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;

      setMessage(backendMsg || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const sendVerificationCode = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/verification-code`, {
        banner_id: bannerId,
      });

      Alert.alert(
        'Verification Code Sent',
        'A verification code has been sent to your email. Please check your inbox.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      const backendMsg =
        error.response?.data?.message || 'Failed to send verification code.';
      setMessage(backendMsg);
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...verificationCode];
    
    // Handle paste
    if (text.length > 1) {
      const pastedCode = text.slice(0, 6).split('');
      pastedCode.forEach((char, i) => {
        if (i < 6 && /^\d$/.test(char)) {
          newCode[i] = char;
        }
      });
      setVerificationCode(newCode);
      
      // Focus on the last filled input or the next empty one
      const nextIndex = Math.min(pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Handle single character input
    if (/^\d$/.test(text) || text === '') {
      newCode[index] = text;
      setVerificationCode(newCode);

      // Auto-focus next input
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

  const handleVerifyCode = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setMessage('Please enter all 6 digits');
      return;
    }

    try {
      setSubmitting(true);
      setMessage('');

      await axios.post(`${API_BASE_URL}/auth/verify-code`, {
        banner_id: bannerId,
        verification_code: code,
      });

      Alert.alert(
        'Success! 🎉',
        'Your account has been verified. Please log in.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/login');
            },
          },
        ]
      );
    } catch (error: any) {
      const backendMsg =
        error.response?.data?.message || 'Verification failed.';
      setMessage(backendMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const resendCode = async () => {
    setMessage('');
    try {
      await sendVerificationCode();
    } catch (error) {
      setMessage('Failed to resend code');
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
              disabled={submitting}
            >
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.centerWrapper}>
            <View style={styles.header}>
              <Text style={styles.emoji}>{step === 1 ? '🚀' : '📧'}</Text>
              <Text style={styles.title}>
                {step === 1 ? 'Create Account' : 'Verify Email'}
              </Text>
              <Text style={styles.subtitle}>
                {step === 1
                  ? 'Join UNICARPOOL today'
                  : `Enter the 6-digit code sent to\n${schoolEmail}`}
              </Text>
            </View>

            {step === 1 && (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Banner ID</Text>
                  <TextInput
                    placeholder="e.g., B00123456"
                    value={bannerId}
                    onChangeText={setBannerId}
                    style={styles.input}
                    autoCapitalize="none"
                    editable={!submitting}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    placeholder="Enter your full name"
                    value={fullName}
                    onChangeText={setFullName}
                    style={styles.input}
                    editable={!submitting}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>University Email</Text>
                  <TextInput
                    placeholder="yourname@dal.ca"
                    value={schoolEmail}
                    onChangeText={setSchoolEmail}
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!submitting}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    placeholder="e.g., +1 234 567 8900"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    style={styles.input}
                    keyboardType="phone-pad"
                    editable={!submitting}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    placeholder="At least 8 characters"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    secureTextEntry
                    editable={!submitting}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>I want to</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={role}
                      onValueChange={(val) => setRole(val)}
                      enabled={!submitting}
                      style={styles.picker}
                    >
                      <Picker.Item label="🚗 Offer Rides (Driver)" value="DRIVER" />
                      <Picker.Item label="🎒 Find Rides (Rider)" value="RIDER" />
                    </Picker>
                  </View>
                </View>

                {!!message && <Text style={styles.errorText}>{message}</Text>}

                <TouchableOpacity
                  style={[styles.button, submitting && styles.buttonDisabled]}
                  onPress={handleRegister}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Continue</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.signinContainer}>
                  <Text style={styles.signinText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => router.replace('/login')}>
                    <Text style={styles.signinLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
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
                      editable={!submitting}
                    />
                  ))}
                </View>

                <Text style={styles.codeHint}>
                  Didn't receive the code? Check your spam folder
                </Text>

                {!!message && <Text style={styles.errorText}>{message}</Text>}

                <TouchableOpacity
                  style={[styles.button, submitting && styles.buttonDisabled]}
                  onPress={handleVerifyCode}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Verify Email</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={resendCode}
                  style={styles.resendButton}
                  disabled={submitting}
                >
                  <Text style={styles.resendText}>Resend Code</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  topNav: {
    paddingHorizontal: 8,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    alignItems: 'flex-start',
  },
  backButtonTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    marginLeft: 0,
  },
  backArrow: {
    fontSize: 24,
    color: '#0A84FF',
    marginRight: 4,
  },
  backText: {
    fontSize: 17,
    color: '#0A84FF',
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1A1A1A',
  },
  pickerWrapper: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  codeInput: {
    width: 48,
    height: 58,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1A1A1A',
  },
  codeInputFilled: {
    borderColor: '#0A84FF',
    backgroundColor: '#F0F8FF',
  },
  codeHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#A0C4FF',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signinText: {
    fontSize: 15,
    color: '#666',
  },
  signinLink: {
    fontSize: 15,
    color: '#0A84FF',
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    color: '#0A84FF',
    fontSize: 15,
    fontWeight: '500',
  },
});