
import { useState, useEffect } from 'react';
import { dbService } from '@/lib/indexeddb';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Copy, Volume2, ArrowLeftRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TranslationHistory {
  id?: number;
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  apiUsed: string;
  timestamp: number;
}

const History = () => {
  const [history, setHistory] = useState<TranslationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const historyData = await dbService.getTranslationHistory();
      setHistory(historyData.reverse()); // Show latest first
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat riwayat terjemahan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await dbService.clearTranslationHistory();
      setHistory([]);
      toast({
        title: "Berhasil",
        description: "Riwayat terjemahan telah dihapus",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus riwayat",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Berhasil",
        description: "Teks berhasil disalin ke clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyalin teks",
        variant: "destructive"
      });
    }
  };

  const playAudio = (text: string, language: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'Japanese' ? 'ja-JP' : 'id-ID';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Error",
        description: "Text-to-speech tidak didukung di browser ini",
        variant: "destructive"
      });
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Riwayat Terjemahan
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Lihat kembali terjemahan yang pernah Anda lakukan
              </p>
            </div>
            {history.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={clearHistory}
                className="flex items-center space-x-2"
              >
                <Trash2 size={16} />
                <span>Hapus Semua</span>
              </Button>
            )}
          </div>

          {history.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <ArrowLeftRight size={48} className="mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Belum Ada Riwayat</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Mulai menerjemahkan untuk melihat riwayat di sini
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => (
                <Card key={item.id || index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {item.fromLanguage} → {item.toLanguage}
                        </Badge>
                        <Badge variant="secondary">
                          {item.apiUsed}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Original Text */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Teks Asli ({item.fromLanguage})
                        </span>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => playAudio(item.originalText, item.fromLanguage)}
                          >
                            <Volume2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(item.originalText)}
                          >
                            <Copy size={16} />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-900 dark:text-white">
                        {item.originalText}
                      </p>
                    </div>

                    {/* Translated Text */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          Hasil Terjemahan ({item.toLanguage})
                        </span>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => playAudio(item.translatedText, item.toLanguage)}
                          >
                            <Volume2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(item.translatedText)}
                          >
                            <Copy size={16} />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-900 dark:text-white">
                        {item.translatedText}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
