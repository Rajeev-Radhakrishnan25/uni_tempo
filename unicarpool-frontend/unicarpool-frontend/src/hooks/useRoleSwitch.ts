import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { authService } from '@/src/services/auth';
import { UserRole, ApiError } from '@/src/types/auth';

export function useRoleSwitch() {
  const { user, setLoading, setError, clearError, login, currentRole, setCurrentRole } = useAuth();

  useEffect(() => {
    const updateRole = async () => {
      if (user?.roles && user.roles.length > 0) {
        // If current role is not available, switch to first available role
        if (!currentRole || !user.roles.includes(currentRole)) {
          await setCurrentRole(user.roles[0]);
        }
      }
    };
    
    updateRole();
  }, [user?.roles, currentRole, setCurrentRole]);

  const switchRole = async (role: UserRole) => {
    if (user?.roles?.includes(role)) {
      await setCurrentRole(role);
    } else {
      showAddRoleConfirmation(role);
    }
  };

  const showAddRoleConfirmation = (role: UserRole) => {
    const roleText = role === 'DRIVER' ? 'Driver' : 'Rider';
    const currentRoleText = currentRole === 'DRIVER' ? 'Driver' : 'Rider';
    
    Alert.alert(
      `Become a ${roleText}`,
      `You're currently registered as a ${currentRoleText}. Would you like to also register as a ${roleText}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: `Yes, Add ${roleText}`,
          onPress: () => addRole(role),
        },
      ]
    );
  };

  const addRole = async (role: UserRole) => {
    try {
      setLoading(true);
      clearError();

      await authService.addUserRole({ role });

      if (user) {
        const updatedUser = {
          ...user,
          roles: [...user.roles, role],
        };
        
        const token = await import('@/src/services/api').then(m => m.apiService.getAuthToken());
        await login(updatedUser, token || undefined);
        
        await setCurrentRole(role);
        
        Alert.alert(
          'Success! 🎉',
          `You're now registered as both a ${user.roles.join(' and ')}!`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Failed to add role');
      
      Alert.alert(
        'Error',
        apiError.message || 'Failed to add role. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const canSwitchTo = (role: UserRole): boolean => {
    return user?.roles?.includes(role) || false;
  };

  const getAvailableRoles = (): UserRole[] => {
    return user?.roles || [];
  };

  const getMissingRoles = (): UserRole[] => {
    const allRoles: UserRole[] = ['RIDER', 'DRIVER'];
    return allRoles.filter(role => !user?.roles?.includes(role));
  };

  return {
    currentRole: currentRole || 'RIDER',
    switchRole,
    canSwitchTo,
    getAvailableRoles,
    getMissingRoles,
    addRole,
  };
}