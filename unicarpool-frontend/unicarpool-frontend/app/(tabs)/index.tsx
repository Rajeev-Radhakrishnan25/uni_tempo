import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [banner_Id, setBannerId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role,setRole] = useState('RIDER');
  const [message, setMessage] = useState('');
  const router = useRouter();


  const handleRegister = async () => {
    try {
        const response = await axios.post('http://localhost:8080/api/v1/user/register', {
        banner_id: banner_Id,
        full_name: name,
        school_email: email.toLowerCase(),
        phone_number: phone_number,
        password: password,
        selected_role: role,
      });
      setMessage('Registration successful!');
    } catch (error : any) {
      setMessage('Error: Could not register.');
      setMessage(error.response?.data?.message + "\n" || error.message);
    }
  };

  
  return (
    <View style={{flex: 1, backgroundColor : 'white', padding: 20 }}>
      <TextInput placeholder="banner_Id" onChangeText={setBannerId} style={{ marginBottom: 10, borderWidth: 1, padding: 10 }} />
      <TextInput placeholder="name" onChangeText={setName} style={{ marginBottom: 10, borderWidth: 1, padding: 10 }} />
      <TextInput placeholder="email" onChangeText={setEmail} style={{ marginBottom: 10, borderWidth: 1, padding: 10 }} />
      <TextInput placeholder="phone_number" onChangeText={setPhoneNumber} style={{ marginBottom: 10, borderWidth: 1, padding: 10 }} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} style={{ marginBottom: 10, borderWidth: 1, padding: 10 }} />
      <Text>Role:</Text>
      <Picker selectedValue={role} onValueChange={(itemValue) => setRole(itemValue)} style={{ marginBottom: 20 }}>
        <Picker.Item label="RIDER" value="RIDER" />
        <Picker.Item label="DRIVER" value="DRIVER" />
      </Picker>
      <Button title="Register" onPress={handleRegister} />
      {message ? <Text style={{ marginTop: 20 }}>{message}</Text> : null}


      <Text
       onPress={() => router.push('../ResetPassword')}>
         Forgot Password? Reset Here!
       </Text>
    </View>
  );
}


