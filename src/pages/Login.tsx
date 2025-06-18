
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Languages, Shield, Cloud, Sparkles, Check } from 'lucide-react';

const Login = () => {
  const { user, signInWithGoogle, initialized } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && user) {
      navigate('/');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900 p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <Card className="glass-card rounded-2xl premium-shadow border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center">
                <Languages className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <CardTitle className="text-3xl font-bold gradient-text mb-2">
              GeneSYNC Translator
            </CardTitle>
            
            <CardDescription className="text-base text-muted-foreground">
              Translator Indonesia ⇄ Jepang dengan AI dan Fitur Premium
            </CardDescription>
            
            <div className="flex justify-center mt-4">
              <Badge 
                variant="secondary" 
                className="bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 text-blue-700 dark:text-blue-300 border-0 px-3 py-1"
              >
                <Sparkles size={12} className="mr-1" />
                AI-Powered
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Selamat Datang!</h3>
                <p className="text-muted-foreground">
                  Masuk dengan akun Google untuk memulai pengalaman terjemahan terbaik
                </p>
              </div>
              
              <Button 
                onClick={signInWithGoogle}
                className="w-full h-12 rounded-xl gradient-primary text-white font-medium hover:shadow-lg transition-all focus-premium"
                size="lg"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Masuk dengan Google
              </Button>
              
              {/* Feature highlights */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Yang Anda Dapatkan
                </h4>
                
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                      <Cloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium">Sinkronisasi Cloud</div>
                      <div className="text-muted-foreground text-xs">Backup otomatis ke Google Drive</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-medium">Data Aman & Terenkripsi</div>
                      <div className="text-muted-foreground text-xs">Privasi dan keamanan terjamin</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="font-medium">Akses Fitur Premium</div>
                      <div className="text-muted-foreground text-xs">Upgrade untuk fitur lengkap</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Additional info */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-xs text-muted-foreground">
            Dengan masuk, Anda menyetujui Syarat Layanan dan Kebijakan Privasi kami
          </p>
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <Check size={12} className="text-green-500" />
            <span>100% Gratis untuk memulai</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
