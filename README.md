
# 🇮🇩 ⇄ 🇯🇵 Aplikasi Translate Indonesia ⇄ Jepang

Aplikasi web fullstack untuk menerjemahkan bahasa Indonesia ke Jepang dan sebaliknya, khusus dirancang untuk calon pekerja migran Indonesia. Mendukung level JLPT N5-N3 dengan fitur Kanji/Hiragana, Romaji, dan estimasi level JLPT.

![App Screenshot](https://via.placeholder.com/800x400/2563eb/white?text=Translate+Indonesia+%E2%87%84+Jepang)

## ✨ Fitur Utama

- 🔄 **Terjemahan 2 Arah**: Indonesia → Jepang dan Jepang → Indonesia
- 🔤 **Output Lengkap**: Kanji/Hiragana + Romaji + Level JLPT
- 🎯 **AI-Powered**: Menggunakan OpenAI GPT-4 untuk akurasi tinggi
- 🔐 **Autentikasi Google**: Login aman dengan akun Gmail
- 📚 **Riwayat Terjemahan**: Simpan dan kelola hasil terjemahan
- 🔊 **Audio Pronunciation**: Text-to-Speech untuk hasil terjemahan
- 📱 **Responsive Design**: Optimal di desktop dan mobile
- 🎨 **UI Modern**: Desain clean dan profesional

## 🚀 Demo Langsung

**[Buka Aplikasi](https://your-app-domain.com)** *(Ganti dengan URL deployment Anda)*

## 🛠️ Teknologi

- **Frontend**: React.js, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui
- **Authentication**: Mock Google OAuth (Supabase ready)
- **AI Translation**: OpenAI GPT-4 API
- **Storage**: LocalStorage (Supabase ready)
- **Deployment**: Vercel/Netlify ready

## 📋 Prasyarat

- Node.js 18+ dan npm
- API Key OpenAI ([Dapatkan di sini](https://platform.openai.com/api-keys))
- Browser modern yang mendukung Web Speech API

## 🔧 Instalasi Developer

### 1. Clone Repository
```bash
git clone <repository-url>
cd translate-indonesia-jepang
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
Siapkan API Key OpenAI Anda. Aplikasi akan meminta API Key saat pertama kali dijalankan.

### 4. Jalankan Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:8080`

### 5. Build untuk Production
```bash
npm run build
```

## 🌐 Deployment

### Vercel (Recommended)
1. Push code ke GitHub
2. Connect repository di Vercel
3. Deploy otomatis akan berjalan

### Netlify
1. Build aplikasi: `npm run build`
2. Upload folder `dist` ke Netlify
3. Atau connect dengan Git repository

## 📖 Panduan Pengguna

### Untuk Pengguna Umum

#### 1. **Login**
- Klik "Masuk dengan Google"
- Izinkan akses aplikasi
- Anda akan diarahkan ke dashboard

#### 2. **Setup API Key**
- Masukkan API Key OpenAI Anda
- API Key disimpan aman di browser Anda
- Klik "Simpan API Key"

#### 3. **Menerjemahkan**
- Pilih arah terjemahan (Indonesia ⇄ Jepang)
- Masukkan teks di kotak input
- Klik "Terjemahkan"
- Lihat hasil: Terjemahan + Romaji + Level JLPT

#### 4. **Fitur Tambahan**
- **Play Audio**: Dengarkan pronunciation hasil
- **Simpan Riwayat**: Simpan terjemahan penting
- **Reset**: Bersihkan form input
- **Swap**: Tukar arah terjemahan

#### 5. **Melihat Riwayat**
- Tab "Riwayat" menampilkan semua terjemahan tersimpan
- Klik item untuk memuat ulang terjemahan
- Audio playback tersedia per item

## 🔧 Panduan Developer

### Struktur Project
```
src/
├── components/          # React components
│   ├── Header.tsx       # App header dengan user info
│   ├── LoginForm.tsx    # Google OAuth login
│   ├── TranslateForm.tsx # Main translation interface
│   ├── TranslationHistory.tsx # History management
│   └── ApiKeyInput.tsx  # API key input form
├── services/            # Business logic services
│   ├── translationService.ts # OpenAI API integration
│   ├── supabaseService.ts    # Mock auth & storage
│   └── storageService.ts     # LocalStorage management
├── pages/               # Page components
│   └── Index.tsx        # Main application page
└── hooks/               # Custom React hooks
    └── use-toast.ts     # Toast notifications
```

### API Integration

#### OpenAI Translation Service
```typescript
// services/translationService.ts
const service = new TranslationService(apiKey);
const result = await service.translate(text, direction);
```

#### Mock Supabase Service
```typescript
// services/supabaseService.ts
await supabaseService.signInWithGoogle();
await supabaseService.saveTranslation(data);
```

### Menambah Fitur Baru

#### Menambah Level JLPT (N2/N1)
1. Update prompt di `translationService.ts`
2. Tambah styling untuk badge baru di `index.css`
3. Update interface `TranslationResult`

#### Integrasi Supabase Real
1. Install Supabase: `npm install @supabase/supabase-js`
2. Replace mock service dengan real Supabase client
3. Setup database schema untuk `translations` table
4. Configure Google OAuth di Supabase Auth

### Database Schema (Supabase)
```sql
-- Tabel untuk menyimpan riwayat terjemahan
CREATE TABLE translations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  input_text TEXT NOT NULL,
  output_text TEXT NOT NULL,
  romaji TEXT,
  jlpt_level TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('indonesia-japanese', 'japanese-indonesia')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own translations" ON translations
  FOR ALL USING (auth.uid() = user_id);
```

## 🎯 Roadmap & Fitur Mendatang

- [ ] **Supabase Integration**: Real authentication & database
- [ ] **Offline Mode**: Terjemahan dasar tanpa internet
- [ ] **Voice Input**: Speech-to-text untuk input
- [ ] **Conversation Mode**: Mode percakapan real-time
- [ ] **Workplace Phrases**: Kumpulan frasa kerja umum
- [ ] **JLPT Practice**: Quiz berdasarkan level
- [ ] **Export History**: Download riwayat dalam PDF/Excel
- [ ] **Multi-language**: Tambah bahasa Inggris
- [ ] **Dark Mode**: Tema gelap
- [ ] **PWA**: Installable web app

## 🤝 Kontribusi

Kami menerima kontribusi! Silakan:

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit perubahan (`git commit -m 'Add some amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📝 Lisensi

See `LICENSE` for more information.

## 📞 Kontak & Support

- **Email**: genesync@gmail.com
- **GitHub Issues**: [Report Bug](https://github.com/genesync/translator-id-jp/issues)
- **Documentation**: [Wiki](https://github.com/genesync/translator-id-jp/wiki)

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) untuk GPT-4 API
- [Shadcn/ui](https://ui.shadcn.com) untuk komponen UI
- [Tailwind CSS](https://tailwindcss.com) untuk styling
- [Lucide](https://lucide.dev) untuk icons
- [Vercel](https://vercel.com) untuk hosting

---

**Dibuat dengan ❤️ untuk komunitas pekerja migran Indonesia**

*Membantu jembatan komunikasi antara Indonesia dan Jepang*
