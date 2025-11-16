
import { use, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { authService } from '@/src/services/auth';
import { profileStyles as styles } from '@/src/styles/screens/profile.styles';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    View,
    Text,
    Alert
} from 'react-native';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';

export default function PasswordScreen() {
    const {resetBannerId, resetVerificationCode} = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = async () => {

        if (!resetBannerId) {
            alert('BannerID is not correct or does not exist');
            return;
        }
         if (!resetVerificationCode) {
            alert('User has not been verified');
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

    try{
        await authService.recoverPassword({
        banner_id: resetBannerId,
        verification_code: resetVerificationCode,
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
      alert(errorMsg);
    }  

};

return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
    <ScrollView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.userName}>Account Password Recovery</Text>
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
            </View>
            <Button
                title="Change Password"
                onPress={handleChangePassword}
            />
        </View>
    </ScrollView>
    </KeyboardAvoidingView>
);
}