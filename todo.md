# Japben — To Do (vs PRD)

Status per 2026-11-16. Lihat `prd.md` untuk spesifikasi lengkap.

**Catatan:** item bertanda `(web)` berarti sudah jalan di versi website
(browser, `npm run dev`, data di localStorage) tapi BELUM di-port ke
Rust/SQLite/Android — lihat §"Website version" di bawah.

## 🔴 P0 — Lock mechanism & Kuis Unlock (inti produk, belum tercapai)

- [ ] State machine lock (`PROTECTED→TRACKING→LOCKED→QUIZ_IN_PROGRESS→TEMPORARILY_UNLOCKED→EMERGENCY_UNLOCKED`)
- [ ] Tabel `app_lock_states`
- [ ] Foreground service Android (pemantauan kontinu — saat ini cuma baca usage on-demand pas tab dibuka)
- [ ] Izin overlay (`SYSTEM_ALERT_WINDOW`) + Lock Activity
- [ ] Bank soal + tabel `questions`, `quiz_sessions`, `quiz_answers`
- [ ] UI Unlock Quiz (10 soal, nilai sempurna wajib)
- [ ] Unlock sementara 15 menit setelah skor 100%
- [ ] Emergency unlock (maks 3x/hari, tabel `emergency_unlocks`, reset per tanggal lokal)
- [ ] Strict/Flexible schedule per app (field jadwal di `app_rules`)
- [ ] Riwayat pemakaian & unlock (`usage_sessions`, `unlock_events`)
- [ ] Layar Protection Status

## 🟡 Learning Engine (web jalan, Android/Rust belum)

- [x] Kategori (web): Vocabulary, Grammar, Reading, Translation, Kanji, Sentence Arrangement — 36 soal N5
- [ ] Listening, Conversation (AI) — butuh audio/AI, belum ada di web maupun Android
- [ ] Kurikulum berjenjang N4–N1, JFT-Basic, Custom — tipe sudah ada (`CurriculumLevel`), konten cuma N5
- [x] Diagnostic test (web) — 10 soal campuran, estimasi level kasar (bukan placement test tervalidasi)
- [ ] Spaced repetition + adaptive difficulty — belum ada sama sekali
- [ ] Tabel Rust/SQLite `curricula`, `lessons`, `skill_progress`, `vocabulary_progress`, `kanji_progress` — baru ada versi TS/localStorage (`src/lib/services/learning/`)

## 🟡 Learning Goals & Progress (web jalan, Android/Rust belum)

- [x] Target utama + deadline + milestone (web) — form sederhana, milestone generate otomatis (bukan scheduler kurikulum nyata)
- [x] Grafik progress per kategori nyata (web) — dari quiz history lokal
- [x] Streak & level asli (web) — Home sudah tampil data real, bukan placeholder lagi
- [x] Estimasi kesiapan ujian (web) — blend kasar akurasi+diagnostik+mastery, dilabeli jelas "bukan jaminan kelulusan"

## 🔴 AI Tutor (0%)

- [ ] Keputusan model: lokal vs BYOK online (PRD: "perlu pemilihan")
- [ ] Tabel `conversation_sessions`, `conversation_messages`
- [ ] UI chat + mode (text/voice/roleplay)

## 🔴 Lainnya (0%)

- [ ] Listening & YouTube learning (subtitle, transcript, shadowing) — ada pertimbangan legal/ToS
- [ ] Material import (PDF/TXT/CSV) — butuh verifikasi lib ekstraksi PDF kompatibel ARM64
- [ ] Backup & Restore (export+encrypt DB, document picker) — Settings sudah nunjukin placeholder jujur "belum tersedia"

## 🟡 Sudah jalan (sebagian)

- [x] Setup Tauri 2 + Rust + Svelte 5 + Android (Sprint 0), APK jalan di device fisik & emulator
- [x] Storage: tabel `app_rules`, `app_preferences` (dari ~20 tabel yang diminta PRD Bab 10)
- [x] Plugin native: cek Usage Access, daftar app asli, baca usage stats — **on-demand**, bukan background service kontinu
- [x] Tab Home/Focus/Settings nyata (data asli, bukan dummy)
- [x] Tab Learn/Progress nyata di web (lihat §Website version) — Android/Rust masih belum

## Backend server (baru, folder terpisah `server/`, belum di-wire ke frontend)

Server standalone Node (Express + `node:sqlite` bawaan Node 26 + JWT) di
`server/` — sengaja terpisah dari `src`/`src-tauri`, belum dipanggil dari
Svelte manapun. Ini pivot terencana dari prinsip local-first PRD §14 (akun+sync
opsional, dulu diasumsikan lewat BaaS pihak ketiga, sekarang self-host) —
bukan pelanggaran: sync cuma balikin data user ke device user sendiri.

- [x] `POST /auth/register`, `/auth/login` — email+password, bcryptjs, JWT 30 hari
- [x] `GET/PUT /sync/:key` — simpen blob JSON apa adanya (mirror `jf_learning_v1`/`jf_settings_v1` dari localStorage), last-write-wins
- [x] `POST /ai/proxy` — BYOK generic passthrough (client kirim baseUrl+path+headers+body, server cuma terusin) + **SSRF allowlist wajib** di hostname (default: Anthropic/OpenAI/Gemini/Mistral/OpenRouter)
- [x] Rate limit in-memory di `/auth/*` dan `/ai/*`
- [x] Diverifikasi end-to-end pakai curl: register/login/duplicate/wrong-password, sync round-trip, 401 tanpa token, SSRF blocked, proxy beneran nyampe ke Anthropic (dapat 401 asli dari mereka pakai dummy key), rate limit nge-trigger di request ke-11
- [ ] **Belum dikerjakan**: wiring frontend (syncService.ts + UI login/sync toggle di Settings), OAuth/email verification/reset password, payment (sengaja ditunda, PRD §14/§19), SSE streaming AI proxy, deploy/hosting (jalan lokal doang sekarang)

## Website version (browser, tanpa Tauri/Android)

`npm run dev` jalan sebagai website biasa (tanpa shell Tauri). Learning
Engine/Quiz/Goals/Progress diimplementasikan langsung di source Svelte asli
(`src/lib/services/learning/`, bukan prototipe terpisah — `mvp-html/` sudah
dihapus) pakai localStorage, karena fitur-fitur ini tidak butuh OS
integration. `src/lib/services/commands.ts` deteksi Tauri vs browser lewat
`isTauri()` dan bercabang otomatis.

- Focus tab di web sengaja nunjukkin "Focus belum tersedia di versi web" —
  Usage Access adalah API Android, tidak ada ekuivalennya di browser.
- Settings (profil/bahasa/tema) tetap jalan penuh di web via localStorage.
- Belum ada port ke Rust/SQLite — tipe data di `learning/types.ts` sengaja
  dibuat mirip nama tabel PRD §10 biar portingnya gampang nanti, tapi
  portingnya sendiri belum dikerjakan.
- Di luar scope pass ini: AI Tutor, Listening, Conversation, Material
  Import, Backup terenkripsi, spaced repetition asli (SM-2), kuis mode
  `'unlock'` yang terikat ke Focus lock (butuh Android).

## 🟡 Belum pernah diuji

- [ ] Performa & baterai (Bab 15.5): battery drain, ukuran APK rilis <50MB, cold start <3s, low-memory 2GB RAM
- [ ] Skenario device (Bab 15.6): restart saat terkunci, RAM rendah, battery saver, Usage Access dicabut, app target dihapus, WebView di-restart
- [ ] Acceptance criteria Learning Engine & AI (semua belum applicable, fiturnya belum ada)

## Known issues (sudah di-fix sesi ini, re-verify setelah build berikutnya)

- [x] Overlap topbar dengan status bar Android (`env(safe-area-inset-top)`)
- [x] Topbar (brand/tema/avatar) tidak pernah render — salah syntax slot Svelte 4 vs snippet Svelte 5
- [x] Hang di tab Focus di HP Huawei fisik — operasi native dipindah ke background thread di Kotlin
- [x] Tema tidak pernah direstore/tersimpan
- [x] Validasi `daily_limit_seconds` di Rust
- [x] Dedup daftar app installed
- [x] **Re-verified 2026-11-16** di emulator Japben_Test: layar putih ~3-4 detik pas cold start lalu render normal — konfirmasi cuma timing (WebView+JS bundle loading), bukan regresi.

## UI polish

- [ ] Avatar profil di topbar (`src/App.svelte` — `<button class="avatar">`) masih kotak/default, belum ada styling (nggak ada `.avatar` di `global.css` maupun scoped style manapun)
- [ ] Switch tema di topbar (`<label class="theme-control">` + `<select>`, `src/App.svelte`) mau disembunyikan dari topbar — tema cukup diatur dari tab Settings aja (sudah ada section TEMA di `SettingsScreen.svelte`, jadi ini cuma soal hapus dropdown topbar + styling-nya, bukan nambah fitur baru)
- [ ] Tombol hardware back Android langsung nutup seluruh app dari layar manapun (termasuk dari dalam overlay kuis) — navigasi tab/overlay pakai state Svelte, bukan browser history, jadi Android nggak punya apa-apa buat di-back-in. Ditemukan pas tes build di emulator 2026-11-16.
- [x] **Fixed 2026-11-16**: kanji dekoratif (`.japanese-mark` di `EditorialHeader.svelte`) overlap teks `<p>` deskripsi kalau wrap 2 baris — dikasih `padding-right` di `<p>` biar nyisain ruang buat kanji-nya, nggak masalah berapa baris pun. Diverifikasi di viewport 375px pada tab Settings (deskripsi terpanjang).
- [x] **Fixed 2026-11-16**: Settings (`SettingsScreen.svelte`) digabung jadi 1 `<section class="card">` dengan `.card-row` + `border-top` sebagai divider, bukan 7 card terpisah lagi.

## Fitur baru 2026-11-16: AI Assist

- [x] Menu **Learn** diubah jadi **AI Assist** (`src/lib/components/learning/AiAssistScreen.svelte`) — chat/ngobrol biasa, bukan category-picker+quiz. Nav label+icon berubah jadi "AI Assist"/話.
- [x] Latihan kategori + tes diagnostik (`CategoryPicker`+`QuizOverlay`, sebelumnya di `LearnScreen.svelte` yang sekarang dihapus) dipindah jadi bagian atas tab **Progress** (`ProgressScreen.svelte`) — Progress sekarang: latihan & diagnostik + statistik + goal, semua di satu tempat.
- [x] AI Assist connect ke proxy BYOK `server/` (`POST /ai/proxy`) via `src/lib/services/serverClient.ts` (baru — akun Japben: register/login/JWT di localStorage `jf_server_token`) + `src/lib/services/learning/aiAssist.ts` (baru — preset Anthropic/OpenAI, build request per-provider, parse balasan, riwayat chat di localStorage `jf_ai_assist_v1`).
- [x] Alur consent: AI Assist cek `prefs.aiOnlineEnabled` (field yang udah ada di `AppPreferences`) sebelum nunjukin form API key — toggle di Settings sekarang beneran (sebelumnya `disabled`).
- [x] Diverifikasi end-to-end (Playwright): register → consent gate → pilih provider+API key → kirim pesan → error upstream (dummy key invalid) ke-relay dan tampil inline, bukan crash.
- [ ] **Belum**: `CORS_ORIGIN` server cuma 1 origin (`http://localhost:5173`) — AI Assist dari build Android/Tauri (origin beda) bakal kena CORS block sampai ini di-generalize.
- [ ] **Belum**: server URL (`http://localhost:8787`) masih hardcoded di `serverClient.ts`, belum ada UI buat ganti — oke selama server jalan lokal doang.
- [ ] Di luar scope: voice/roleplay mode, streaming reply (server masih non-streaming v1).
