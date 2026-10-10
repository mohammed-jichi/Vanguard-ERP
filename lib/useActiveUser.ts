'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/lib/TenantContext';

export interface ActiveUserProfile {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: string;
  avatarLetter: string;
  branch?: string;
}

export function resolveUserFromStorage(): ActiveUserProfile | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Check structured objects in sessionStorage / localStorage
    const rawUser =
      sessionStorage.getItem('vanguard_user') ||
      localStorage.getItem('vanguard_user') ||
      sessionStorage.getItem('so_authenticated_user') ||
      localStorage.getItem('so_authenticated_user');

    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed && (parsed.name || parsed.fullName || parsed.email)) {
        let name = parsed.name || parsed.fullName;
        if (!name && (parsed.email || '').toLowerCase() === 'jamaljichihusseinmahdi@gmail.com') {
          name = 'Hussien Jichi';
        }
        name = name || 'Authorized User';

        return {
          id: parsed.id || 'u-active',
          name,
          first_name: parsed.first_name || name.split(' ')[0],
          last_name: parsed.last_name || name.split(' ').slice(1).join(' '),
          email: parsed.email || '',
          role: parsed.role || 'Manager',
          avatarLetter: name.trim().charAt(0).toUpperCase() || 'U',
          branch: parsed.branch,
        };
      }
    }

    // 2. Check individual session/local storage keys
    const name = sessionStorage.getItem('vanguard_user_name') || localStorage.getItem('vanguard_user_name');
    const email = sessionStorage.getItem('vanguard_user_email') || localStorage.getItem('vanguard_user_email');
    const role = sessionStorage.getItem('vanguard_user_role') || localStorage.getItem('vanguard_user_role');
    const userId = sessionStorage.getItem('vanguard_user_id') || localStorage.getItem('vanguard_user_id');

    if (name || email) {
      let resolvedName = name;
      if (!resolvedName && email?.toLowerCase() === 'jamaljichihusseinmahdi@gmail.com') {
        resolvedName = 'Hussien Jichi';
      }
      resolvedName = resolvedName || 'Authorized User';

      return {
        id: userId || 'u-active',
        name: resolvedName,
        first_name: resolvedName.split(' ')[0],
        last_name: resolvedName.split(' ').slice(1).join(' '),
        email: email || '',
        role: role || (email?.toLowerCase() === 'jamaljichihusseinmahdi@gmail.com' ? 'Manager' : 'Staff'),
        avatarLetter: resolvedName.trim().charAt(0).toUpperCase() || 'U',
      };
    }
  } catch (e) {}

  return null;
}

export function useActiveUser() {
  const { currentUser } = useTenant();
  const [profile, setProfile] = useState<ActiveUserProfile>(() => {
    const fromStorage = resolveUserFromStorage();
    if (fromStorage) return fromStorage;

    if (currentUser?.fullName) {
      const name =
        currentUser.email?.toLowerCase() === 'jamaljichihusseinmahdi@gmail.com'
          ? 'Hussien Jichi'
          : currentUser.fullName;
      return {
        id: currentUser.id || 'u-active',
        name,
        email: currentUser.email || '',
        role: currentUser.role || 'Manager',
        avatarLetter: name.trim().charAt(0).toUpperCase() || 'U',
      };
    }

    // Default sensible fallback
    return {
      id: 'u-101',
      name: 'Hussien Jichi',
      email: 'jamaljichihusseinmahdi@gmail.com',
      role: 'Manager',
      avatarLetter: 'H',
    };
  });

  useEffect(() => {
    let isMounted = true;

    const syncUser = async () => {
      const fromStorage = resolveUserFromStorage();
      if (fromStorage && isMounted) {
        setProfile(fromStorage);
      }

      // Query /api/auth/me to verify live profile against active session cookies
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout
        
        const res = await fetch('/api/auth/me', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user && isMounted) {
            setProfile(data.user);
          }
        }
      } catch (err) {
        // Fallback gracefully to storage state
      }
    };

    syncUser();

    const handleAuthChange = () => syncUser();
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('vanguard_auth_change', handleAuthChange);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('vanguard_auth_change', handleAuthChange);
    };
  }, [currentUser]);

  return profile;
}
