
import { openDB, type IDBPDatabase } from 'idb';

interface TranslationHistory {
  id?: number;
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  apiUsed: string;
  timestamp: number;
}

interface JLPTScore {
  id?: number;
  level: string;
  score: number;
  totalQuestions: number;
  timestamp: number;
}

interface BookmarkedPhrase {
  id?: number;
  japanese: string;
  indonesian: string;
  romaji: string;
  category: string;
  timestamp: number;
}

class IndexedDBService {
  private db: IDBPDatabase | null = null;

  async initialize() {
    if (this.db) return this.db;

    this.db = await openDB('GeneSyncDB', 1, {
      upgrade(db) {
        // Translation history store
        if (!db.objectStoreNames.contains('translations')) {
          const translationStore = db.createObjectStore('translations', {
            keyPath: 'id',
            autoIncrement: true
          });
          translationStore.createIndex('timestamp', 'timestamp');
        }

        // JLPT scores store
        if (!db.objectStoreNames.contains('jlpt_scores')) {
          const scoresStore = db.createObjectStore('jlpt_scores', {
            keyPath: 'id',
            autoIncrement: true
          });
          scoresStore.createIndex('level', 'level');
          scoresStore.createIndex('timestamp', 'timestamp');
        }

        // Bookmarked phrases store
        if (!db.objectStoreNames.contains('bookmarked_phrases')) {
          const phrasesStore = db.createObjectStore('bookmarked_phrases', {
            keyPath: 'id',
            autoIncrement: true
          });
          phrasesStore.createIndex('category', 'category');
          phrasesStore.createIndex('timestamp', 'timestamp');
        }
      }
    });

    return this.db;
  }

  // Translation History Methods
  async addTranslation(translation: Omit<TranslationHistory, 'id' | 'timestamp'>) {
    const db = await this.initialize();
    return await db.add('translations', {
      ...translation,
      timestamp: Date.now()
    });
  }

  async getTranslationHistory(limit = 100): Promise<TranslationHistory[]> {
    const db = await this.initialize();
    const tx = db.transaction('translations', 'readonly');
    const index = tx.store.index('timestamp');
    return await index.getAll(null, limit);
  }

  async clearTranslationHistory() {
    const db = await this.initialize();
    return await db.clear('translations');
  }

  // JLPT Scores Methods
  async addJLPTScore(score: Omit<JLPTScore, 'id' | 'timestamp'>) {
    const db = await this.initialize();
    return await db.add('jlpt_scores', {
      ...score,
      timestamp: Date.now()
    });
  }

  async getJLPTScores(level?: string): Promise<JLPTScore[]> {
    const db = await this.initialize();
    const tx = db.transaction('jlpt_scores', 'readonly');
    
    if (level) {
      const index = tx.store.index('level');
      return await index.getAll(level);
    }
    
    return await tx.store.getAll();
  }

  // Bookmarked Phrases Methods
  async addBookmarkedPhrase(phrase: Omit<BookmarkedPhrase, 'id' | 'timestamp'>) {
    const db = await this.initialize();
    return await db.add('bookmarked_phrases', {
      ...phrase,
      timestamp: Date.now()
    });
  }

  async getBookmarkedPhrases(category?: string): Promise<BookmarkedPhrase[]> {
    const db = await this.initialize();
    const tx = db.transaction('bookmarked_phrases', 'readonly');
    
    if (category) {
      const index = tx.store.index('category');
      return await index.getAll(category);
    }
    
    return await tx.store.getAll();
  }

  async removeBookmarkedPhrase(id: number) {
    const db = await this.initialize();
    return await db.delete('bookmarked_phrases', id);
  }

  // Export all data for backup
  async exportAllData() {
    const db = await this.initialize();
    
    const [translations, scores, phrases] = await Promise.all([
      db.getAll('translations'),
      db.getAll('jlpt_scores'),
      db.getAll('bookmarked_phrases')
    ]);

    return {
      translations,
      jlpt_scores: scores,
      bookmarked_phrases: phrases,
      exported_at: new Date().toISOString()
    };
  }

  // Import all data from backup
  async importAllData(data: any) {
    const db = await this.initialize();
    const tx = db.transaction(['translations', 'jlpt_scores', 'bookmarked_phrases'], 'readwrite');

    // Clear existing data
    await tx.objectStore('translations').clear();
    await tx.objectStore('jlpt_scores').clear();
    await tx.objectStore('bookmarked_phrases').clear();

    // Import new data
    if (data.translations) {
      for (const item of data.translations) {
        await tx.objectStore('translations').add(item);
      }
    }

    if (data.jlpt_scores) {
      for (const item of data.jlpt_scores) {
        await tx.objectStore('jlpt_scores').add(item);
      }
    }

    if (data.bookmarked_phrases) {
      for (const item of data.bookmarked_phrases) {
        await tx.objectStore('bookmarked_phrases').add(item);
      }
    }

    await tx.done;
  }
}

export const dbService = new IndexedDBService();
