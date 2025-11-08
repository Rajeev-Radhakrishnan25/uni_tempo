import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoleSwitch } from '@/src/hooks/useRoleSwitch';
import { UserRole } from '@/src/types/auth';

interface RoleSwitcherProps {
  style?: any;
  showAddButton?: boolean;
}

export function RoleSwitcher({ style, showAddButton = true }: RoleSwitcherProps) {
  const { currentRole, switchRole, canSwitchTo, getMissingRoles } = useRoleSwitch();

  const roles: { role: UserRole; label: string; icon: string }[] = [
    { role: 'RIDER', label: 'Rider', icon: '🎒' },
    { role: 'DRIVER', label: 'Driver', icon: '🚗' },
  ];

  const missingRoles = getMissingRoles();

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Switch Mode</Text>
      
      <View style={styles.roleButtons}>
        {roles.map(({ role, label, icon }) => {
          const isActive = currentRole === role;
          const canSwitch = canSwitchTo(role);
          const isMissing = missingRoles.includes(role);

          return (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleButton,
                isActive && styles.activeRole,
                !canSwitch && styles.disabledRole,
              ]}
              onPress={async () => await switchRole(role)}
              disabled={!canSwitch && !isMissing}
            >
              <Text style={styles.roleIcon}>{icon}</Text>
              <Text
                style={[
                  styles.roleLabel,
                  isActive && styles.activeRoleText,
                  !canSwitch && styles.disabledRoleText,
                ]}
              >
                {label}
              </Text>
              {isMissing && showAddButton && (
                <Text style={styles.addText}>+ Add</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeRole: {
    backgroundColor: '#0A84FF',
    borderColor: '#0A84FF',
  },
  disabledRole: {
    backgroundColor: '#F0F0F0',
    opacity: 0.6,
  },
  roleIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  activeRoleText: {
    color: 'white',
  },
  disabledRoleText: {
    color: '#999',
  },
  addText: {
    fontSize: 10,
    color: '#0A84FF',
    fontWeight: '600',
    marginTop: 2,
  },
});