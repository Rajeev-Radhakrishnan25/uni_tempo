import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useBookings } from '@/src/hooks/useBookings';
import { BookingCard } from '@/src/components/BookingCard';
import { bookingsStyles as styles } from '@/src/styles/screens/bookings.styles';

type TabType = 'current' | 'completed';

export default function BookingsScreen() {
  const router = useRouter();
  const { bookings, loading, refreshing, refresh, cancelBooking } = useBookings();
  const [activeTab, setActiveTab] = useState<TabType>('current');

  const currentBookings = bookings.current;
  const completedBookings = bookings.completed;
  const displayedBookings = activeTab === 'current' ? currentBookings : completedBookings;

  const renderEmptyState = () => {
    const isCurrentTab = activeTab === 'current';
    
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>{isCurrentTab ? '🎒' : '✅'}</Text>
        <Text style={styles.emptyTitle}>
          {isCurrentTab ? 'No Current Bookings' : 'No Completed Rides'}
        </Text>
        <Text style={styles.emptyDescription}>
          {isCurrentTab
            ? 'Book your first ride to get started on your journey!'
            : "You haven't completed any rides yet."}
        </Text>
      </View>
    );
  };

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0A84FF" />
      <Text style={styles.loadingText}>Loading bookings...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Bookings</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'current' && styles.activeTab]}
            onPress={() => setActiveTab('current')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'current' && styles.activeTabText,
              ]}
            >
              Current
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
            onPress={() => setActiveTab('completed')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'completed' && styles.activeTabText,
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {loading && !refreshing ? (
          renderLoadingState()
        ) : (
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                tintColor="#0A84FF"
                colors={['#0A84FF']}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {displayedBookings.length === 0 ? (
              renderEmptyState()
            ) : (
              displayedBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={cancelBooking}
                  showCancelButton={activeTab === 'current'}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}