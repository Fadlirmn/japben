# Japben

> **Learn Japanese before you play.**

Aplikasi Android **local-first** yang menghubungkan belajar bahasa Jepang dengan pengelolaan waktu penggunaan aplikasi. Prinsip utama: pengguna harus menyelesaikan kuis bahasa Jepang (10 soal, nilai sempurna) sebelum bisa kembali membuka aplikasi yang sudah mencapai batas pemakaian harian.

Spesifikasi produk lengkap ada di [`prd.md`](./prd.md).

## Status

- ✅ Sprint 0: APK debug berjalan di device Android nyata (Tauri 2 + Rust + Svelte + Android).
- ✅ Sprint 1 (sebagian): SQLite storage engine (`app_rules`, `app_preferences`).
- ✅ Sprint 2 (sebagian): plugin native Android (`tauri-plugin-android-focus`) — cek izin Usage Access, baca daftar aplikasi terpasang, baca statistik pemakaian hari ini.
- ✅ Tab **Focus**: pilih aplikasi nyata di perangkat + atur batas menit/hari (nyata, tersimpan di SQLite).
- ✅ Tab **Settings**: profil lokal, bahasa, tema, status izin — nyata, tersimpan di SQLite. Backup/restore & AI online masih ditandai "belum tersedia" (jujur, bukan tombol palsu).
- ✅ Tab **Home**: ringkasan waktu fokus hari ini dihitung dari data nyata (bukan dummy lagi).
- ❌ Belum ada: lock mechanism saat batas tercapai, kuis unlock, Learning Engine, AI Tutor, quiz/diagnostic, foreground service untuk pelacakan saat app ditutup (Sprint 3 lanjutan ke atas).

## Stack Teknologi

| Lapisan | Teknologi |
|---|---|
| Framework app | [Tauri 2](https://v2.tauri.app/) |
| Core / business logic | Rust |
| UI | Svelte 5 + TypeScript + Vite |
| Integrasi Android | Kotlin/Java via Tauri mobile plugin |
| Database lokal | SQLite (via Rust) |
| Serialization | Serde |
| Logging | `tracing` / `tauri-plugin-log` |
| Build Android | Cargo, Tauri CLI, Android SDK + NDK, Gradle |

Desain UI: **Japanese Editorial** custom (bukan Material Design), dengan tema Light/Dark/System dan navigasi hybrid (bottom nav di mobile, sidebar di layar lebar).

### Prinsip arsitektur

- Rust menangani seluruh business logic (Focus Engine, Quiz Engine, dll).
- Svelte hanya menangani presentasi dan interaksi UI — **tidak** menghitung kelayakan unlock atau skor kuis sendiri.
- Kotlin/Java hanya dipakai untuk API sistem Android yang butuh native integration (Usage Access, foreground service, overlay).
- Tidak ada backend sendiri pada MVP; semua data tersimpan lokal di perangkat.

## Fitur (sesuai PRD)

### Focus Engine
- Pilih aplikasi yang ingin dilindungi + atur batas waktu per aplikasi.
- Mode jadwal **Strict** dan **Flexible**.
- Penghitungan waktu pakai per aplikasi (berdasarkan `package_name`, terpisah per app).
- Lock otomatis saat batas tercapai → kuis unlock 10 soal, nilai sempurna (10/10) membuka app terkait selama 15 menit.
- Emergency unlock maksimal 3x/hari (tidak mengembalikan kuota permanen).
- Riwayat pemakaian & unlock, status izin, status kesehatan perlindungan.

### Learning Engine
- Kategori: Vocabulary, Grammar, Reading, Listening, Kanji, Sentence Arrangement, Conversation, Translation.
- Kurikulum: JLPT N5–N1, JFT-Basic, dan Custom.
- Diagnostic test (opsional, bisa dilewati) sebagai baseline level.
- Adaptive learning (spaced repetition, penyesuaian kesulitan) — berjalan offline.
- Target belajar: satu target utama + target pendukung, dengan milestone otomatis.

### AI Tutor Hybrid
- **Offline**: rule-based recommendation, evaluasi jawaban, spaced repetition — tanpa internet.
- **Model lokal opsional**: contoh kalimat, percakapan sederhana, koreksi grammar (jika didukung perangkat).
- **AI online opsional** (nonaktif default / butuh persetujuan): percakapan natural, koreksi mendalam, roleplay. Memakai BYOK (*Bring Your Own Key*) — **tidak ada API key developer yang ditanam di APK**.

### Lainnya
- Listening & YouTube learning (subtitle, transcript, shadowing) — dengan status kompatibilitas per video.
- Impor materi (PDF, TXT, CSV, input manual) ke library lokal.
- Progress: grafik harian/mingguan, streak, akurasi per kategori, estimasi kesiapan ujian (bukan jaminan kelulusan).
- Backup & restore manual, file terenkripsi dengan passphrase pengguna.
- Tanpa akun wajib, tanpa paywall/billing pada MVP.

## Struktur Proyek

```
Japben/
├── prd.md                   # Spesifikasi produk & teknis lengkap
├── src/                      # Frontend Svelte + TypeScript
│   ├── App.svelte
│   ├── lib/
│   │   ├── components/        # editorial, focus, settings, learning, layout
│   │   ├── services/          # commands.ts — jembatan ke Tauri commands (Rust)
│   │   └── styles/             # tokens.css, global.css, typography
│   └── main.ts
├── src-tauri/                 # Core Rust + konfigurasi Tauri
│   ├── src/                   # lib.rs, db.rs (storage engine), focus.rs, settings.rs
│   ├── tauri.conf.json
│   ├── Cargo.toml
│   └── gen/android/            # Project Android ter-generate (jangan edit manual)
├── plugins/
│   └── tauri-plugin-android-focus/  # Plugin native Android (Usage Access, daftar app, usage stats)
├── index.html
├── vite.config.ts
└── package.json
```

> `src-tauri/gen/` dan `src-tauri/target/` adalah hasil generate/build — tidak perlu di-commit kecuali butuh diperiksa manual.

## Menjalankan (Desktop/Dev)

Prasyarat: Node.js, Rust (`rustup`), Tauri CLI (sudah ada di `devDependencies`).

```bash
npm install
npm run dev          # dev server Vite saja (UI tanpa shell Tauri)
npx tauri dev         # jalankan sebagai app desktop dengan Rust core aktif
```

Build desktop:

```bash
npm run build
npx tauri build
```

## Build Android

Prasyarat tambahan:
- Android SDK + NDK (disarankan NDK yang dikenali `tauri android init`, mis. `27.x`)
- **JDK 21** — Gradle/Android Gradle Plugin saat ini belum kompatibel dengan JDK yang lebih baru (mis. JDK 27 akan gagal dengan error `Unsupported class file major version`).

```bash
export ANDROID_HOME=~/Android/Sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export NDK_HOME=$ANDROID_HOME/ndk/<versi>
export ANDROID_NDK_HOME=$NDK_HOME
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk

npx tauri android init     # sekali saja, generate src-tauri/gen/android
npx tauri android build --debug
```

APK hasil build ada di:
```
src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

Install ke device fisik (USB debugging aktif):

```bash
adb install src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

## Catatan Integrasi

- Focus Engine dan Settings sudah terhubung nyata ke Rust lewat `src/lib/services/commands.ts`. Learning Engine, Quiz Engine, dan AI belum ada di Rust — jangan wiring UI ke sana sebelum backend-nya dibuat.
- **Jangan** menghitung kelayakan unlock atau skor kuis di sisi UI — status unlock harus berasal dari Rust (lihat Bab 11 `prd.md`), begitu juga saat kuis unlock mulai dibangun.
- Mekanisme blocking hanya memakai Usage Access + foreground service + overlay. **Accessibility Service tidak dipakai** untuk blocking (kebijakan Play Store).
- Pelacakan pemakaian saat ini membaca `UsageStatsManager` secara on-demand (saat tab Focus/Home dibuka) — belum ada foreground service yang memantau terus-menerus & mengunci otomatis saat app ditutup (itu Sprint 3 lanjutan).

## Font

CSS memakai fallback system font. Untuk hasil final, tambahkan font berlisensi di `public/fonts/` lalu aktifkan `@font-face` di `src/lib/styles/typography.css`:
- Noto Serif JP — display/editorial headings
- Inter — UI
- Noto Sans JP — konten pembelajaran Jepang

## Referensi

- [Tauri 2](https://v2.tauri.app/)
- [Tauri mobile plugin development](https://v2.tauri.app/develop/plugins/develop-mobile/)
- [Android UsageStatsManager](https://developer.android.com/reference/android/app/usage/UsageStatsManager)
- [Android foreground services](https://developer.android.com/develop/background-work/services/foreground-services)
