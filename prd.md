# Japanese Focus --- Product Requirements Document (PRD)

**Versi:** 1.3\
**Status:** Baseline produk dan rancangan teknis\
**Platform:** Android\
**Arsitektur:** Rust + Tauri 2 + Svelte + TypeScript\
**Tanggal pembaruan:** 15 November 2026

**Catatan versi 1.3:** menambahkan mitigasi kebijakan distribusi Play
Store, klarifikasi Accessibility Service, antisipasi penyalahgunaan
(stalkerware), metrik keberhasilan, kriteria performa/baterai, dan
keputusan enkripsi backup.

------------------------------------------------------------------------

## 1. Ringkasan Produk

Japanese Focus adalah aplikasi Android untuk membantu pengguna belajar
bahasa Jepang secara konsisten dengan menghubungkan pembelajaran dan
pengelolaan waktu penggunaan aplikasi yang mengganggu fokus.

Prinsip utamanya: pengguna perlu menyelesaikan kuis bahasa Jepang
sebelum dapat kembali menggunakan aplikasi tertentu yang telah mencapai
batas pemakaian.

**Tagline:** *Learn Japanese before you play.*

Aplikasi dirancang dengan pendekatan **local-first**. Fungsi inti, data
belajar, aturan aplikasi, kuis, dan statistik berjalan di perangkat
tanpa backend milik sendiri. Internet hanya diperlukan untuk fitur
opsional seperti AI online atau sumber materi online.

## 2. Tujuan Produk

1.  Membantu pengguna membangun kebiasaan belajar bahasa Jepang.
2.  Mengurangi penggunaan aplikasi yang mengganggu fokus melalui batas
    penggunaan per aplikasi.
3.  Mengubah waktu membuka aplikasi yang dibatasi menjadi kesempatan
    belajar.
4.  Menyediakan kurikulum fleksibel untuk JLPT, JFT-Basic, dan target
    khusus.
5.  Memastikan fitur inti tetap dapat digunakan tanpa internet dan tanpa
    akun.

### 2.1 Bukan tujuan MVP

-   Menjamin kelulusan JLPT/JFT-Basic.
-   Menyediakan sinkronisasi cloud.
-   Menyediakan sistem akun wajib.
-   Menyediakan langganan atau paywall.
-   Menjamin pemblokiran aplikasi secara mutlak pada semua perangkat
    Android.
-   Menyediakan AI generatif canggih secara offline pada seluruh
    perangkat.

### 2.2 Metrik keberhasilan (indikatif)

-   Retensi pengguna aktif setelah 30 hari.
-   Streak belajar harian rata-rata.
-   Tingkat keberhasilan unlock kuis (skor 10/10) tanpa emergency
    unlock.
-   Pengurangan waktu pemakaian aplikasi yang dibatasi dibanding
    baseline sebelum instalasi.

Metrik ini indikatif untuk validasi MVP, bukan target kontraktual.

## 3. Keputusan Produk yang Sudah Ditetapkan

  -----------------------------------------------------------------------
  Area                                Keputusan
  ----------------------------------- -----------------------------------
  Platform                            Android

  App blocking                        Berbasis waktu penggunaan

  Perhitungan penggunaan              Individual per aplikasi

  Cakupan unlock                      Hanya aplikasi yang sedang terkunci

  Durasi unlock kuis                  15 menit

  Syarat unlock                       Nilai sempurna, 10 dari 10

  Jumlah soal unlock                  10 pertanyaan

  Emergency unlock                    Maksimal 3 kali per hari

  Mode perlindungan                   Strict dan flexible, dengan jadwal

  Aplikasi yang dilindungi            Dapat dipilih dan dikonfigurasi
                                      pengguna

  Kategori kuis                       Vocabulary, Grammar, Reading,
                                      Listening, Kanji, Sentence
                                      Arrangement, Conversation,
                                      Translation

  Kurikulum                           JLPT, JFT-Basic, dan Custom

  Target belajar                      Satu target utama dan target
                                      pendukung

  Level awal                          Pilihan manual dan tes diagnostik

  Periode target                      Dapat diatur; dua bulan pernah
                                      digunakan sebagai contoh awal

  Tingkat kesulitan                   Adaptif

  Materi                              Original, sumber resmi/berlisensi,
                                      dan materi custom

  Impor materi                        PDF, TXT, CSV, dan input manual

  Offline                             Fitur inti harus dapat berjalan
                                      offline

  AI Tutor                            Hybrid: intelligence berbasis
                                      aturan/model lokal dan AI online
                                      opsional

  Akun                                Opsional; tidak wajib untuk MVP

  Backend sendiri                     Tidak digunakan

  Monetisasi                          Ditunda; tidak ada billing/paywall
                                      pada MVP

  Teknologi                           Rust + Tauri 2 + Svelte +
                                      TypeScript, dengan plugin native
                                      Android

  Database                            SQLite lokal melalui Rust
  -----------------------------------------------------------------------

**Catatan keputusan:** jika pengguna salah menjawab kuis unlock,
aplikasi tetap terkunci dan penjelasan ditampilkan. Rekomendasi
implementasi adalah sesi kuis diulang dari awal setelah penjelasan;
jawaban salah tetap dicatat untuk adaptive learning. Detail ini dapat
disesuaikan setelah usability test.

## 4. Target Pengguna dan Skenario

### 4.1 Target pengguna

-   Pembelajar bahasa Jepang pemula hingga lanjutan.
-   Pengguna yang ingin mempersiapkan JLPT atau JFT-Basic.
-   Pengguna yang ingin mengurangi waktu bermain game atau menggunakan
    media sosial.
-   Pengguna yang membutuhkan latihan singkat dan terstruktur setiap
    hari.

### 4.2 Skenario utama

1.  Pengguna memasang Japanese Focus dan menyelesaikan onboarding.
2.  Pengguna memilih level awal secara manual atau mengikuti tes
    diagnostik.
3.  Pengguna menentukan target utama dan target pendukung.
4.  Pengguna memilih aplikasi yang ingin dibatasi.
5.  Pengguna menetapkan batas waktu dan jadwal setiap aplikasi.
6.  Japanese Focus memantau penggunaan aplikasi yang dipilih.
7.  Ketika batas tercapai, aplikasi target masuk status terkunci.
8.  Pengguna menjawab 10 soal bahasa Jepang.
9.  Jika semua benar, aplikasi terkait dibuka selama 15 menit.
10. Setelah masa akses berakhir, perlindungan aktif kembali.

## 5. Ruang Lingkup Fitur

### 5.1 Focus Engine

-   Menampilkan aplikasi yang dapat dipilih untuk perlindungan.
-   Mengaktifkan atau menonaktifkan aturan per aplikasi.
-   Mengatur batas penggunaan individual.
-   Mendukung jadwal strict dan flexible.
-   Menghitung waktu penggunaan aplikasi secara individual.
-   Mengunci aplikasi ketika batas tercapai.
-   Menyediakan kuis unlock 10 soal.
-   Memberikan akses 15 menit setelah skor 100%.
-   Menyediakan emergency unlock maksimal tiga kali per hari.
-   Menyimpan riwayat pemakaian dan unlock.
-   Menampilkan status izin dan kesehatan perlindungan.

### 5.2 Learning Engine

Jenis latihan: - Vocabulary. - Grammar. - Reading. - Listening. -
Kanji. - Sentence Arrangement. - Conversation. - Translation.

Kurikulum: - JLPT N5--N1. - JFT-Basic. - Custom curriculum.

Kemampuan: - Belajar berdasarkan rencana harian. - Belajar bebas
berdasarkan kategori. - Tes diagnostik. - Pengulangan materi. - Spaced
repetition. - Adaptasi kesulitan. - Progress per kemampuan.

### 5.3 Learning Goals

Pengguna menentukan: - Satu target utama. - Satu atau lebih target
pendukung. - Level awal. - Level tujuan. - Tenggat waktu. - Waktu
belajar harian.

Contoh target utama: JLPT N4 dalam enam bulan.\
Contoh target pendukung: menguasai 500 kosakata dan meningkatkan
listening.

Sistem menyusun milestone dan rencana belajar. Sistem harus memberi tahu
pengguna jika target tampak tidak realistis, bukan menjanjikan
kelulusan.

### 5.4 Diagnostic Test

Mengukur: - Vocabulary. - Grammar. - Kanji. - Reading. - Listening.

Hasil diagnostik menjadi baseline. Pengguna tetap dapat melewati tes dan
memilih level secara manual.

### 5.5 Adaptive Learning

Sistem menggunakan riwayat jawaban, akurasi, waktu respons, pengulangan,
dan kategori kemampuan untuk menentukan materi berikutnya.

Contoh aturan: - Sering salah: berikan penguatan. - Benar tetapi lambat:
berikan latihan tambahan. - Benar secara konsisten: naikkan kesulitan. -
Materi lama berisiko terlupakan: jadwalkan pengulangan. - Listening
lemah: prioritaskan latihan audio.

AI boleh memberi rekomendasi, tetapi tidak boleh mengubah target utama
atau tenggat tanpa persetujuan pengguna.

### 5.6 AI Tutor Hybrid

AI memiliki dua peran: 1. Pendamping perencanaan pembelajaran dan
rekomendasi adaptif. 2. Tutor interaktif untuk percakapan, koreksi, dan
latihan.

Lapisan AI:

**Offline Learning Intelligence** - Rule-based recommendation. -
Evaluasi jawaban dari bank soal. - Jadwal belajar. - Spaced
repetition. - Pemilihan materi. - Penjelasan berdasarkan konten lokal.

**Model lokal opsional** - Contoh kalimat. - Percakapan sederhana. -
Penjelasan grammar. - Koreksi teks jika model dan perangkat mendukung.

**AI online opsional** - Percakapan natural. - Koreksi grammar
mendalam. - Roleplay adaptif. - Pembuatan latihan dari materi pengguna.

AI online harus dinonaktifkan secara default atau hanya digunakan
setelah persetujuan pengguna. Tanpa backend sendiri, jangan menanam API
key rahasia milik developer ke dalam APK. Pilihan yang memungkinkan
adalah model lokal atau BYOK (*Bring Your Own Key*). Layanan perantara
pihak ketiga dapat dipertimbangkan kelak, tetapi akan menambah
ketergantungan eksternal.

Mode percakapan: - Text. - Voice. - Roleplay harian. - Percakapan
formal/kerja. - Situasi toko, restoran, stasiun, hotel, dan perjalanan.

AI memberikan koreksi kosakata, tata bahasa, struktur kalimat,
alternatif ungkapan, dan penjelasan. Bahasa latihan utama adalah Jepang;
penjelasan menggunakan bahasa antarmuka yang dipilih, terutama Indonesia
atau Inggris.

### 5.7 Listening dan YouTube Learning

Fitur yang direncanakan: - Katalog konten yang kompatibel. - Input URL
YouTube. - Subtitle Jepang jika tersedia. - Terjemahan Indonesia/Inggris
jika tersedia atau dapat dibuat secara sah. - Transcript. - Terjemahan
per kalimat. - Ekstraksi kosakata dan grammar. - Listening quiz. -
Pemutaran ulang per kalimat/kata. - Shadowing.

Tidak semua video menyediakan subtitle/transcript yang dapat diproses.
Fitur harus menampilkan status kompatibilitas dan fallback. Integrasi
harus mengikuti ketentuan YouTube, hak cipta, lisensi, dan izin
penggunaan konten. Jangan mengasumsikan semua video boleh diunduh atau
diekstrak audionya.

### 5.8 Impor Materi

Format: - PDF. - TXT. - CSV. - Input manual.

Alur: 1. Pilih file atau input manual. 2. Validasi format, ukuran, dan
integritas. 3. Ekstrak teks. 4. Tampilkan preview. 5. Izinkan pengguna
mengedit hasil ekstraksi. 6. Simpan ke library lokal. 7. Opsional
membuat latihan dari materi.

Materi pribadi tidak boleh dikirim ke AI online tanpa persetujuan yang
jelas.

### 5.9 Progress

-   Grafik harian dan mingguan.
-   Waktu belajar.
-   Streak.
-   Akurasi per kategori.
-   Vocabulary dan kanji yang dikuasai.
-   Riwayat kuis unlock.
-   Perkembangan terhadap baseline.
-   Estimasi kesiapan ujian dengan penjelasan bahwa itu bukan jaminan
    kelulusan.

## 6. Navigasi dan Layar

Navigasi utama menggunakan lima menu:

1.  **Home:** target hari ini, progres, streak, aplikasi terlindungi,
    status izin, dan tombol lanjut belajar.
2.  **Learn:** kategori materi, AI Tutor, listening, dan library.
3.  **Focus:** daftar aplikasi, aturan, jadwal, emergency unlock, dan
    riwayat.
4.  **Progress:** statistik, hasil diagnostik, dan perkembangan
    kemampuan.
5.  **Settings:** bahasa, profil lokal, backup/restore, izin, privasi,
    dan pengaturan AI.

Layar tambahan: - Welcome. - Onboarding. - Diagnostic. - Permission
Setup. - App Selector. - App Rule Detail. - Lock Screen. - Unlock
Quiz. - Emergency Dialog. - Learning Plan. - Lesson Detail. - AI
Tutor. - Material Import. - Backup & Restore. - Protection Status.

## 7. Aturan Focus Engine

### 7.1 Perhitungan penggunaan

Waktu penggunaan dihitung terpisah berdasarkan package name.

Contoh: - Instagram: 30 menit. - TikTok: 20 menit. - YouTube: 45
menit. - Game A: 60 menit.

Jika pengguna memakai Instagram 20 menit, TikTok 15 menit, lalu
Instagram 10 menit, total Instagram adalah 30 menit dan TikTok 15 menit.

### 7.2 State aplikasi

Status logis: - `PROTECTED` - `TRACKING` - `LOCKED` -
`QUIZ_IN_PROGRESS` - `TEMPORARILY_UNLOCKED` - `EMERGENCY_UNLOCKED`

Alur: - Aplikasi terlindungi mulai dipantau. - Ketika batas tercapai,
status menjadi `LOCKED`. - Kuis dimulai. - Jika skor kurang dari 100%,
aplikasi tetap terkunci. - Jika skor 100%, aplikasi dibuka selama 15
menit. - Setelah masa akses berakhir, perlindungan aktif kembali.

### 7.3 Kuis unlock

-   Tepat 10 soal per sesi.
-   Soal dipilih sesuai level, kurikulum, dan kemampuan.
-   Bank soal per kategori/level harus cukup besar dan diacak antar
    percobaan, sehingga unlock tidak bisa dihafal lewat trial-and-error
    tanpa memahami materi.
-   Nilai sempurna diperlukan untuk unlock.
-   Jawaban salah memicu penjelasan.
-   Kegagalan tidak mengubah status lock.
-   Hanya aplikasi terkait yang dibuka.
-   Waktu kuis tidak dihitung sebagai penggunaan aplikasi target.

### 7.4 Emergency unlock

-   Maksimal tiga penggunaan per hari.
-   Hanya untuk aplikasi yang sedang terkunci.
-   Tidak mengubah batas penggunaan permanen.
-   Setiap penggunaan dicatat.
-   Restart aplikasi tidak mengembalikan kuota.
-   Reset mengikuti tanggal lokal pengguna.

Tanpa server waktu sendiri, manipulasi jam perangkat saat offline tidak
dapat dicegah secara sempurna. Gunakan `elapsedRealtime` untuk durasi
akses selama boot berlangsung, deteksi perubahan waktu/boot jika
memungkinkan, dan jangan otomatis memberi kuota tambahan saat terjadi
perubahan waktu yang mencurigakan.

### 7.5 Strict dan Flexible

-   Strict: jadwal dan batas diterapkan sesuai konfigurasi.
-   Flexible: pengguna memiliki fleksibilitas sesuai aturan yang
    ditetapkan.
-   Detail perilaku flexible mode harus diselesaikan pada spesifikasi UX
    sebelum implementasi.

## 8. Arsitektur Teknologi

### 8.1 Stack

  Lapisan               Teknologi
  --------------------- -----------------------------------------
  Framework             Tauri 2
  Core/business logic   Rust
  UI                    Svelte + TypeScript
  Android integration   Kotlin/Java melalui Tauri mobile plugin
  Database              SQLite melalui Rust
  Async                 Tokio bila diperlukan
  Serialization         Serde
  Error handling        thiserror / anyhow
  HTTP opsional         reqwest
  Logging               tracing
  Build                 Cargo, Tauri CLI, Android SDK/NDK

### 8.2 Prinsip arsitektur

-   Rust menangani business logic.
-   Svelte menangani presentasi dan interaksi UI.
-   Kotlin/Java hanya menangani API sistem Android yang memerlukan
    native integration.
-   SQLite menjadi sumber data lokal utama.
-   Focus Engine tidak bergantung pada AI.
-   Quiz Engine dapat berjalan offline.
-   Tidak ada backend milik sendiri pada MVP.
-   Semua dependency harus diverifikasi kompatibilitasnya untuk Android
    ARM64.

### 8.3 Diagram

``` text
Svelte + TypeScript UI
        |
        | Tauri commands/events
        v
Rust Core
  |-- Focus Engine
  |-- Quiz Engine
  |-- Learning Engine
  |-- Adaptive Engine
  |-- AI Engine
  |-- Progress Engine
  |-- Storage Engine
        |
        +---- SQLite local
        |
        +---- Tauri Android Plugin
                  |
                  +---- UsageStatsManager
                  +---- Android lifecycle/service
                  +---- Lock Activity / overlay strategy
                  +---- Android permissions
```

### 8.4 Struktur repository yang disarankan

``` text
japanese-focus/
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   ├── commands/
│   │   └── state/
│   └── crates/
│       ├── focus-engine/
│       ├── quiz-engine/
│       ├── learning-engine/
│       ├── adaptive-engine/
│       ├── ai-engine/
│       ├── progress-engine/
│       └── storage-engine/
├── plugins/
│   └── tauri-plugin-android-focus/
│       ├── Cargo.toml
│       ├── src/
│       ├── guest-js/
│       └── android/
├── src/
│   ├── routes/
│   ├── lib/
│   │   ├── components/
│   │   ├── stores/
│   │   ├── services/
│   │   └── types/
│   └── styles/
├── static/
├── package.json
├── vite.config.ts
└── svelte.config.js
```

## 9. Android Native Integration

### 9.1 Kapabilitas

Plugin `tauri-plugin-android-focus` menangani: - Memeriksa dan membuka
halaman Usage Access. - Mengambil daftar aplikasi yang dapat dipilih. -
Mengakses usage events/statistics. - Menjalankan komponen pemantauan
sesuai batasan Android. - Memeriksa status perlindungan. - Meminta
tampilan lock screen melalui mekanisme yang diizinkan.

**Keputusan:** mekanisme blocking hanya memakai Usage Access, foreground
service, dan overlay. Accessibility Service tidak digunakan untuk
blocking (lihat 9.3).

### 9.2 Prinsip lifecycle

Jangan mengandalkan JavaScript timer atau WebView tetap aktif.
Pemantauan dan lifecycle harus ditangani melalui komponen native Android
yang sesuai. Rust menjadi pemilik aturan bisnis dan melakukan
rekonsiliasi data ketika aplikasi aktif kembali.

### 9.3 Batasan platform

Android membatasi pemantauan background dan kemampuan satu aplikasi
memblokir aplikasi lain. Usage Access, foreground service, dan overlay
memiliki ketentuan izin serta kebijakan distribusi masing-masing.

Accessibility Service tidak digunakan untuk mekanisme blocking. Google
Play melarang penggunaan Accessibility API untuk tujuan selain
aksesibilitas sesungguhnya; pelanggaran berisiko suspend/takedown
aplikasi. Jika kebutuhan di masa depan memerlukan Accessibility Service,
ini wajib melalui kajian ulang kebijakan Play Store sebelum
implementasi.

**Risiko distribusi Play Store:** Usage Access (`PACKAGE_USAGE_STATS`)
dan overlay (`SYSTEM_ALERT_WINDOW`) adalah permission sensitif yang
memerlukan Permission Declaration Form dan video demonstrasi saat
submission ke Play Console. Siapkan justifikasi penggunaan sejak awal
dan siapkan jalur distribusi alternatif (APK langsung/sideload) sebagai
mitigasi jika review Play Store gagal atau tertunda.

Mekanisme lock final wajib melalui prototype dan uji perangkat/versi
Android yang ditargetkan. Produk tidak boleh menjanjikan pemblokiran
anti-tamper atau 100% mutlak.

## 10. Database Lokal

Tabel inti:

  Tabel                     Fungsi
  ------------------------- ------------------------------
  `local_profile`           Profil pengguna lokal
  `app_rules`               Aturan perlindungan aplikasi
  `usage_sessions`          Sesi pemakaian
  `app_lock_states`         Status lock dan masa unlock
  `unlock_events`           Riwayat unlock
  `emergency_unlocks`       Riwayat emergency
  `learning_goals`          Target utama dan pendukung
  `goal_milestones`         Milestone
  `diagnostic_results`      Hasil tes awal
  `curricula`               Kurikulum
  `lessons`                 Materi
  `questions`               Bank soal
  `quiz_sessions`           Sesi kuis
  `quiz_answers`            Jawaban
  `skill_progress`          Kemampuan per kategori
  `vocabulary_progress`     Penguasaan kosakata
  `kanji_progress`          Penguasaan kanji
  `media_resources`         Metadata media
  `imported_materials`      Materi impor
  `conversation_sessions`   Sesi AI
  `conversation_messages`   Pesan percakapan
  `app_preferences`         Preferensi aplikasi
  `schema_migrations`       Versi skema database

Aturan: - ID lokal stabil. - Package name unik per perangkat. - Foreign
key diaktifkan. - Migrasi database berversi. - Timestamp disimpan
konsisten, dengan zona waktu lokal untuk aturan harian dan tampilan. -
File privat disimpan di direktori aplikasi jika disalin. - Pengguna
dapat menghapus data lokal dan materi impor.

### 10.1 Contoh SQL inti

``` sql
CREATE TABLE app_rules (
    id TEXT PRIMARY KEY,
    package_name TEXT NOT NULL UNIQUE,
    app_name TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    daily_limit_seconds INTEGER NOT NULL,
    unlock_duration_seconds INTEGER NOT NULL DEFAULT 900,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE usage_sessions (
    id TEXT PRIMARY KEY,
    app_rule_id TEXT NOT NULL,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (app_rule_id) REFERENCES app_rules(id)
);

CREATE TABLE unlock_events (
    id TEXT PRIMARY KEY,
    app_rule_id TEXT NOT NULL,
    unlock_type TEXT NOT NULL,
    unlocked_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (app_rule_id) REFERENCES app_rules(id)
);

CREATE TABLE emergency_unlocks (
    id TEXT PRIMARY KEY,
    app_rule_id TEXT NOT NULL,
    used_at TEXT NOT NULL,
    local_date TEXT NOT NULL,
    FOREIGN KEY (app_rule_id) REFERENCES app_rules(id)
);
```

## 11. Tauri Commands

Frontend berkomunikasi dengan Rust melalui command, bukan mengakses
database secara langsung.

Command yang direncanakan: - `focus_get_status` - `focus_get_apps` -
`focus_add_rule` - `focus_update_rule` - `focus_get_usage` -
`focus_start_quiz` - `quiz_submit_answer` - `quiz_complete` -
`focus_emergency_unlock` - `learning_get_plan` - `learning_get_lesson` -
`goal_create` - `progress_get_summary` - `ai_send_message` -
`backup_export` - `backup_restore`

Rust memvalidasi semua input dan status bisnis. Frontend tidak boleh
menentukan sendiri skor kuis atau masa unlock.

## 12. Backup dan Restore

MVP menggunakan backup manual: 1. Pengguna memilih Backup. 2. Aplikasi
mengekspor database dan metadata yang dipilih. 3. Pengguna menyimpan
file melalui Android document picker. 4. Pada perangkat/instalasi lain,
pengguna memilih Restore. 5. Aplikasi memvalidasi integritas dan versi
file. 6. Data dipulihkan dengan migrasi bila diperlukan.

Media berukuran besar dapat dikecualikan atau dipilih terpisah. Backup
tidak otomatis menjadi sinkronisasi cloud.

**Keputusan:** file backup dienkripsi dengan passphrase yang ditetapkan
pengguna saat ekspor, karena file dapat tersimpan di lokasi yang tidak
terkendali (cloud drive publik, kartu SD, dsb.). Tanpa passphrase,
pengguna diperingatkan bahwa file tidak terenkripsi sebelum lanjut.

## 13. Keamanan dan Privasi

-   Jangan mengumpulkan isi pesan, foto, atau data pribadi dari aplikasi
    lain.
-   Kumpulkan informasi penggunaan seminimal mungkin.
-   Jelaskan tujuan setiap izin.
-   Jangan mengirim daftar aplikasi terpasang ke layanan eksternal jika
    tidak diperlukan.
-   Gunakan HTTPS untuk koneksi AI online.
-   Jangan menanam API key rahasia developer di APK.
-   Materi pribadi tidak dikirim ke AI tanpa persetujuan.
-   Berikan kontrol untuk menghapus data dan materi lokal.
-   Lindungi backup yang berisi data pribadi.
-   Jangan mencatat token atau konten sensitif dalam log.
-   Aplikasi ditujukan untuk pembatasan diri sendiri pada perangkat
    sendiri. Tidak ada fitur monitoring jarak jauh atau akses data
    pengguna oleh pihak lain, untuk menghindari penyalahgunaan sebagai
    alat pengawasan (stalkerware).

## 14. Monetisasi dan Akun

### MVP

-   Tidak ada login wajib.
-   Tidak ada paywall.
-   Tidak ada Google Play Billing.
-   Tidak ada subscription entitlement.
-   Pengguna langsung masuk ke aplikasi.
-   Profil dan progress disimpan lokal.
-   Backup/restore manual tersedia.

### Pengembangan mendatang

Akun opsional dan sinkronisasi dapat ditambahkan melalui penyedia cloud
pihak ketiga tanpa mengelola server sendiri. Ini tetap menimbulkan
ketergantungan pada layanan eksternal dan memerlukan evaluasi privasi,
biaya, serta migrasi data.

Monetisasi premium ditunda sampai fungsi inti stabil dan kebutuhan
pengguna tervalidasi.

## 15. Testing dan Acceptance Criteria

### 15.1 Focus Engine

-   [ ] Aplikasi dapat dipilih untuk dilindungi.
-   [ ] Batas waktu berbeda berlaku per aplikasi.
-   [ ] Penggunaan dihitung individual.
-   [ ] Status lock berubah saat batas tercapai.
-   [ ] Kuis terdiri dari 10 soal.
-   [ ] Skor 9/10 tidak membuka aplikasi.
-   [ ] Skor 10/10 membuka aplikasi terkait selama 15 menit.
-   [ ] Aplikasi lain tidak ikut terbuka.
-   [ ] Emergency maksimal 3 kali per hari.
-   [ ] Restart tidak mengembalikan kuota emergency.
-   [ ] Waktu kuis tidak dihitung sebagai pemakaian target.
-   [ ] Status dapat direkonsiliasi setelah proses dihentikan/restart.

### 15.2 Learning Engine

-   [ ] Kategori belajar inti tersedia.
-   [ ] Pengguna dapat membuat target utama dan pendukung.
-   [ ] Level awal dapat dipilih manual atau melalui diagnostik.
-   [ ] Adaptive learning berjalan offline.
-   [ ] Materi yang diunduh dapat dipakai offline.
-   [ ] Progress tersimpan setelah aplikasi ditutup.
-   [ ] Diagnostic test menghasilkan baseline tersimpan dan dapat
    dilewati.

### 15.3 AI

-   [ ] Fitur inti tetap berjalan ketika AI online gagal.
-   [ ] AI online bersifat opsional.
-   [ ] Tidak ada secret API key developer di APK.
-   [ ] Model lokal tidak diwajibkan.
-   [ ] Kegagalan AI tidak mengganggu Focus Engine.

### 15.4 Data dan aplikasi

-   [ ] Database bertahan setelah restart.
-   [ ] Backup dapat diekspor.
-   [ ] Restore memvalidasi file.
-   [ ] Migrasi database diuji.
-   [ ] Pengguna dapat menghapus data lokal.
-   [ ] UI menampilkan status izin dengan jelas.

### 15.5 Performa dan baterai

Target awal berikut untuk divalidasi ulang setelah prototype Sprint
0--5:

-   [ ] Battery drain Focus Engine background < 2% per jam pada
    perangkat uji standar.
-   [ ] Ukuran APK rilis < 50 MB tanpa model AI lokal.
-   [ ] Cold start aplikasi < 3 detik pada perangkat kelas menengah.
-   [ ] Tidak memicu low-memory kill saat idle pada perangkat 2 GB RAM.

### 15.6 Skenario perangkat

Uji: - Android minimum yang ditargetkan dan versi terbaru yang
didukung. - Perangkat RAM rendah. - Optimasi baterai agresif. - Battery
saver. - Proses aplikasi dihentikan. - Perangkat restart ketika target
terkunci. - Usage Access dicabut. - Target aplikasi dihapus atau
diperbarui. - Penggunaan beberapa aplikasi secara bergantian. -
Perubahan jam perangkat. - WebView dihentikan dan dibuka kembali.

## 16. Roadmap Sprint

  Sprint   Fokus                         Output
  -------- ----------------------------- ---------------------------
  0        Setup Rust, Tauri 2, Svelte   APK dasar berhasil dibuat
  1        SQLite dan storage engine     Database lokal
  2        Android focus plugin          Akses Usage Access
  3        Focus Engine Rust             Penghitungan penggunaan
  4        Lock integration              Prototype lock
  5        Quiz Engine                   Kuis dan unlock
  6        Learning Engine               Materi dan kuis offline
  7        Goals dan Progress            Target dan statistik
  8        Backup & Restore              Ekspor/impor
  9        AI Engine                     Hybrid AI
  10       Listening dan voice           Audio dan percakapan
  11       Material import               PDF, TXT, CSV
  12       QA perangkat                  Pengujian dan stabilisasi

Sprint 0--5 merupakan prioritas. Jangan mengembangkan semua fitur
belajar sebelum Focus Engine terbukti bekerja pada perangkat Android
yang ditargetkan.

## 17. Risiko Teknis

  -----------------------------------------------------------------------
  Risiko                              Mitigasi
  ----------------------------------- -----------------------------------
  Android membatasi background        Native lifecycle integration dan
                                      rekonsiliasi

  Lock tidak selalu tampil            Prototype dan pengujian OEM/OS

  Tauri plugin tidak kompatibel       Verifikasi dukungan Android tiap
                                      plugin

  WebView tidak aktif                 Jangan bergantung pada JavaScript
                                      timer

  SQLite build Android                Uji ARM64 dan native linking

  Baterai boros                       Hindari polling terlalu agresif

  AI lokal terlalu berat              Model lokal opsional

  API key bocor                       BYOK atau model lokal

  Manipulasi jam offline              Monotonic time, deteksi perubahan,
                                      dokumentasi batasan

  YouTube tidak menyediakan           Status kompatibilitas dan fallback
  transcript                          

  Kebijakan distribusi Play Store     Siapkan Permission Declaration
  (Usage Access, overlay)             Form, justifikasi penggunaan, dan
                                      jalur distribusi alternatif
                                      (sideload) sebagai mitigasi
  -----------------------------------------------------------------------

## 18. Prioritas Implementasi Pertama

### Focus Engine Prototype --- P0

Target: 1. Setup repository Rust + Tauri 2 + Svelte. 2. Build APK
Android. 3. Implementasi plugin native Android. 4. Memeriksa Usage
Access. 5. Menampilkan daftar aplikasi yang dapat dipilih. 6. Membaca
usage events/statistics. 7. Menghitung penggunaan per aplikasi. 8.
Menyimpan aturan dan sesi ke SQLite. 9. Membuktikan mekanisme lock pada
perangkat uji. 10. Menguji kuis sederhana dan unlock sementara. 11.
Menguji restart, pencabutan izin, dan background restrictions.

**Definition of Done:** satu aplikasi target berhasil dipantau dan masuk
status terkunci secara konsisten pada perangkat Android yang diuji,
termasuk setelah Japanese Focus ditutup dan dibuka kembali, dalam batas
kemampuan dan kebijakan Android.

## 19. Status Dokumen

  Area                       Status
  -------------------------- ----------------------
  Konsep dan tujuan produk   Ditetapkan
  Aturan app blocking        Ditetapkan
  Sistem belajar             Dirancang
  Target dan diagnostik      Ditetapkan
  AI hybrid                  Ditetapkan
  Akun opsional              Ditetapkan
  Monetisasi ditunda         Ditetapkan
  Rust + Tauri 2             Dipilih
  Svelte + TypeScript        Dipilih sebagai UI
  SQLite lokal               Dipilih
  Plugin native Android      Diperlukan
  Focus Engine Android       Perlu prototype
  Detail strict/flexible     Perlu spesifikasi UX
  Model AI dan provider      Perlu pemilihan
  Desain UI final            Belum dibuat
  Justifikasi Play Store     Perlu disiapkan sebelum submission

## 20. Referensi Teknis

-   Tauri 2: https://v2.tauri.app/
-   Tauri mobile plugin development:
    https://v2.tauri.app/develop/plugins/develop-mobile/
-   Tauri plugin development: https://v2.tauri.app/develop/plugins/
-   Rust: https://www.rust-lang.org/
-   Android UsageStatsManager:
    https://developer.android.com/reference/android/app/usage/UsageStatsManager
-   Android foreground services:
    https://developer.android.com/develop/background-work/services/foreground-services
-   Android document picker:
    https://developer.android.com/training/data-storage/shared/documents-files

------------------------------------------------------------------------

**Dokumen ini merupakan PRD dan rancangan teknis baseline Japanese Focus
v1.2.** Bagian yang berstatus "perlu prototype" atau "perlu pemilihan"
harus divalidasi sebelum dianggap sebagai spesifikasi implementasi
final.
