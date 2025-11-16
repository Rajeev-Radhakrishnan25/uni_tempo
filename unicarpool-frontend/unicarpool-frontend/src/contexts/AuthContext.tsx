import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, UserRole } from '@/src/types/auth';
import { apiService } from '@/src/services/api';
import { storageService, STORAGE_KEYS } from '@/src/services/storage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  currentRole: UserRole | null;
  resetBannerId: string | null;
  resetVerificationCode: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' }
  | { type: 'SET_RESET_BANNER_ID'; payload: string | null }
  | { type: 'SET_RESET_VERIFICATION_CODE'; payload: string | null}
  | { type: 'SET_CURRENT_ROLE'; payload: UserRole };


interface AuthContextType extends AuthState {
  login: (user: User, token?: string) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  clearError: () => void;
  setCurrentRole: (role: UserRole) => Promise<void>;
  setResetBannerId: (bannerId: string | null) => void;
  setResetVerificationCode: (code: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        currentRole: action.payload.roles?.[0] || null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        currentRole: null,
      };
    case 'SET_CURRENT_ROLE':
      return {
        ...state,
        currentRole: action.payload,
      };
    case 'SET_RESET_BANNER_ID':
      return {
        ...state,
        resetBannerId: action.payload,
      };


    case 'SET_RESET_VERIFICATION_CODE':
      return{
        ...state,
        resetVerificationCode : action.payload,
      }
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  currentRole: null,
  resetBannerId: null,
  resetVerificationCode: null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (user: User, token?: string) => {
    dispatch({ type: 'SET_USER', payload: user });
    
    await storageService.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    if (token) {
      await apiService.setAuthToken(token);
    }
  };

  const logout = async () => {
    dispatch({ type: 'LOGOUT' });
    
    await storageService.clear();
    await apiService.clearAuthToken();
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const setCurrentRole = async (role: UserRole) => {
    dispatch({ type: 'SET_CURRENT_ROLE', payload: role });
    await storageService.setItem('current_role', role);
  };

  const setResetBannerId = (bannerId: string | null) => {
    dispatch({ type: 'SET_RESET_BANNER_ID', payload: bannerId });
  };

  const setResetVerificationCode = (code: string | null) => {
  dispatch({ type: 'SET_RESET_VERIFICATION_CODE', payload: code });
};


  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      setLoading(true);
      
      const [storedUser, storedToken, storedRole] = await Promise.all([
        storageService.getItem(STORAGE_KEYS.USER_DATA),
        apiService.getAuthToken(),
        storageService.getItem('current_role'),
      ]);

      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser) as User;
        dispatch({ type: 'SET_USER', payload: user });
        
        if (storedRole && user.roles?.includes(storedRole as UserRole)) {
          dispatch({ type: 'SET_CURRENT_ROLE', payload: storedRole as UserRole });
        }
      }
    } catch (error) {
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    setLoading,
    setError,
    clearError,
    setCurrentRole,
    setResetBannerId,
    setResetVerificationCode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}