import type { Question, QuestionCategory, CurriculumLevel } from './types';

// 36 N5-level questions across 6 text-based categories, >=6 per category so
// a 10-question sample reshuffles rather than repeating. Listening and
// Conversation are excluded — they need audio/AI, out of scope here.
export const QUESTION_BANK: Question[] = [
  { id: 'vocabulary-1', level: 'N5', category: 'vocabulary', prompt: '「猫」artinya?', choices: ['Anjing', 'Kucing', 'Burung', 'Ikan'], answerIndex: 1, explanation: '猫 (neko) = kucing.' },
  { id: 'vocabulary-2', level: 'N5', category: 'vocabulary', prompt: '「水」artinya?', choices: ['Api', 'Air', 'Tanah', 'Angin'], answerIndex: 1, explanation: '水 (mizu) = air.' },
  { id: 'vocabulary-3', level: 'N5', category: 'vocabulary', prompt: '「食べる」artinya?', choices: ['Minum', 'Makan', 'Tidur', 'Lari'], answerIndex: 1, explanation: '食べる (taberu) = makan.' },
  { id: 'vocabulary-4', level: 'N5', category: 'vocabulary', prompt: '「大きい」artinya?', choices: ['Kecil', 'Besar', 'Panas', 'Dingin'], answerIndex: 1, explanation: '大きい (ookii) = besar.' },
  { id: 'vocabulary-5', level: 'N5', category: 'vocabulary', prompt: '「学校」artinya?', choices: ['Rumah', 'Sekolah', 'Kantor', 'Toko'], answerIndex: 1, explanation: '学校 (gakkou) = sekolah.' },
  { id: 'vocabulary-6', level: 'N5', category: 'vocabulary', prompt: '"Teman" dalam bahasa Jepang?', choices: ['先生', '友達', '医者', '学生'], answerIndex: 1, explanation: '友達 (tomodachi) = teman.' },
  { id: 'grammar-1', level: 'N5', category: 'grammar', prompt: 'わたし___学生です。', choices: ['は', 'を', 'に', 'で'], answerIndex: 0, explanation: 'Partikel は menandai topik kalimat.' },
  { id: 'grammar-2', level: 'N5', category: 'grammar', prompt: '本___読みます。', choices: ['は', 'が', 'を', 'と'], answerIndex: 2, explanation: 'を menandai objek langsung kata kerja.' },
  { id: 'grammar-3', level: 'N5', category: 'grammar', prompt: '学校___行きます。', choices: ['に', 'の', 'と', 'や'], answerIndex: 0, explanation: 'に menunjukkan tujuan/arah.' },
  { id: 'grammar-4', level: 'N5', category: 'grammar', prompt: 'これ___ペンです。', choices: ['が', 'は', 'を', 'へ'], answerIndex: 1, explanation: 'は menandai topik "ini".' },
  { id: 'grammar-5', level: 'N5', category: 'grammar', prompt: '田中さん___会います。', choices: ['を', 'に', 'で', 'の'], answerIndex: 1, explanation: 'に dipakai dengan 会う (bertemu).' },
  { id: 'grammar-6', level: 'N5', category: 'grammar', prompt: '公園___散歩します。', choices: ['を', 'に', 'で', 'へ'], answerIndex: 2, explanation: 'で menunjukkan tempat aktivitas berlangsung.' },
  { id: 'kanji-1', level: 'N5', category: 'kanji', prompt: '「山」dibaca?', choices: ['やま', 'かわ', 'うみ', 'もり'], answerIndex: 0, explanation: '山 (yama) = gunung.' },
  { id: 'kanji-2', level: 'N5', category: 'kanji', prompt: '「日」dibaca?', choices: ['ひ', 'つき', 'ほし', 'そら'], answerIndex: 0, explanation: '日 (hi) = matahari/hari.' },
  { id: 'kanji-3', level: 'N5', category: 'kanji', prompt: '「人」dibaca?', choices: ['ひと', 'いぬ', 'ねこ', 'とり'], answerIndex: 0, explanation: '人 (hito) = orang.' },
  { id: 'kanji-4', level: 'N5', category: 'kanji', prompt: '「木」dibaca?', choices: ['き', 'いし', 'みず', 'つち'], answerIndex: 0, explanation: '木 (ki) = pohon.' },
  { id: 'kanji-5', level: 'N5', category: 'kanji', prompt: '「火」dibaca?', choices: ['ひ', 'みず', 'かぜ', 'つち'], answerIndex: 0, explanation: '火 (hi) = api.' },
  { id: 'kanji-6', level: 'N5', category: 'kanji', prompt: '「子」dibaca?', choices: ['こ', 'おや', 'あに', 'いもうと'], answerIndex: 0, explanation: '子 (ko) = anak.' },
  { id: 'reading-1', level: 'N5', category: 'reading', prompt: '「わたしは毎朝六時に起きます。」Jam berapa bangun?', choices: ['5', '6', '7', '8'], answerIndex: 1, explanation: '六時 = jam 6.' },
  { id: 'reading-2', level: 'N5', category: 'reading', prompt: '「田中さんは学校の先生です。」Pekerjaan Tanaka?', choices: ['Dokter', 'Guru', 'Siswa', 'Petani'], answerIndex: 1, explanation: '先生 = guru.' },
  { id: 'reading-3', level: 'N5', category: 'reading', prompt: '「今日は雨です。かさを持って行きます。」Kenapa bawa payung?', choices: ['Panas', 'Hujan', 'Angin', 'Salju'], answerIndex: 1, explanation: '雨 = hujan.' },
  { id: 'reading-4', level: 'N5', category: 'reading', prompt: '「わたしの家族は四人です。」Berapa anggota keluarga?', choices: ['3', '4', '5', '6'], answerIndex: 1, explanation: '四人 = empat orang.' },
  { id: 'reading-5', level: 'N5', category: 'reading', prompt: '「この店は九時に開きます。」Toko buka jam?', choices: ['8', '9', '10', '11'], answerIndex: 1, explanation: '九時 = jam 9.' },
  { id: 'reading-6', level: 'N5', category: 'reading', prompt: '「彼女は毎日日本語を勉強します。」Apa yang dipelajari setiap hari?', choices: ['Matematika', 'Bahasa Jepang', 'Musik', 'Olahraga'], answerIndex: 1, explanation: '日本語を勉強します = belajar bahasa Jepang.' },
  { id: 'translation-1', level: 'N5', category: 'translation', prompt: '"Terima kasih" dalam bahasa Jepang?', choices: ['すみません', 'ありがとう', 'おはよう', 'さようなら'], answerIndex: 1, explanation: 'ありがとう = terima kasih.' },
  { id: 'translation-2', level: 'N5', category: 'translation', prompt: '"Selamat pagi" dalam bahasa Jepang?', choices: ['こんばんは', 'こんにちは', 'おはよう', 'おやすみ'], answerIndex: 2, explanation: 'おはよう = selamat pagi.' },
  { id: 'translation-3', level: 'N5', category: 'translation', prompt: '"Maaf" dalam bahasa Jepang?', choices: ['ありがとう', 'すみません', 'はじめまして', 'いただきます'], answerIndex: 1, explanation: 'すみません = maaf/permisi.' },
  { id: 'translation-4', level: 'N5', category: 'translation', prompt: '"Saya mengerti" dalam bahasa Jepang?', choices: ['わかりません', 'わかりました', 'しりません', 'いいです'], answerIndex: 1, explanation: 'わかりました = saya mengerti/paham.' },
  { id: 'translation-5', level: 'N5', category: 'translation', prompt: '"Berapa harganya?" dalam bahasa Jepang?', choices: ['いくらですか', 'どこですか', 'なんじですか', 'だれですか'], answerIndex: 0, explanation: 'いくらですか = berapa harganya?' },
  { id: 'translation-6', level: 'N5', category: 'translation', prompt: '"Enak" (makanan) dalam bahasa Jepang?', choices: ['おいしい', 'たのしい', 'うれしい', 'さむい'], answerIndex: 0, explanation: 'おいしい = enak.' },
  { id: 'sentence-1', level: 'N5', category: 'sentence', prompt: 'Susun jadi "Saya pergi ke sekolah":', choices: ['わたしは学校に行きます', '学校はわたしに行きます', '行きますわたしは学校に', 'に学校はわたし行きます'], answerIndex: 0, explanation: 'Urutan baku: topik(は) → tujuan(に) → kata kerja.' },
  { id: 'sentence-2', level: 'N5', category: 'sentence', prompt: 'Susun jadi "Ini buku":', choices: ['ペンはこれです', 'これは本です', '本はこれです本', 'これ本はです'], answerIndex: 1, explanation: 'これは本です = ini buku.' },
  { id: 'sentence-3', level: 'N5', category: 'sentence', prompt: 'Susun jadi "Dia makan nasi":', choices: ['ごはんを彼は食べます', '彼はごはんを食べます', '食べますごはんを彼は', '彼を食べますごはんは'], answerIndex: 1, explanation: 'topik(は) → objek(を) → kata kerja.' },
  { id: 'sentence-4', level: 'N5', category: 'sentence', prompt: 'Susun jadi "Besok saya belajar":', choices: ['わたしは明日勉強します', '明日はわたし勉強します', '勉強しますわたしは明日', '明日勉強はわたしします'], answerIndex: 0, explanation: 'わたしは明日勉強します = besok saya belajar.' },
  { id: 'sentence-5', level: 'N5', category: 'sentence', prompt: 'Susun jadi "Itu rumah saya":', choices: ['わたしのはあれ家です', 'あれはわたしの家です', '家はあれのわたしです', 'わたし家はあれのです'], answerIndex: 1, explanation: 'あれはわたしの家です = itu rumah saya.' },
  { id: 'sentence-6', level: 'N5', category: 'sentence', prompt: 'Susun jadi "Kucing itu tidur":', choices: ['猫はねます', 'ねます猫は', 'は猫ねます', '猫ねますは'], answerIndex: 0, explanation: '猫はねます = kucing itu tidur.' },
];

export const CATEGORIES: { key: QuestionCategory; jp: string; label: string }[] = [
  { key: 'vocabulary', jp: '語', label: 'Vocabulary' },
  { key: 'grammar', jp: '文', label: 'Grammar' },
  { key: 'kanji', jp: '漢', label: 'Kanji' },
  { key: 'reading', jp: '読', label: 'Reading' },
  { key: 'translation', jp: '訳', label: 'Translation' },
  { key: 'sentence', jp: '並', label: 'Sentence Arrangement' },
];

export function questionsForLevel(level: CurriculumLevel): Question[] {
  return QUESTION_BANK.filter((q) => q.level === level);
}

export function questionsForCategory(level: CurriculumLevel, category: QuestionCategory | 'all'): Question[] {
  const pool = questionsForLevel(level);
  return category === 'all' ? pool : pool.filter((q) => q.category === category);
}
