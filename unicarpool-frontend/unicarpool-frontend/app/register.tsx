import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [bannerId, setBannerId] = useState('');
  const [fullName, setFullName] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'RIDER' | 'DRIVER'>('RIDER');

  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const validate = () => {
    if (!bannerId || !fullName || !schoolEmail || !phoneNumber || !password) {
      return 'All fields are required.';
    }

    // @dal.ca email check
    const lowered = schoolEmail.trim().toLowerCase();
    if (!lowered.endsWith('@dal.ca')) {
      return 'Please use your @dal.ca email.';
    }

    if (phoneNumber.length < 7) {
      return 'Please enter a valid phone number.';
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

      const response = await axios.post('http://localhost:8080/api/v1/user/register', {
        banner_id: bannerId,
        full_name: fullName,
        school_email: schoolEmail.trim().toLowerCase(),
        phone_number: phoneNumber,
        password: password,
        selected_role: role,
      });

      console.log('Register response:', response.data);

      Alert.alert(
        'Success',
        'Account created. Please log in.',
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create your account</Text>

      <TextInput
        placeholder="Banner ID"
        value={bannerId}
        onChangeText={setBannerId}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Full name"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />

      <TextInput
        placeholder="University email (@dal.ca)"
        value={schoolEmail}
        onChangeText={setSchoolEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Phone number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        style={styles.input}
        keyboardType="phone-pad"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <Text style={styles.label}>Role</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={role}
          onValueChange={(val) => setRole(val)}
        >
          <Picker.Item label="RIDER" value="RIDER" />
          <Picker.Item label="DRIVER" value="DRIVER" />
        </Picker>
      </View>

      {!!message && <Text style={styles.message}>{message}</Text>}

      <Button
        title={submitting ? 'Registering...' : 'Register'}
        onPress={handleRegister}
        disabled={submitting}
      />

      <TouchableOpacity onPress={() => router.push('/ResetPassword')}>
        <Text style={styles.linkText}>Forgot Password? Reset Here!</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/login')}>
        <Text style={[styles.linkText, { marginTop: 8 }]}>
          Already have an account? Log in
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 24,
    paddingTop: 64,
  },
  header: {
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
  label: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '500',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    marginBottom: 20,
    overflow: 'hidden',
  },
  message: {
    color: 'red',
    marginBottom: 12,
  },
  linkText: {
    marginTop: 20,
    color: '#0A84FF',
    fontWeight: '500',
    textAlign: 'center',
  },
});
