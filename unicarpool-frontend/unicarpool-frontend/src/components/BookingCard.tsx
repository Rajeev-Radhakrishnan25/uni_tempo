import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Booking } from '@/src/types/booking';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (bookingId: number) => void;
  showCancelButton?: boolean;
}

export function BookingCard({ booking, onCancel, showCancelButton = false }: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return '#34C759';
      case 'PENDING':
        return '#FF9500';
      case 'COMPLETED':
        return '#0A84FF';
      case 'DECLINED':
      case 'CANCELLED':
        return '#FF3B30';
      default:
        return '#999';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
    return date.toLocaleString('en-US', options);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(booking.status) },
            ]}
          />
          <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
            {getStatusText(booking.status)}
          </Text>
        </View>
        <Text style={styles.bookingId}>#{booking.id}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>From</Text>
              <Text style={styles.locationText}>{booking.departureLocation}</Text>
            </View>
          </View>

          <View style={styles.dividerLine} />

          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>🎯</Text>
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>To</Text>
              <Text style={styles.locationText}>{booking.destination}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🚗</Text>
            <Text style={styles.detailLabel}>Driver:</Text>
            <Text style={styles.detailValue}>{booking.driverName}</Text>
          </View>

          {booking.driverPhone && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📞</Text>
              <Text style={styles.detailLabel}>Phone:</Text>
              <Text style={styles.detailValue}>{booking.driverPhone}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🕐</Text>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>{formatDateTime(booking.departureDateTime)}</Text>
          </View>

          {booking.meetingPoint && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📌</Text>
              <Text style={styles.detailLabel}>Meeting:</Text>
              <Text style={styles.detailValue}>{booking.meetingPoint}</Text>
            </View>
          )}

          {booking.message && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>Your Message:</Text>
              <Text style={styles.messageText}>{booking.message}</Text>
            </View>
          )}
        </View>

        {showCancelButton && booking.status === 'ACCEPTED' && onCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => onCancel(booking.id)}
          >
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bookingId: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  locationDetails: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
    marginLeft: 32,
  },
  detailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
    width: 60,
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  messageContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
});