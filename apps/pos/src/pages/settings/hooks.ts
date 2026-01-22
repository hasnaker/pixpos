import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, settingsApi, type User as ApiUser, type CreateUserDto, type UpdateUserDto, type BusinessSettings, type ReceiptSettings, type DeviceSettings } from '@/services/api';

// Re-export types from API
export type { BusinessSettings, ReceiptSettings, DeviceSettings };

// User type for local use
export interface User {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'cashier' | 'waiter';
  pin: string;
  active: boolean;
}

// Convert API user to local user format
const apiUserToLocal = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  name: apiUser.name,
  role: apiUser.role as 'admin' | 'manager' | 'cashier' | 'waiter',
  pin: '', // PIN is not returned from API for security
  active: apiUser.isActive,
});

// Custom hook for settings - ALL FROM API
export function useSettingsStorage() {
  const queryClient = useQueryClient();
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Fetch all settings from API
  const { data: allSettings, isLoading: settingsLoading, error: settingsError } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getAll,
    retry: 3,
    retryDelay: 1000,
  });

  // Local state initialized from API
  const [business, setBusinessLocal] = useState<BusinessSettings>({
    storeName: '',
    logoUrl: '',
    address: '',
    phone: '',
    email: '',
    taxNumber: '',
    displayVideos: [],
  });
  const [receipt, setReceiptLocal] = useState<ReceiptSettings>({
    showLogo: true,
    showAddress: true,
    showPhone: true,
    showTaxNumber: true,
    footerText: '',
    paperWidth: '80mm',
  });
  const [devices, setDevicesLocal] = useState<DeviceSettings>({
    kitchen: true,
    waiter: true,
    qrMenu: false,
  });

  // Update local state when API data arrives
  useEffect(() => {
    if (allSettings) {
      setBusinessLocal(allSettings.business);
      setReceiptLocal(allSettings.receipt);
      setDevicesLocal(allSettings.devices);
    }
  }, [allSettings]);

  // Mutations for updating settings
  const updateBusinessMutation = useMutation({
    mutationFn: settingsApi.updateBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSaveStatus('saved');
    },
    onError: () => setSaveStatus('error'),
  });

  const updateReceiptMutation = useMutation({
    mutationFn: settingsApi.updateReceipt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSaveStatus('saved');
    },
    onError: () => setSaveStatus('error'),
  });

  const updateDevicesMutation = useMutation({
    mutationFn: settingsApi.updateDevices,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSaveStatus('saved');
    },
    onError: () => setSaveStatus('error'),
  });

  // Setters that also update API
  const setBusiness = useCallback((value: BusinessSettings | ((prev: BusinessSettings) => BusinessSettings)) => {
    setBusinessLocal(prev => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      setSaveStatus('saving');
      updateBusinessMutation.mutate(newValue);
      return newValue;
    });
  }, [updateBusinessMutation]);

  const setReceipt = useCallback((value: ReceiptSettings | ((prev: ReceiptSettings) => ReceiptSettings)) => {
    setReceiptLocal(prev => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      setSaveStatus('saving');
      updateReceiptMutation.mutate(newValue);
      return newValue;
    });
  }, [updateReceiptMutation]);

  const setDevices = useCallback((value: DeviceSettings | ((prev: DeviceSettings) => DeviceSettings)) => {
    setDevicesLocal(prev => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      setSaveStatus('saving');
      updateDevicesMutation.mutate(newValue);
      return newValue;
    });
  }, [updateDevicesMutation]);

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
    usersLoading: usersLoading || settingsLoading,
    usersError: usersError || settingsError,
    saveStatus,
    addUser,
    updateUser,
    deleteUser,
    toggleUserActive,
  };
}
