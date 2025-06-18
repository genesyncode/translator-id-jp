
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database schema types
export interface UserRole {
  user_id: string;
  role: string;
  created_at: string;
}

export interface Subscription {
  user_id: string;
  subscription_expires_at: string;
  created_at: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  features: string[];
}

export interface Transaction {
  id: string;
  user_id: string;
  package_id: string;
  status: string;
  payment_method: string;
  amount: number;
  created_at: string;
}
