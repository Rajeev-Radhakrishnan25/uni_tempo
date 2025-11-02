import React, { useState } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';

export default function Driver() {
  const [requests, setRequests] = useState([
    { id: '1', passenger: 'Hema', ride: 'Studly Campus to Sexton Campus', status: 'pending' },
    { id: '2', passenger: 'Divyaxi', ride: 'Mumford Terminal to Lacewood Terminal', status: 'pending' },
  ]);

  const handleRequest = (id, action) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: action } : req
      )
    );
    alert(`Request ${action}!`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pending Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>Passenger: {item.passenger}</Text>
            <Text style={styles.text}>Ride: {item.ride}</Text>
            {item.status === 'pending' ? (
              <>
                <Button
                  title="Accept"
                  onPress={() => handleRequest(item.id, 'accepted')}
                />
                <View style={{ marginVertical: 5 }} />
                <Button
                  title="Decline"
                  color="red"
                  onPress={() => handleRequest(item.id, 'declined')}
                />
              </>
            ) : (
              <Text>Status: {item.status.toUpperCase()}</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  text: { marginBottom: 5 },
});
