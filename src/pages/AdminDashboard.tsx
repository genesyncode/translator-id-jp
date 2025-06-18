import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, CreditCard, Crown, Calendar, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminStats {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  totalTransactions: number;
  monthlyRevenue: number;
  expiringSubscriptions: number;
}

interface User {
  id: string;
  email: string;
  role: string;
  subscription_expires_at: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, userRole } = useAuthStore();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    proUsers: 0,
    freeUsers: 0,
    totalTransactions: 0,
    monthlyRevenue: 0,
    expiringSubscriptions: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole === 'admin') {
      loadAdminData();
    }
  }, [userRole]);

  const loadAdminData = async () => {
    try {
      // Load user statistics
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('user_id, subscription_expires_at');

      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, status, created_at');

      // Calculate stats
      const totalUsers = userRoles?.length || 0;
      const proUsers = userRoles?.filter(ur => ur.role === 'pro').length || 0;
      const freeUsers = totalUsers - proUsers;

      const successfulTransactions = transactions?.filter(t => t.status === 'completed') || [];
      const monthlyRevenue = successfulTransactions
        .filter(t => new Date(t.created_at).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + t.amount, 0);

      const expiringSubscriptions = subscriptions?.filter(s => {
        if (!s.subscription_expires_at) return false;
        const expiryDate = new Date(s.subscription_expires_at);
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        return expiryDate <= threeDaysFromNow && expiryDate > now;
      }).length || 0;

      setStats({
        totalUsers,
        proUsers,
        freeUsers,
        totalTransactions: successfulTransactions.length,
        monthlyRevenue,
        expiringSubscriptions
      });

      // Load recent users with their subscription info
      const { data: recentUsers } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (recentUsers) {
        // Get subscription data for these users
        const userIds = recentUsers.map(u => u.user_id);
        const { data: userSubscriptions } = await supabase
          .from('subscriptions')
          .select('user_id, subscription_expires_at')
          .in('user_id', userIds);

        // Transform data to include user details
        const usersWithDetails = recentUsers.map(user => {
          const subscription = userSubscriptions?.find(s => s.user_id === user.user_id);
          return {
            id: user.user_id,
            email: user.user_id, // In real implementation, fetch email from auth.users
            role: user.role,
            subscription_expires_at: subscription?.subscription_expires_at || null,
            created_at: user.created_at
          };
        });
        setUsers(usersWithDetails);
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data admin",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      toast({
        title: "Berhasil",
        description: `Role user berhasil diubah menjadi ${newRole}`,
      });

      loadAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengubah role user",
        variant: "destructive"
      });
    }
  };

  const extendSubscription = async (userId: string, days: number) => {
    try {
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + days);

      await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          subscription_expires_at: newExpiryDate.toISOString()
        });

      toast({
        title: "Berhasil",
        description: `Langganan diperpanjang ${days} hari`,
      });

      loadAdminData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperpanjang langganan",
        variant: "destructive"
      });
    }
  };

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                <h1 className="text-2xl font-bold mb-2">Akses Ditolak</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Anda tidak memiliki akses ke dashboard admin.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Monitor dan kelola pengguna, langganan, dan transaksi
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Users className="text-blue-500" size={32} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Crown className="text-amber-500" size={32} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pro Users</p>
                    <p className="text-2xl font-bold">{stats.proUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <CreditCard className="text-green-500" size={32} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Transaksi</p>
                    <p className="text-2xl font-bold">{stats.totalTransactions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Calendar className="text-red-500" size={32} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Akan Expired</p>
                    <p className="text-2xl font-bold">{stats.expiringSubscriptions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Revenue Bulanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(stats.monthlyRevenue)}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Bulan {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
              </p>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Pengguna</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{user.email}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.role === 'pro' ? 'default' : 'secondary'}>
                          {user.role.toUpperCase()}
                        </Badge>
                        {user.subscription_expires_at && (
                          <span className="text-sm text-gray-500">
                            Berakhir: {new Date(user.subscription_expires_at).toLocaleDateString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateUserRole(user.id, user.role === 'pro' ? 'free' : 'pro')}
                      >
                        {user.role === 'pro' ? 'Jadikan Free' : 'Jadikan Pro'}
                      </Button>
                      
                      {user.role === 'pro' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => extendSubscription(user.id, 30)}
                        >
                          +30 Hari
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
