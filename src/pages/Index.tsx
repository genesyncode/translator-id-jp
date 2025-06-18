
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import TranslatorForm from '@/components/translator/TranslatorForm';
import { Toaster } from '@/components/ui/toaster';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Languages, Zap } from 'lucide-react';

const Index = () => {
  const { user, initialized, isProUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && !user) {
      navigate('/login');
    }
  }, [user, initialized, navigate]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center">
            <Languages className="w-8 h-8 text-white" />
          </div>
          <div className="text-lg font-medium text-muted-foreground">Memuat GeneSYNC...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-fade-in-up">
          {/* Hero Section */}
          <div className="text-center mb-12 space-y-4">
            <div className="flex justify-center mb-4">
              <Badge 
                variant="secondary" 
                className="bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 text-blue-700 dark:text-blue-300 border-0 px-4 py-2 text-sm font-medium"
              >
                <Sparkles size={14} className="mr-2" />
                AI-Powered Translation
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              <span className="gradient-text">GeneSYNC</span> Translator
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Translator Indonesia ⇄ Jepang dengan AI canggih, fitur premium, dan pengalaman pengguna yang luar biasa
            </p>

            {/* Feature highlights */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-white/60 dark:bg-slate-800/40 px-4 py-2 rounded-full premium-border">
                <Zap size={14} className="text-blue-500" />
                <span>Multi-API Translation</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-white/60 dark:bg-slate-800/40 px-4 py-2 rounded-full premium-border">
                <Languages size={14} className="text-green-500" />
                <span>JLPT Quiz Lengkap</span>
              </div>
              {isProUser && (
                <div className="flex items-center space-x-2 text-sm text-amber-700 dark:text-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 px-4 py-2 rounded-full border border-amber-200 dark:border-amber-800">
                  <Sparkles size={14} />
                  <span>Pro Member</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Translator */}
          <div className="max-w-4xl mx-auto">
            <TranslatorForm />
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="glass-card p-6 rounded-2xl premium-shadow animate-scale-in">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Languages className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Multi-Engine AI</h3>
                <p className="text-sm text-muted-foreground">
                  Menggunakan beberapa AI engine untuk hasil terjemahan yang akurat dan natural
                </p>
              </div>
              
              <div className="glass-card p-6 rounded-2xl premium-shadow animate-scale-in" style={{animationDelay: '0.1s'}}>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Fitur Premium</h3>
                <p className="text-sm text-muted-foreground">
                  JLPT Quiz, Phrasebook, Cloud Backup, dan fitur eksklusif lainnya
                </p>
              </div>
              
              <div className="glass-card p-6 rounded-2xl premium-shadow animate-scale-in" style={{animationDelay: '0.2s'}}>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Cloud Sync</h3>
                <p className="text-sm text-muted-foreground">
                  Sinkronisasi otomatis dengan Google Drive untuk backup data Anda
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
};

export default Index;
