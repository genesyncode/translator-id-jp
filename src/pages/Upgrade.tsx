
import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Package {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  recommended?: boolean;
}

const Upgrade = () => {
  const { user, isProUser } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const packages: Package[] = [
    {
      id: 'monthly',
      name: 'Pro Bulanan',
      price: 29000,
      duration: '1 bulan',
      features: [
        'JLPT Quiz N3 & N4',
        'Bookmark unlimited phrasebook',
        'Priority API translation',
        'Backup cloud otomatis',
        'Support prioritas',
        'Akses early features'
      ]
    },
    {
      id: 'yearly',
      name: 'Pro Tahunan',
      price: 299000,
      duration: '12 bulan',
      recommended: true,
      features: [
        'Semua fitur Pro Bulanan',
        'Hemat 2 bulan (17% discount)',
        'JLPT Quiz N1 & N2 (coming soon)',
        'AI conversation practice',
        'Kamus offline premium',
        'Priority customer support'
      ]
    }
  ];

  const handleUpgrade = async (packageId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Silakan login terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    setLoading(packageId);

    try {
      // In a real implementation, this would integrate with Supabase Edge Functions
      // and payment gateway like Midtrans or Stripe
      
      // Simulate payment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, show success message
      toast({
        title: "Demo Mode",
        description: "Ini adalah demo. Integrasi payment gateway akan tersedia di versi production.",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memproses pembayaran",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (isProUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <Crown className="mx-auto text-amber-500 mb-4" size={64} />
                <h1 className="text-3xl font-bold mb-4">Anda Sudah Pro!</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Terima kasih telah menjadi member Pro GeneSYNC Translator. 
                  Nikmati semua fitur premium yang tersedia.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Fitur yang Anda dapatkan:</h3>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center space-x-2">
                        <Check size={16} className="text-green-500" />
                        <span>JLPT Quiz lengkap</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check size={16} className="text-green-500" />
                        <span>Bookmark phrasebook</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check size={16} className="text-green-500" />
                        <span>Priority translation</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check size={16} className="text-green-500" />
                        <span>Cloud backup</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Coming Soon:</h3>
                    <ul className="space-y-1 text-sm text-gray-500">
                      <li>• JLPT N1 & N2 Quiz</li>
                      <li>• AI Conversation Practice</li>
                      <li>• Kamus Offline Premium</li>
                      <li>• Voice Recognition</li>
                    </ul>
                  </div>
                </div>
                <Button 
                  className="mt-6" 
                  onClick={() => window.location.href = '/'}
                >
                  Kembali ke Translator
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Upgrade ke Pro
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Dapatkan akses penuh ke semua fitur premium GeneSYNC Translator
            </p>
          </div>

          {/* Features Comparison */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Perbandingan Fitur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h3 className="font-semibold mb-4">Free</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <Check size={16} className="text-green-500" />
                      <span>Basic Translation</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check size={16} className="text-green-500" />
                      <span>JLPT N4 Quiz</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check size={16} className="text-green-500" />
                      <span>View Phrasebook</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check size={16} className="text-green-500" />
                      <span>Translation History</span>
                    </li>
                  </ul>
                </div>
                
                <div className="text-center border-2 border-amber-500 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Crown className="text-amber-500" size={20} />
                    <h3 className="font-semibold">Pro</h3>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <Check size={16} className="text-green-500" />
                      <span>Semua fitur Free</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Star size={16} className="text-amber-500" />
                      <span>JLPT N3 Quiz</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Star size={16} className="text-amber-500" />
                      <span>Bookmark Phrasebook</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Star size={16} className="text-amber-500" />
                      <span>Priority API Access</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Star size={16} className="text-amber-500" />
                      <span>Cloud Backup</span>
                    </li>
                  </ul>
                </div>

                <div className="text-center">
                  <h3 className="font-semibold mb-4">Coming Soon</h3>
                  <ul className="space-y-2 text-sm text-gray-500">
                    <li className="flex items-center space-x-2">
                      <Zap size={16} className="text-blue-500" />
                      <span>JLPT N1 & N2</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Zap size={16} className="text-blue-500" />
                      <span>AI Conversation</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Zap size={16} className="text-blue-500" />
                      <span>Voice Recognition</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Zap size={16} className="text-blue-500" />
                      <span>Offline Dictionary</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Plans */}
          <div className="grid md:grid-cols-2 gap-6">
            {packages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`relative ${pkg.recommended ? 'border-2 border-amber-500' : ''}`}
              >
                {pkg.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-amber-500 text-white px-4 py-1">
                      Rekomendasi
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center space-x-2">
                    <Crown className="text-amber-500" size={24} />
                    <span>{pkg.name}</span>
                  </CardTitle>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">
                      {formatPrice(pkg.price)}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      untuk {pkg.duration}
                    </div>
                    {pkg.id === 'yearly' && (
                      <Badge variant="secondary">Hemat 17%</Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check size={16} className="text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade(pkg.id)}
                    disabled={loading === pkg.id}
                  >
                    {loading === pkg.id ? 'Memproses...' : `Pilih ${pkg.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Garansi 7 Hari</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Tidak puas dengan layanan Pro? Dapatkan refund 100% dalam 7 hari pertama.
                  Hubungi support@genesync.app untuk klaim refund.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upgrade;
