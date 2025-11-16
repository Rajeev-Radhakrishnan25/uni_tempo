import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useLogin } from '@/src/hooks/useAuthForm';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';

export default function LoginScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { isLoading, error, isAuthenticated } = useAuth();
  const { formData, updateField, handleLogin } = useLogin();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      title: '',
      headerTitle: '',
    });
  }, [navigation]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, router]);

  const onLoginPress = async () => {
    const success = await handleLogin();
    if (success) {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.centerWrapper}>
            <View style={styles.header}>
              <Text style={styles.emoji}>👋</Text>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>Sign in to UNICARPOOL</Text>
            </View>

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
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(text) => updateField('password', text)}
                secureTextEntry
                showPasswordToggle
                editable={!isLoading}
              />

              <TouchableOpacity 
                onPress={() => router.push('/resetPassword')}
                style={styles.forgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Button
                title="Login"
                onPress={onLoginPress}
                loading={isLoading}
                disabled={isLoading}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text style={styles.signupLink}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
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
  },
  form: {
    marginBottom: 32,
  },

  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: '500',
  },

  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 15,
    color: '#666',
  },
  signupLink: {
    fontSize: 15,
    color: '#0A84FF',
    fontWeight: '600',
  },
});