
import { useState, useEffect } from 'react';
import { translationService } from '@/services/multi-api-service';
import { backupAllToDrive, restoreAllFromDrive } from '@/lib/drive-backup';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Cloud, Download, Upload, Key, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface APISettings {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  dailyQuota: number;
  usedToday: number;
  apiKey?: string;
}

const Settings = () => {
  const [apiSettings, setApiSettings] = useState<APISettings[]>([]);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'backing-up' | 'restoring'>('idle');
  const [backupProgress, setBackupProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadAPISettings();
  }, []);

  const loadAPISettings = () => {
    const settings = translationService.getAPIs();
    setApiSettings(settings);
  };

  const updateAPISetting = (id: string, updates: Partial<APISettings>) => {
    translationService.updateAPI(id, updates);
    loadAPISettings();
  };

  const saveAPIKey = (id: string, apiKey: string) => {
    localStorage.setItem(`${id}_api_key`, apiKey);
    updateAPISetting(id, { apiKey });
    toast({
      title: "Berhasil",
      description: "API key berhasil disimpan",
    });
  };

  const handleBackup = async () => {
    setBackupStatus('backing-up');
    setBackupProgress(0);
    
    try {
      // Progress simulation
      const interval = setInterval(() => {
        setBackupProgress(prev => Math.min(prev + 20, 90));
      }, 200);

      await backupAllToDrive();
      
      clearInterval(interval);
      setBackupProgress(100);
      
      toast({
        title: "Backup Berhasil",
        description: "Data berhasil di-backup ke Google Drive",
      });
    } catch (error) {
      toast({
        title: "Backup Gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat backup",
        variant: "destructive"
      });
    } finally {
      setBackupStatus('idle');
      setTimeout(() => setBackupProgress(0), 2000);
    }
  };

  const handleRestore = async () => {
    setBackupStatus('restoring');
    setBackupProgress(0);
    
    try {
      // Progress simulation
      const interval = setInterval(() => {
        setBackupProgress(prev => Math.min(prev + 25, 90));
      }, 300);

      await restoreAllFromDrive();
      
      clearInterval(interval);
      setBackupProgress(100);
      
      toast({
        title: "Restore Berhasil",
        description: "Data berhasil dipulihkan dari Google Drive",
      });
    } catch (error) {
      toast({
        title: "Restore Gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat restore",
        variant: "destructive"
      });
    } finally {
      setBackupStatus('restoring');
      setTimeout(() => setBackupProgress(0), 2000);
    }
  };

  const resetDailyUsage = () => {
    translationService.resetDailyUsage();
    loadAPISettings();
    toast({
      title: "Berhasil",
      description: "Penggunaan harian telah direset",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Pengaturan
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Kelola API, backup data, dan preferensi aplikasi
            </p>
          </div>

          <Tabs defaultValue="api" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="api" className="flex items-center space-x-2">
                <Key size={16} />
                <span>API Settings</span>
              </TabsTrigger>
              <TabsTrigger value="backup" className="flex items-center space-x-2">
                <Cloud size={16} />
                <span>Backup & Sync</span>
              </TabsTrigger>
              <TabsTrigger value="usage" className="flex items-center space-x-2">
                <Activity size={16} />
                <span>Penggunaan API</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="api" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Konfigurasi API Translation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {apiSettings.map((api) => (
                    <div key={api.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{api.name}</h3>
                        <Switch
                          checked={api.enabled}
                          onCheckedChange={(enabled) => updateAPISetting(api.id, { enabled })}
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`${api.id}-key`}>API Key</Label>
                          <div className="flex space-x-2">
                            <Input
                              id={`${api.id}-key`}
                              type="password"
                              placeholder="Masukkan API key..."
                              defaultValue={api.apiKey}
                              onBlur={(e) => {
                                if (e.target.value !== api.apiKey) {
                                  saveAPIKey(api.id, e.target.value);
                                }
                              }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor={`${api.id}-priority`}>Prioritas</Label>
                          <Input
                            id={`${api.id}-priority`}
                            type="number"
                            min="1"
                            max="10"
                            value={api.priority}
                            onChange={(e) => updateAPISetting(api.id, { priority: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`${api.id}-quota`}>Kuota Harian</Label>
                        <Input
                          id={`${api.id}-quota`}
                          type="number"
                          min="1"
                          value={api.dailyQuota}
                          onChange={(e) => updateAPISetting(api.id, { dailyQuota: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="backup" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Backup & Sinkronisasi Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      Data Anda akan disimpan secara lokal dan di-backup ke Google Drive untuk sinkronisasi antar perangkat.
                    </p>
                    
                    {(backupStatus !== 'idle') && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>
                            {backupStatus === 'backing-up' ? 'Backup ke Google Drive...' : 'Restore dari Google Drive...'}
                          </span>
                          <span>{backupProgress}%</span>
                        </div>
                        <Progress value={backupProgress} className="h-2" />
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <Button
                        onClick={handleBackup}
                        disabled={backupStatus !== 'idle'}
                        className="flex items-center space-x-2"
                      >
                        <Upload size={16} />
                        <span>Backup ke Drive</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={handleRestore}
                        disabled={backupStatus !== 'idle'}
                        className="flex items-center space-x-2"
                      >
                        <Download size={16} />
                        <span>Restore dari Drive</span>
                      </Button>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Data yang di-backup:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Riwayat terjemahan</li>
                        <li>Skor kuis JLPT</li>
                        <li>Bookmark phrasebook</li>
                        <li>Pengaturan API</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usage" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Monitor Penggunaan API</CardTitle>
                    <Button variant="outline" onClick={resetDailyUsage}>
                      Reset Harian
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {apiSettings.map((api) => (
                    <div key={api.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{api.name}</span>
                        <span className="text-sm text-gray-500">
                          {api.usedToday} / {api.dailyQuota}
                        </span>
                      </div>
                      <Progress 
                        value={(api.usedToday / api.dailyQuota) * 100} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Status: {api.enabled ? 'Aktif' : 'Nonaktif'}</span>
                        <span>Sisa: {api.dailyQuota - api.usedToday}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;
