import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { useRoleSwitch } from '@/src/hooks/useRoleSwitch';
import { Button } from '@/src/components/ui/Button';
import { RoleSwitcher } from '@/src/components/RoleSwitcher';
import { profileStyles as styles } from '@/src/styles/screens/profile.styles';
import { useState } from 'react';
import { bookingService } from '@/src/services/booking';


export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, currentRole} = useAuth();
  const { getMissingRoles, addRole } = useRoleSwitch();
  const [isAvailable, setIsAvailable] = useState(false);
  const showDriverToggle = currentRole === 'DRIVER';


  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const missingRoles = getMissingRoles();

  const toggleAvailability = async () => {
    try {
      const res = await bookingService.toggleDriverAvailability(isAvailable);

      setIsAvailable((prev) => !prev);

      alert(res.message || `Driver is now ${!isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}`);
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      alert('Failed to update driver availability');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase()}</Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Text style={styles.bannerId}>Banner ID: {user?.bannerId}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Role Management</Text>
          <RoleSwitcher showAddButton={true} />
          
          {missingRoles.length > 0 && (
            <View style={styles.addRoleSection}>
              <Text style={styles.addRoleTitle}>Available Roles to Add:</Text>
              {missingRoles.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={styles.addRoleButton}
                  onPress={() => addRole(role)}
                >
                  <Text style={styles.addRoleIcon}>
                    {role === 'DRIVER' ? '🚗' : '🎒'}
                  </Text>
                  <Text style={styles.addRoleText}>
                    Become a {role === 'DRIVER' ? 'Driver' : 'Rider'}
                  </Text>
                  <Text style={styles.addRoleArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Roles</Text>
          <View style={styles.rolesContainer}>
            {user?.roles?.map((role) => (
              <View key={role} style={styles.roleChip}>
                <Text style={styles.roleChipIcon}>
                  {role === 'DRIVER' ? '🚗' : '🎒'}
                </Text>
                <Text style={styles.roleChipText}>{role}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/(tabs)/editProfile')}
          >
            <Text style={styles.settingIcon}>✏️</Text>
            <Text style={styles.settingText}>Edit Profile</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/(tabs)/changePassword')}            
          >
            <Text style={styles.settingIcon}>🔒</Text>
            <Text style={styles.settingText}>Change Password</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          {showDriverToggle && (
          <TouchableOpacity
            onPress={toggleAvailability}
            style={styles.settingItem}
          >
            <Text style={styles.settingIcon}>🚦</Text>
            <Text style={styles.settingText}>
              {isAvailable ? "Go Offline" : "Go Online"}
            </Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingIcon}>❓</Text>
            <Text style={styles.settingText}>Help & Support</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

        </View>

        <View style={styles.section}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
          />
        </View>
      </View>
    </ScrollView>
  );
}
