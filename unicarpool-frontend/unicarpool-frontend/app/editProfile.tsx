import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { authService } from '@/src/services/auth';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { profileStyles as styles } from '@/src/styles/screens/profile.styles';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, login } = useAuth();
  
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    
    if (!fullName.trim() || !email.trim() || !phoneNumber.trim()) {
      setError('All fields are required');
      return;
    }

    if (!email.toLowerCase().endsWith('@dal.ca')) {
      setError('Please use your @dal.ca email');
      return;
    }

    try {
      setLoading(true);
      
      const response = await authService.updateProfile({
        full_name: fullName,
        school_email: email,
        phone_number: phoneNumber,
      });

      const updatedUser = {
        id: response.id,
        bannerId: response.banner_id,
        name: response.name,
        email: response.email,
        roles: response.roles,
        phone_number: response.phone_number,
        banner_id: response.banner_id,
        email_verified: response.email_verified,
      };

      await login(updatedUser);

      Alert.alert(
        'Success',
        'Profile updated successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.userName}>Edit Profile</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              editable={!loading}
            />

            <Input
              label="University Email"
              placeholder="yourname@dal.ca"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />

            <Input
              label="Phone Number"
              placeholder="e.g., +1234567890"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              editable={!loading}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
            />

            <Button
              title="Cancel"
              onPress={() => router.back()}
              variant="outline"
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
