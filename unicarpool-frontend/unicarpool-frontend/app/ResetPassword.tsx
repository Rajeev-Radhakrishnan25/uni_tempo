import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import axios from 'axios';


export default function ResetPasswordScreen() {
    const[banner_Id, setBannerId] = useState('');
    const[password, setPassword] = useState('');
    const[confirmPassword, setConfirmPassword] = useState('');
    const[message, setMessage] = useState('');


    const handleResetPassword = async () => {

        if(password.length < 8) {
            setMessage('Error: Password must be at least 8 characters long.');
            return;
        }
        if (password !== confirmPassword) {
            setMessage('Error: Passwords do not match.');
            return;
        }
        try {
            const response = await axios.post('http://localhost:8080/api/v1/user/reset-password', {
                banner_Id: banner_Id,
                password: password,
            });
            setMessage('Password reset successful!');
        } catch (error : any) {
            setMessage('Error: Could not reset password.');
            setMessage(error.response?.data?.message + "\n" || error.message);
        }
    };

    return (
        <View style={{flex: 1, backgroundColor : 'white', padding: 20 }}>
            <TextInput placeholder="banner_Id" onChangeText={setBannerId} style={{ marginBottom: 10, borderWidth: 1, padding: 10 }} />
            <TextInput placeholder="New Password" secureTextEntry onChangeText={setPassword} style={{ marginBottom: 10, borderWidth: 1, padding: 10 }} />
            <TextInput placeholder="Confirm Password" secureTextEntry onChangeText={setConfirmPassword} style={{ marginBottom: 10, borderWidth: 1, padding: 10 }} />
            <Button title="Reset Password" onPress={handleResetPassword} />
            {message ? <Text style={{ marginTop: 20 }}>{message}</Text> : null}
        </View>

    );
}