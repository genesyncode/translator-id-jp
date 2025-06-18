
import { create } from 'zustand';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  initialized: boolean;
  userRole: string;
  isProUser: boolean;
  subscriptionExpiry: Date | null;
  setUser: (user: User | null) => void;
  setUserRole: (role: string) => void;
  setSubscriptionExpiry: (expiry: Date | null) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  fetchUserRole: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  initialized: false,
  userRole: 'free',
  isProUser: false,
  subscriptionExpiry: null,
  
  setUser: (user) => set({ user }),
  setUserRole: (role) => set({ 
    userRole: role, 
    isProUser: role === 'pro' 
  }),
  setSubscriptionExpiry: (expiry) => set({ subscriptionExpiry: expiry }),
  
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ user: session.user });
        await get().fetchUserRole();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      set({ initialized: true });
    }
  },
  
  signOut: async () => {
    try {
      // Backup data before signing out
      const { backupAllToDrive } = await import('./drive-backup');
      await backupAllToDrive();
      
      await supabase.auth.signOut();
      set({ 
        user: null, 
        userRole: 'free', 
        isProUser: false,
        subscriptionExpiry: null 
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },
  
  signInWithGoogle: async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/drive.appdata'
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  },
  
  fetchUserRole: async () => {
    const user = get().user;
    if (!user) return;
    
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('subscription_expires_at')
        .eq('user_id', user.id)
        .gte('subscription_expires_at', new Date().toISOString())
        .single();
      
      const role = roleData?.role || 'free';
      const expiry = subscriptionData?.subscription_expires_at 
        ? new Date(subscriptionData.subscription_expires_at) 
        : null;
      
      set({ 
        userRole: role,
        isProUser: role === 'pro' && expiry && expiry > new Date(),
        subscriptionExpiry: expiry
      });
    } catch (error) {
      console.error('Fetch user role error:', error);
    }
  }
}));

// Listen to auth changes
supabase.auth.onAuthStateChange(async (event, session) => {
  const { setUser, fetchUserRole } = useAuthStore.getState();
  
  if (event === 'SIGNED_IN' && session?.user) {
    setUser(session.user);
    await fetchUserRole();
    
    // Restore data from Drive
    const { restoreAllFromDrive } = await import('./drive-backup');
    await restoreAllFromDrive();
  } else if (event === 'SIGNED_OUT') {
    setUser(null);
  }
});
