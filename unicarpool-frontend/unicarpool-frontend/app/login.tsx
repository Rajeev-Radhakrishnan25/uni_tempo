import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [bannerId, setBannerId] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const router = useRouter();

  const validate = () => {
    if (!bannerId || !password) {
      return 'Please enter Banner ID and password.';
    }
    return null;
  };

  const handleLogin = async () => {
    setMessage('');

    const problem = validate();
    if (problem) {
      setMessage(problem);
      return;
    }

    try {
      setLoggingIn(true);

      const response = await axios.post(
        'http://localhost:8080/api/v1/auth/login',
        {
          banner_id: bannerId,
          password: password,
        }
      );

      console.log('Login success:', response.data);

      router.replace('/(tabs)');
    } catch (error: any) {
      console.log('Login error:', error?.response?.data || error.message);

      const backendMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;

      setMessage(backendMsg || 'Login failed. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome back 👋</Text>
      <Text style={styles.title}>Sign in to UNICARPOOL</Text>

      <TextInput
        placeholder="Banner ID"
        value={bannerId}
        onChangeText={setBannerId}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      {!!message && <Text style={styles.message}>{message}</Text>}

      <Button
        title={loggingIn ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        disabled={loggingIn}
      />

      <View style={styles.linksRow}>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.linkText}>Create account</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/ResetPassword')}>
          <Text style={styles.linkText}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    padding: 12,
  },
  message: {
    marginBottom: 12,
    color: 'red',
  },
  linksRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkText: {
    color: '#0A84FF',
    fontWeight: '500',
  },
});
