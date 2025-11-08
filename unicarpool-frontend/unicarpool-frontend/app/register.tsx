import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useNavigation } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useRegister } from '@/src/hooks/useAuthForm';
import { useVerification } from '@/src/hooks/useVerification';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { registerStyles as styles } from '@/src/styles/screens/register.styles';

export default function RegisterScreen() {
  const [step, setStep] = useState(1);

  const router = useRouter();
  const navigation = useNavigation();
  const { isLoading, error } = useAuth();
  const { formData, confirmPassword, updateField, handleRegister } = useRegister();
  const verification = useVerification(formData.banner_id);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      title: '',
      headerTitle: '',
    });
  }, [navigation]);

  const inputRefs = React.useRef<(TextInput | null)[]>(Array(6).fill(null));

  const onRegisterPress = async () => {
    const success = await handleRegister();
    if (success) {
      setStep(2);
      await verification.sendVerificationCode();
    }
  };

  const handleVerifyCode = async () => {
    const success = await verification.verifyCode();
    if (success) {
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
    }
  };

  const resendCode = async () => {
    await verification.sendVerificationCode();
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
              disabled={isLoading}
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
                  : `Enter the 6-digit code sent to\n${formData.school_email}`}
              </Text>
            </View>

            {step === 1 && (
              <View style={styles.form}>
                <Input
                  label="Banner ID"
                  placeholder="e.g., B00123456"
                  value={formData.banner_id}
                  onChangeText={(text) => updateField('banner_id', text)}
                  autoCapitalize="none"
                  editable={!isLoading}
                />

                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChangeText={(text) => updateField('full_name', text)}
                  editable={!isLoading}
                />

                <Input
                  label="University Email"
                  placeholder="yourname@dal.ca"
                  value={formData.school_email}
                  onChangeText={(text) => updateField('school_email', text)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                />

                <Input
                  label="Phone Number"
                  placeholder="e.g., 234 567 8900"
                  value={formData.phone_number}
                  onChangeText={(text) => updateField('phone_number', text)}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />

                <Input
                  label="Password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChangeText={(text) => updateField('password', text)}
                  secureTextEntry
                  showPasswordToggle
                  editable={!isLoading}
                />

                <Input
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChangeText={(text) => updateField('confirmPassword', text)}
                  secureTextEntry
                  showPasswordToggle
                  editable={!isLoading}
                />

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>I want to</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={formData.selected_role}
                      onValueChange={(val) => updateField('selected_role', val)}
                      enabled={!isLoading}
                      style={styles.picker}
                    >
                      <Picker.Item label="🚗 Offer Rides (Driver)" value="DRIVER" />
                      <Picker.Item label="🎒 Find Rides (Rider)" value="RIDER" />
                    </Picker>
                  </View>
                </View>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <Button
                  title="Continue"
                  onPress={onRegisterPress}
                  loading={isLoading}
                  disabled={isLoading}
                />

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
                  {verification.verificationCode.map((digit: string, index: number) => (
                    <TextInput
                      key={index}
                      ref={(ref: TextInput | null) => {
                        inputRefs.current[index] = ref;
                      }}
                      style={[
                        styles.codeInput,
                        digit !== '' ? styles.codeInputFilled : null,
                      ]}
                      value={digit}
                      onChangeText={(text: string) => verification.handleCodeChange(text, index, inputRefs)}
                      onKeyPress={(e: any) => verification.handleKeyPress(e, index, inputRefs)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      editable={!isLoading}
                    />
                  ))}
                </View>

                <Text style={styles.codeHint}>
                  Didn't receive the code? Check your spam folder
                </Text>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <Button
                  title="Verify Email"
                  onPress={handleVerifyCode}
                  loading={isLoading}
                  disabled={isLoading}
                />

                <TouchableOpacity
                  onPress={resendCode}
                  style={styles.resendButton}
                  disabled={isLoading}
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