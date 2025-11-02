import React, { useState } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';

export default function Passenger() {
  const [rides, setRides] = useState([
    { id: '1', from: 'Studly Campus ', to: 'Sexton Campus ', seats: 3, requested: false },
    { id: '2', from: 'Mumford Terminal ', to: 'Lacewood Terminal ', seats: 2, requested: false },
  ]);

  const requestRide = (id) => {
    setRides((prev) =>
      prev.map((ride) =>
        ride.id === id ? { ...ride, requested: true } : ride
      )
    );
    alert('Request is sent to the Driver.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Rides</Text>
      <FlatList
        data={rides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.rideCard}>
            <Text style={styles.text}>From: {item.from}</Text>
            <Text style={styles.text}>To: {item.to}</Text>
            <Text style={styles.text}>Seats: {item.seats}</Text>
            <Button
              title={item.requested ? 'Pending Confirmation' : 'Request Ride'}
              disabled={item.requested}
              onPress={() => requestRide(item.id)}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  rideCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  text: { marginBottom: 5 },
});
