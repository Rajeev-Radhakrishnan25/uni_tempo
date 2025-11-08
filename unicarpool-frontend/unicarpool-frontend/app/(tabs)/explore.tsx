import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRoleSwitch } from '@/src/hooks/useRoleSwitch';
import { exploreStyles as styles } from '@/src/styles/screens/explore.styles';

export default function RideScreen() {
  const { currentRole } = useRoleSwitch();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {currentRole === 'RIDER' ? 'Find Rides' : 'Create Ride'}
        </Text>
        <Text style={styles.subtitle}>
          {currentRole === 'RIDER' 
            ? 'Discover available rides to your destination'
            : 'Offer a ride to fellow students'
          }
        </Text>
      </View>

      <View style={styles.content}>
        {currentRole === 'RIDER' ? (
          <>
            <View style={styles.searchSection}>
              <Text style={styles.sectionTitle}>Search Rides</Text>
              
              <View style={styles.searchCard}>
                <Text style={styles.searchIcon}>📍</Text>
                <View style={styles.searchContent}>
                  <Text style={styles.searchLabel}>From</Text>
                  <Text style={styles.searchPlaceholder}>Select pickup location</Text>
                </View>
              </View>
              
              <View style={styles.searchCard}>
                <Text style={styles.searchIcon}>🎯</Text>
                <View style={styles.searchContent}>
                  <Text style={styles.searchLabel}>To</Text>
                  <Text style={styles.searchPlaceholder}>Select destination</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.searchButton}>
                <Text style={styles.searchButtonText}>Search Rides</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.ridesSection}>
              <Text style={styles.sectionTitle}>Available Rides</Text>
              
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🚗</Text>
                <Text style={styles.emptyTitle}>No rides found</Text>
                <Text style={styles.emptyDescription}>
                  Try searching for rides or check back later for new offers
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.searchSection}>
              <Text style={styles.sectionTitle}>Ride Details</Text>
              
              <View style={styles.searchCard}>
                <Text style={styles.searchIcon}>📍</Text>
                <View style={styles.searchContent}>
                  <Text style={styles.searchLabel}>From</Text>
                  <Text style={styles.searchPlaceholder}>Select pickup location</Text>
                </View>
              </View>
              
              <View style={styles.searchCard}>
                <Text style={styles.searchIcon}>🎯</Text>
                <View style={styles.searchContent}>
                  <Text style={styles.searchLabel}>To</Text>
                  <Text style={styles.searchPlaceholder}>Select destination</Text>
                </View>
              </View>
              
              <View style={styles.searchCard}>
                <Text style={styles.searchIcon}>👥</Text>
                <View style={styles.searchContent}>
                  <Text style={styles.searchLabel}>Available Seats</Text>
                  <Text style={styles.searchPlaceholder}>Select number of seats</Text>
                </View>
              </View>
              
              <View style={styles.searchCard}>
                <Text style={styles.searchIcon}>🕐</Text>
                <View style={styles.searchContent}>
                  <Text style={styles.searchLabel}>Departure Time</Text>
                  <Text style={styles.searchPlaceholder}>Select time</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.searchButton}>
                <Text style={styles.searchButtonText}>Create Ride</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.ridesSection}>
              <Text style={styles.sectionTitle}>Your Active Rides</Text>
              
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🚗</Text>
                <Text style={styles.emptyTitle}>No active rides</Text>
                <Text style={styles.emptyDescription}>
                  Create your first ride offer to help fellow students
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
