
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { translationService } from '@/services/multi-api-service';
import { dbService } from '@/lib/indexeddb';
import { useToast } from '@/hooks/use-toast';
import { 
  RotateCcw, 
  Copy, 
  Volume2, 
  ArrowLeftRight, 
  Keyboard,
  Sparkles,
  Zap
} from 'lucide-react';
import JapaneseKeyboard from './JapaneseKeyboard';

const TranslatorForm = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [fromLanguage, setFromLanguage] = useState('Indonesian');
  const [toLanguage, setToLanguage] = useState('Japanese');
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [apiUsed, setApiUsed] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const languages = ['Indonesian', 'Japanese'];

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Perhatian",
        description: "Silakan masukkan teks yang ingin diterjemahkan",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);
    setProgress(0);
    setOutputText('');

    try {
      // Enhanced progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 8, 90));
      }, 80);

      const result = await translationService.translate(inputText, fromLanguage, toLanguage);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setOutputText(result.translatedText);
      setApiUsed(result.apiUsed);

      // Save to history
      await dbService.addTranslation({
        originalText: inputText,
        translatedText: result.translatedText,
        fromLanguage,
        toLanguage,
        apiUsed: result.apiUsed
      });

      toast({
        title: "✅ Berhasil Diterjemahkan",
        description: `Menggunakan ${result.apiUsed} API`,
      });

    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "❌ Terjadi Kesalahan",
        description: error instanceof Error ? error.message : "Gagal menerjemahkan teks",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleSwapLanguages = () => {
    setFromLanguage(toLanguage);
    setToLanguage(fromLanguage);
    setInputText(outputText);
    setOutputText(inputText);
    
    toast({
      title: "🔄 Bahasa Ditukar",
      description: "Arah terjemahan berhasil diubah",
    });
  };

  const handleReset = () => {
    setInputText('');
    setOutputText('');
    setApiUsed('');
    
    toast({
      title: "🔄 Form Direset",
      description: "Semua teks telah dihapus",
    });
  };

  const handleCopy = async () => {
    if (outputText) {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: "📋 Berhasil Disalin",
        description: "Teks hasil terjemahan telah disalin ke clipboard",
      });
    }
  };

  const handleSpeak = () => {
    if (outputText && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(outputText);
      utterance.lang = toLanguage === 'Japanese' ? 'ja-JP' : 'id-ID';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
      
      toast({
        title: "🔊 Memutar Audio",
        description: "Text-to-speech sedang diputar",
      });
    } else {
      toast({
        title: "❌ Tidak Didukung",
        description: "Text-to-speech tidak tersedia di browser ini",
        variant: "destructive"
      });
    }
  };

  const handleKeyboardInput = (text: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = inputText.substring(0, start) + text + inputText.substring(end);
      setInputText(newText);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card className="glass-card rounded-2xl premium-shadow border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-2xl font-bold">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="gradient-text">AI Translator</span>
            </div>
            <div className="flex items-center space-x-2">
              {apiUsed && (
                <Badge 
                  variant="secondary" 
                  className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                >
                  <Zap size={12} className="mr-1" />
                  {apiUsed}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Language Selection */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select value={fromLanguage} onValueChange={setFromLanguage}>
                <SelectTrigger className="h-12 rounded-xl premium-border focus-premium bg-white/50 dark:bg-slate-800/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  {languages.map(lang => (
                    <SelectItem key={lang} value={lang} className="focus-premium">
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleSwapLanguages}
              className="h-12 w-12 rounded-xl premium-border hover:bg-accent/10 focus-premium"
            >
              <ArrowLeftRight size={18} />
            </Button>
            
            <div className="flex-1">
              <Select value={toLanguage} onValueChange={setToLanguage}>
                <SelectTrigger className="h-12 rounded-xl premium-border focus-premium bg-white/50 dark:bg-slate-800/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  {languages.map(lang => (
                    <SelectItem key={lang} value={lang} className="focus-premium">
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">
                Teks Sumber ({fromLanguage})
              </label>
              {fromLanguage === 'Japanese' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKeyboard(!showKeyboard)}
                  className="rounded-lg premium-border hover:bg-accent/10 focus-premium"
                >
                  <Keyboard size={14} className="mr-2" />
                  Keyboard Jepang
                </Button>
              )}
            </div>
            
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Masukkan teks dalam bahasa ${fromLanguage}...`}
                className="min-h-[140px] rounded-xl resize-none premium-border focus-premium bg-white/70 dark:bg-slate-800/70 text-base leading-relaxed"
                disabled={isTranslating}
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-md">
                {inputText.length} karakter
              </div>
            </div>
            
            {/* Japanese Keyboard */}
            {showKeyboard && fromLanguage === 'Japanese' && (
              <div className="animate-fade-in-up">
                <JapaneseKeyboard onInput={handleKeyboardInput} />
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isTranslating && (
            <div className="space-y-3 animate-fade-in-up">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Menerjemahkan dengan AI...</span>
                </span>
                <span className="font-medium text-primary">{progress}%</span>
              </div>
              <Progress 
                value={progress} 
                className="h-2 bg-gray-100 dark:bg-slate-800" 
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleTranslate} 
                disabled={isTranslating || !inputText.trim()}
                className="gradient-primary text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all focus-premium"
                size="lg"
              >
                {isTranslating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Menerjemahkan...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="mr-2" />
                    Terjemahkan
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="px-6 rounded-xl premium-border hover:bg-accent/10 focus-premium"
                size="lg"
              >
                <RotateCcw size={16} className="mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground">
              Hasil Terjemahan ({toLanguage})
            </label>
            <div className="relative">
              <Textarea
                value={outputText}
                readOnly
                placeholder={`Hasil terjemahan dalam bahasa ${toLanguage} akan muncul di sini...`}
                className="min-h-[140px] rounded-xl resize-none premium-border bg-gray-50/70 dark:bg-slate-800/50 text-base leading-relaxed pr-20"
              />
              
              {outputText && (
                <div className="absolute top-3 right-3 flex space-x-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleSpeak}
                    className="w-8 h-8 rounded-lg hover:bg-accent/20 focus-premium"
                  >
                    <Volume2 size={14} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleCopy}
                    className="w-8 h-8 rounded-lg hover:bg-accent/20 focus-premium"
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              )}
              
              {outputText && (
                <div className="absolute bottom-3 left-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-md">
                  {outputText.length} karakter
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranslatorForm;
