import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, type User as ApiUser, type CreateUserDto, type UpdateUserDto } from '@/services/api';
import { STORAGE_KEYS, DEFAULT_BUSINESS, DEFAULT_RECEIPT, DEFAULT_DEVICES } from './types';
import type { BusinessSettings, ReceiptSettings, DeviceSettings, User } from './types';

// Generic localStorage loader
export const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Generic localStorage saver
export const saveToStorage = <T,>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

// Convert API user to local user format
const apiUserToLocal = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  name: apiUser.name,
  role: apiUser.role as 'admin' | 'manager' | 'cashier' | 'waiter',
  pin: '', // PIN is not returned from API for security
  active: apiUser.isActive,
});

// Custom hook for settings with auto-save
export function useSettingsStorage() {
  const queryClient = useQueryClient();
  
  const [business, setBusiness] = useState<BusinessSettings>(() => 
    loadFromStorage(STORAGE_KEYS.BUSINESS, DEFAULT_BUSINESS)
  );
  const [receipt, setReceipt] = useState<ReceiptSettings>(() => 
    loadFromStorage(STORAGE_KEYS.RECEIPT, DEFAULT_RECEIPT)
  );
  const [devices, setDevices] = useState<DeviceSettings>(() => 
    loadFromStorage(STORAGE_KEYS.DEVICES, DEFAULT_DEVICES)
  );
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Fetch users from API
  const { data: apiUsers = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(true), // Include inactive users
    retry: 3,
    retryDelay: 1000,
  });

  // Log errors for debugging
  if (usersError) {
    console.error('Users fetch error:', usersError);
  }

  // Convert API users to local format
  const users: User[] = apiUsers.map(apiUserToLocal);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserDto) => usersApi.create(data),
    onSuccess: () => {
      console.log('User created successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('User creation failed:', error);
      alert(`Kullanıcı eklenemedi: ${error.message}`);
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) => usersApi.update(id, data),
    onSuccess: () => {
      console.log('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('User update failed:', error);
      alert(`Kullanıcı güncellenemedi: ${error.message}`);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      console.log('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('User deletion failed:', error);
      alert(`Kullanıcı silinemedi: ${error.message}`);
    },
  });

  // Auto-save effect for local settings
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(business));
        localStorage.setItem(STORAGE_KEYS.RECEIPT, JSON.stringify(receipt));
        localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [business, receipt, devices]);

  // User management functions
  const addUser = useCallback((user: Omit<User, 'id'>) => {
    createUserMutation.mutate({
      name: user.name,
      pin: user.pin,
      role: user.role,
    });
  }, [createUserMutation]);

  const updateUser = useCallback((user: User) => {
    const updateData: UpdateUserDto = {
      name: user.name,
      role: user.role,
      isActive: user.active,
    };
    // Only include PIN if it's provided (not empty)
    if (user.pin && user.pin.length >= 4) {
      updateData.pin = user.pin;
    }
    updateUserMutation.mutate({ id: user.id, data: updateData });
  }, [updateUserMutation]);

  const deleteUser = useCallback((id: string) => {
    deleteUserMutation.mutate(id);
  }, [deleteUserMutation]);

  const toggleUserActive = useCallback((id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      updateUserMutation.mutate({ 
        id, 
        data: { isActive: !user.active } 
      });
    }
  }, [users, updateUserMutation]);

  return {
    business,
    setBusiness,
    receipt,
    setReceipt,
    devices,
    setDevices,
    users,
    usersLoading,
    usersError,
    saveStatus,
    addUser,
    updateUser,
    deleteUser,
    toggleUserActive,
  };
}
