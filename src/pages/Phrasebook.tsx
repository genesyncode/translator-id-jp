
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { dbService } from '@/lib/indexeddb';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Bookmark, BookmarkCheck, Volume2, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Phrase {
  japanese: string;
  indonesian: string;
  romaji: string;
}

interface Category {
  name: string;
  phrases: Phrase[];
}

interface PhrasebookData {
  categories: Record<string, Category>;
}

interface BookmarkedPhrase extends Phrase {
  id?: number;
  category: string;
  timestamp?: number;
}

const Phrasebook = () => {
  const { isProUser } = useAuthStore();
  const { toast } = useToast();
  const [phrasebookData, setPhrasebookData] = useState<PhrasebookData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarkedPhrases, setBookmarkedPhrases] = useState<BookmarkedPhrase[]>([]);
  const [activeTab, setActiveTab] = useState('browse');

  useEffect(() => {
    loadPhrasebook();
    loadBookmarks();
  }, []);

  const loadPhrasebook = async () => {
    try {
      const response = await fetch('/data/phrases.json');
      const data = await response.json();
      setPhrasebookData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data phrasebook",
        variant: "destructive"
      });
    }
  };

  const loadBookmarks = async () => {
    try {
      const bookmarks = await dbService.getBookmarkedPhrases();
      setBookmarkedPhrases(bookmarks);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  };

  const toggleBookmark = async (phrase: Phrase, category: string) => {
    if (!isProUser) {
      toast({
        title: "Fitur Premium",
        description: "Upgrade ke Pro untuk bookmark frase",
        variant: "destructive"
      });
      return;
    }

    try {
      const existingBookmark = bookmarkedPhrases.find(
        b => b.japanese === phrase.japanese && b.category === category
      );

      if (existingBookmark && existingBookmark.id) {
        await dbService.removeBookmarkedPhrase(existingBookmark.id);
        setBookmarkedPhrases(bookmarkedPhrases.filter(b => b.id !== existingBookmark.id));
        toast({
          title: "Bookmark dihapus",
          description: "Frase telah dihapus dari bookmark",
        });
      } else {
        await dbService.addBookmarkedPhrase({
          ...phrase,
          category
        });
        await loadBookmarks();
        toast({
          title: "Bookmark ditambahkan",
          description: "Frase telah ditambahkan ke bookmark",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengubah bookmark",
        variant: "destructive"
      });
    }
  };

  const isBookmarked = (phrase: Phrase, category: string) => {
    return bookmarkedPhrases.some(
      b => b.japanese === phrase.japanese && b.category === category
    );
  };

  const playAudio = (text: string, lang: 'ja' | 'id') => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'ja' ? 'ja-JP' : 'id-ID';
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

  const getFilteredPhrases = () => {
    if (!phrasebookData) return [];

    let allPhrases: Array<Phrase & { categoryId: string; categoryName: string }> = [];

    Object.entries(phrasebookData.categories).forEach(([categoryId, category]) => {
      if (selectedCategory === 'all' || selectedCategory === categoryId) {
        category.phrases.forEach(phrase => {
          allPhrases.push({
            ...phrase,
            categoryId,
            categoryName: category.name
          });
        });
      }
    });

    if (searchTerm) {
      allPhrases = allPhrases.filter(phrase =>
        phrase.japanese.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phrase.indonesian.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phrase.romaji.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return allPhrases;
  };

  if (!phrasebookData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const categories = Object.entries(phrasebookData.categories);
  const filteredPhrases = getFilteredPhrases();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Phrasebook Jepang
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Koleksi frasa penting bahasa Jepang untuk percakapan sehari-hari
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">Jelajahi Frase</TabsTrigger>
              <TabsTrigger value="bookmarks" className="flex items-center space-x-2">
                <Bookmark size={16} />
                <span>Bookmark</span>
                {!isProUser && <Crown size={14} className="text-amber-500" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari frase..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map(([categoryId, category]) => (
                    <option key={categoryId} value={categoryId}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phrases Grid */}
              <div className="grid gap-4">
                {filteredPhrases.map((phrase, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">{phrase.categoryName}</Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-japanese">{phrase.japanese}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => playAudio(phrase.japanese, 'ja')}
                              >
                                <Volume2 size={16} />
                              </Button>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                              {phrase.romaji}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="text-blue-600 dark:text-blue-400">
                                {phrase.indonesian}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => playAudio(phrase.indonesian, 'id')}
                              >
                                <Volume2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookmark(phrase, phrase.categoryId)}
                          className={isBookmarked(phrase, phrase.categoryId) ? 'text-amber-500' : ''}
                        >
                          {isBookmarked(phrase, phrase.categoryId) ? (
                            <BookmarkCheck size={20} />
                          ) : (
                            <Bookmark size={20} />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredPhrases.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    Tidak ada frase yang ditemukan
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="bookmarks" className="space-y-6">
              {!isProUser ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Crown className="mx-auto text-amber-500 mb-4" size={48} />
                    <h3 className="text-xl font-semibold mb-2">Fitur Premium</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Upgrade ke Pro untuk menyimpan dan mengorganisir frase favorit Anda
                    </p>
                    <Button onClick={() => window.location.href = '/upgrade'}>
                      Upgrade ke Pro
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {bookmarkedPhrases.length > 0 ? (
                    bookmarkedPhrases.map((phrase, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline">
                                  {phrasebookData.categories[phrase.category]?.name || phrase.category}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg font-japanese">{phrase.japanese}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => playAudio(phrase.japanese, 'ja')}
                                  >
                                    <Volume2 size={16} />
                                  </Button>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {phrase.romaji}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <span className="text-blue-600 dark:text-blue-400">
                                    {phrase.indonesian}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => playAudio(phrase.indonesian, 'id')}
                                  >
                                    <Volume2 size={16} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleBookmark(phrase, phrase.category)}
                              className="text-amber-500"
                            >
                              <BookmarkCheck size={20} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Bookmark className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-500 dark:text-gray-400">
                        Belum ada frase yang di-bookmark
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Phrasebook;
