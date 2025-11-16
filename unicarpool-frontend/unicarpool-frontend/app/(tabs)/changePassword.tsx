
import { View, Text, Button, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { useState } from 'react';
import { authService } from '@/src/services/auth';
import { router } from 'expo-router';
import { profileStyles as styles } from '@/src/styles/screens/profile.styles';
import { Input } from '@/src/components/ui/Input';


export default function ChangePasswordScreen() {
    const { user } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = async () => {
        const bannerId = user?.bannerId;
        if (!bannerId) {
            alert('User not authenticated');
            return;
        }

        if (password.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            await authService.changePassword({ banner_id: bannerId, password });
            alert('Password changed successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to change password');
        }
    };

return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.userName}>Change Password</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Input
              label="New Password"
              placeholder="Enter your new password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter your new password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <Button
              title="Change Password"
              onPress={handleChangePassword}
            />

            <View style={{ marginTop: 16 }} />

            <Button
              title="Cancel"
              onPress={() => router.back()}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}