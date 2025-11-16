import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/contexts/AuthContext";
import { useRoleSwitch } from "@/src/hooks/useRoleSwitch";
import { rideService } from "@/src/services/ride";
import { createRideStyles as styles } from "@/src/styles/screens/createRide.styles";

export default function CreateRide() {
  const router = useRouter();
  const { currentRole } = useRoleSwitch();

  // Form state
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState(new Date());
  const [departureTime, setDepartureTime] = useState(new Date());
  const [availableSeats, setAvailableSeats] = useState<number | null>(null);
  const [meetingPoint, setMeetingPoint] = useState("");
  const [rideConditions, setRideConditions] = useState("");

  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if not a driver
  useEffect(() => {
    if (currentRole !== 'DRIVER') {
      Alert.alert(
        "Access Denied",
        "Only drivers can create rides. Please switch to driver mode.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    }
  }, [currentRole]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!departure.trim()) {
      newErrors.departure = "Departure location is required";
    }
    if (!destination.trim()) {
      newErrors.destination = "Destination is required";
    }
    if (!availableSeats || availableSeats < 1 || availableSeats > 8) {
      newErrors.availableSeats = "Please select 1-8 seats";
    }
    if (!meetingPoint.trim()) {
      newErrors.meetingPoint = "Meeting point is required";
    }

    // Validate date/time is in the future
    const selectedDateTime = new Date(departureDate);
    selectedDateTime.setHours(departureTime.getHours());
    selectedDateTime.setMinutes(departureTime.getMinutes());
    
    if (selectedDateTime <= new Date()) {
      newErrors.dateTime = "Departure time must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePostRide = async () => {
    if (currentRole !== 'DRIVER') {
      Alert.alert("Access Denied", "Only drivers can create rides.");
      return;
    }

    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fill in all required fields correctly.");
      return;
    }

    try {
      setLoading(true);

      // Combine date and time into ISO 8601 format
      const combinedDateTime = new Date(departureDate);
      combinedDateTime.setHours(departureTime.getHours());
      combinedDateTime.setMinutes(departureTime.getMinutes());
      combinedDateTime.setSeconds(0);

      const rideData = {
        departure_location: departure.trim(),
        destination: destination.trim(),
        departure_date_time: combinedDateTime.toISOString(),
        available_seats: availableSeats!,
        meeting_point: meetingPoint.trim(),
        ride_conditions: rideConditions.trim() || undefined,
      };

      const response = await rideService.createRide(rideData);

      // Format the departure time for display
      const departureDateTime = new Date(response.departure_date_time);
      const formattedDate = departureDateTime.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      const formattedTime = departureDateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });

      Alert.alert(
        "Success! 🎉",
        `Your ride from ${response.departure_location} to ${response.destination} on ${formattedDate} at ${formattedTime} has been posted!\n\nRide ID: #${response.id}`,
        [
          {
            text: "View My Rides",
            onPress: () => {
              // Reset form
              setDeparture("");
              setDestination("");
              setDepartureDate(new Date());
              setDepartureTime(new Date());
              setAvailableSeats(null);
              setMeetingPoint("");
              setRideConditions("");
              setErrors({});
              
              // Navigate to driver dashboard
              router.push("/(tabs)/driver");
            }
          },
          {
            text: "Create Another",
            style: "cancel",
            onPress: () => {
              // Reset form
              setDeparture("");
              setDestination("");
              setDepartureDate(new Date());
              setDepartureTime(new Date());
              setAvailableSeats(null);
              setMeetingPoint("");
              setRideConditions("");
              setErrors({});
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to create ride. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Limit date selection
  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 1);

  // Don't render if not a driver
  if (currentRole !== 'DRIVER') {
    return (
      <View style={styles.accessDeniedContainer}>
        <Text style={styles.accessDeniedIcon}>🚫</Text>
        <Text style={styles.accessDeniedText}>Access Denied</Text>
        <Text style={styles.accessDeniedSubtext}>
          Driver role required to create rides
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>🚗</Text>
          <Text style={styles.title}>Create Ride Offer</Text>
          <Text style={styles.subtitle}>Share your ride with fellow students</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              Create a ride offer and connect with students heading the same way!
            </Text>
          </View>

          {/* Route Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Route Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Departure Location <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.departure && styles.inputError]}
                placeholder="e.g., Downtown Halifax"
                placeholderTextColor="#999"
                value={departure}
                onChangeText={(text) => {
                  setDeparture(text);
                  if (errors.departure) {
                    setErrors({ ...errors, departure: "" });
                  }
                }}
              />
              {errors.departure && (
                <Text style={styles.errorText}>{errors.departure}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Destination <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.destination && styles.inputError]}
                placeholder="e.g., Dartmouth"
                placeholderTextColor="#999"
                value={destination}
                onChangeText={(text) => {
                  setDestination(text);
                  if (errors.destination) {
                    setErrors({ ...errors, destination: "" });
                  }
                }}
              />
              {errors.destination && (
                <Text style={styles.errorText}>{errors.destination}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Meeting Point <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.meetingPoint && styles.inputError]}
                placeholder="e.g., DALPLEX"
                placeholderTextColor="#999"
                value={meetingPoint}
                onChangeText={(text) => {
                  setMeetingPoint(text);
                  if (errors.meetingPoint) {
                    setErrors({ ...errors, meetingPoint: "" });
                  }
                }}
              />
              {errors.meetingPoint && (
                <Text style={styles.errorText}>{errors.meetingPoint}</Text>
              )}
            </View>
          </View>

          {/* Date & Time Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🕐 Departure Time</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Date <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={[styles.pickerButton, errors.dateTime && styles.inputError]}
              >
                <Text style={styles.pickerIcon}>📅</Text>
                <Text style={styles.pickerText}>
                  {departureDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
                <Text style={styles.pickerArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Time <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={[styles.pickerButton, errors.dateTime && styles.inputError]}
              >
                <Text style={styles.pickerIcon}>⏰</Text>
                <Text style={styles.pickerText}>
                  {departureTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
                <Text style={styles.pickerArrow}>▼</Text>
              </TouchableOpacity>
              {errors.dateTime && (
                <Text style={styles.errorText}>{errors.dateTime}</Text>
              )}
            </View>
          </View>

          {/* Seats Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🪑 Available Seats</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Number of Seats <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.seatsContainer}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.seatButton,
                      availableSeats === num && styles.seatButtonSelected,
                    ]}
                    onPress={() => {
                      setAvailableSeats(num);
                      if (errors.availableSeats) {
                        setErrors({ ...errors, availableSeats: "" });
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.seatButtonText,
                        availableSeats === num && styles.seatButtonTextSelected,
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.availableSeats && (
                <Text style={styles.errorText}>{errors.availableSeats}</Text>
              )}
            </View>
          </View>

          {/* Additional Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Additional Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ride Conditions (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., No AC, Pet-friendly, etc."
                placeholderTextColor="#999"
                value={rideConditions}
                onChangeText={setRideConditions}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Ride Summary Preview */}
          {departure && destination && availableSeats && meetingPoint && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Ride Summary</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>From:</Text>
                  <Text style={styles.summaryValue}>{departure}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>To:</Text>
                  <Text style={styles.summaryValue}>{destination}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Date:</Text>
                  <Text style={styles.summaryValue}>
                    {departureDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Time:</Text>
                  <Text style={styles.summaryValue}>
                    {departureTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Seats:</Text>
                  <Text style={styles.summaryValue}>{availableSeats} available</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Meeting Point:</Text>
                  <Text style={styles.summaryValue}>{meetingPoint}</Text>
                </View>
                {rideConditions && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Conditions:</Text>
                    <Text style={styles.summaryValue}>{rideConditions}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Create Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.createButton,
              (loading || !departure || !destination || !availableSeats || !meetingPoint) && 
              styles.createButtonDisabled
            ]}
            onPress={handlePostRide}
            disabled={loading || !departure || !destination || !availableSeats || !meetingPoint}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.createButtonText}>Create Ride Offer</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={departureDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={minDate}
          maximumDate={maxDate}
          onChange={(_event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              if (selectedDate < minDate) {
                Alert.alert("Invalid Date", "You cannot select a past date.");
                return;
              }
              setDepartureDate(selectedDate);
              if (errors.dateTime) {
                setErrors({ ...errors, dateTime: "" });
              }
            }
          }}
        />
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={departureTime}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              const now = new Date();
              const chosenDateTime = new Date(departureDate);
              chosenDateTime.setHours(selectedTime.getHours());
              chosenDateTime.setMinutes(selectedTime.getMinutes());
              chosenDateTime.setSeconds(0);

              const isToday =
                departureDate.getDate() === now.getDate() &&
                departureDate.getMonth() === now.getMonth() &&
                departureDate.getFullYear() === now.getFullYear();

              if (isToday && chosenDateTime < now) {
                Alert.alert(
                  "Invalid Time",
                  "You cannot select a past time for today."
                );
                return;
              }

              setDepartureTime(chosenDateTime);
              if (errors.dateTime) {
                setErrors({ ...errors, dateTime: "" });
              }
            }
          }}
        />
      )}
    </View>
  );
}
