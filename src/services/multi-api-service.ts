
interface TranslationAPI {
  name: string;
  enabled: boolean;
  priority: number;
  dailyQuota: number;
  usedToday: number;
  apiKey?: string;
}

interface TranslationResult {
  translatedText: string;
  apiUsed: string;
  confidence: number;
}

class MultiApiTranslationService {
  private apis: Map<string, TranslationAPI> = new Map();
  private fallbackOrder: string[] = ['gpt4', 'google', 'libretranslate', 'mymemory'];

  constructor() {
    this.initializeAPIs();
    this.loadSettings();
  }

  private initializeAPIs() {
    this.apis.set('gpt4', {
      name: 'GPT-4 (OpenAI)',
      enabled: true,
      priority: 1,
      dailyQuota: 100,
      usedToday: 0,
      apiKey: localStorage.getItem('openai_api_key') || ''
    });

    this.apis.set('google', {
      name: 'Google Translate',
      enabled: true,
      priority: 2,
      dailyQuota: 500,
      usedToday: 0,
      apiKey: localStorage.getItem('google_translate_key') || ''
    });

    this.apis.set('libretranslate', {
      name: 'LibreTranslate',
      enabled: true,
      priority: 3,
      dailyQuota: 1000,
      usedToday: 0,
      apiKey: localStorage.getItem('libretranslate_key') || ''
    });

    this.apis.set('mymemory', {
      name: 'MyMemory',
      enabled: true,
      priority: 4,
      dailyQuota: 1000,
      usedToday: 0
    });
  }

  private loadSettings() {
    const saved = localStorage.getItem('translation_api_settings');
    if (saved) {
      const settings = JSON.parse(saved);
      settings.forEach((setting: any) => {
        const api = this.apis.get(setting.id);
        if (api) {
          Object.assign(api, setting);
        }
      });
    }
  }

  public saveSettings() {
    const settings = Array.from(this.apis.entries()).map(([id, api]) => ({
      id,
      ...api
    }));
    localStorage.setItem('translation_api_settings', JSON.stringify(settings));
  }

  public getAPIs() {
    return Array.from(this.apis.entries()).map(([id, api]) => ({ id, ...api }));
  }

  public updateAPI(id: string, updates: Partial<TranslationAPI>) {
    const api = this.apis.get(id);
    if (api) {
      Object.assign(api, updates);
      this.saveSettings();
    }
  }

  private async translateWithGPT4(text: string, from: string, to: string): Promise<string> {
    const api = this.apis.get('gpt4');
    if (!api?.apiKey) throw new Error('GPT-4 API key not configured');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${api.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate from ${from} to ${to}. Only return the translation, no explanations.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1
      })
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  private async translateWithGoogle(text: string, from: string, to: string): Promise<string> {
    const api = this.apis.get('google');
    if (!api?.apiKey) throw new Error('Google Translate API key not configured');

    const sourceLang = from === 'Indonesian' ? 'id' : 'ja';
    const targetLang = to === 'Indonesian' ? 'id' : 'ja';

    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${api.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang
        })
      }
    );

    const data = await response.json();
    return data.data.translations[0].translatedText;
  }

  private async translateWithLibreTranslate(text: string, from: string, to: string): Promise<string> {
    const sourceLang = from === 'Indonesian' ? 'id' : 'ja';
    const targetLang = to === 'Indonesian' ? 'id' : 'ja';

    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang
      })
    });

    const data = await response.json();
    return data.translatedText;
  }

  private async translateWithMyMemory(text: string, from: string, to: string): Promise<string> {
    const sourceLang = from === 'Indonesian' ? 'id' : 'ja';
    const targetLang = to === 'Indonesian' ? 'id' : 'ja';

    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
    );

    const data = await response.json();
    return data.responseData.translatedText;
  }

  public async translate(text: string, from: string, to: string): Promise<TranslationResult> {
    const availableAPIs = this.fallbackOrder
      .map(id => ({ id, api: this.apis.get(id)! }))
      .filter(({ api }) => 
        api.enabled && 
        api.usedToday < api.dailyQuota
      )
      .sort((a, b) => a.api.priority - b.api.priority);

    if (availableAPIs.length === 0) {
      throw new Error('No available translation APIs');
    }

    for (const { id, api } of availableAPIs) {
      try {
        let translatedText: string;

        switch (id) {
          case 'gpt4':
            translatedText = await this.translateWithGPT4(text, from, to);
            break;
          case 'google':
            translatedText = await this.translateWithGoogle(text, from, to);
            break;
          case 'libretranslate':
            translatedText = await this.translateWithLibreTranslate(text, from, to);
            break;
          case 'mymemory':
            translatedText = await this.translateWithMyMemory(text, from, to);
            break;
          default:
            continue;
        }

        // Increment usage counter
        api.usedToday++;
        this.saveSettings();

        return {
          translatedText,
          apiUsed: api.name,
          confidence: id === 'gpt4' ? 0.95 : id === 'google' ? 0.9 : 0.8
        };

      } catch (error) {
        console.warn(`Translation failed with ${api.name}:`, error);
        continue;
      }
    }

    throw new Error('All translation APIs failed');
  }

  public resetDailyUsage() {
    this.apis.forEach(api => {
      api.usedToday = 0;
    });
    this.saveSettings();
  }
}

export const translationService = new MultiApiTranslationService();

// Reset daily usage at midnight
const now = new Date();
const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
const msUntilMidnight = tomorrow.getTime() - now.getTime();

setTimeout(() => {
  translationService.resetDailyUsage();
  // Set daily reset interval
  setInterval(() => {
    translationService.resetDailyUsage();
  }, 24 * 60 * 60 * 1000);
}, msUntilMidnight);
