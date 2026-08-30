// ====================================================================
// Tajweed Rules Metadata & Design Tokens
// Categorized according to classical Tajweed pedagogy
// ====================================================================

export interface TajweedCategory {
  id: string
  nameAr: string
  rules: TajweedRule[]
}

export interface TajweedRule {
  id: string
  nameAr: string
  category: string
  color: string // Tailwind or hex color
  bgColor: string
  borderColor: string
  description: string
  letters: string[]
  examples: { text: string; surahAyah: string }[]
}

export const TAJWEED_RULES: TajweedRule[] = [
  // أحكام النون الساكنة والتنوين
  {
    id: 'izhar_halqi',
    nameAr: 'الإظهار الحلقي',
    category: 'noon_sakinah',
    color: '#0284c7', // Sky blue
    bgColor: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300',
    borderColor: 'border-sky-500',
    description: 'إخراج النون الساكنة أو التنوين من مخرجها بغير غنة ظاهرة عند ملاقاة أحد حروف الحلق الستة.',
    letters: ['ء', 'هـ', 'ع', 'ح', 'غ', 'خ'],
    examples: [
      { text: 'مَنْ ءَامَنَ', surahAyah: 'البقرة: 62' },
      { text: 'عَلِيمٌ حَكِيمٌ', surahAyah: 'النساء: 26' },
      { text: 'يَنْئَوْنَ', surahAyah: 'الأنعام: 26' }
    ]
  },
  {
    id: 'idgham_ghunnah',
    nameAr: 'الإدغام بغنة',
    category: 'noon_sakinah',
    color: '#16a34a', // Green
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-500',
    description: 'دمج النون الساكنة أو التنوين في الحرف التالي بحيث يصيران حرفاً مشدداً مع بقاء الغنة بمقدار حركتين في حروف (ينمو).',
    letters: ['ي', 'ن', 'م', 'و'],
    examples: [
      { text: 'مَن يَقُولُ', surahAyah: 'البقرة: 8' },
      { text: 'مِّن مَّالٍ', surahAyah: 'المؤمنون: 55' },
      { text: 'هُدًى وَرَحْمَةٌ', surahAyah: 'الأعراف: 154' }
    ]
  },
  {
    id: 'idgham_bighair_ghunnah',
    nameAr: 'الإدغام بغير غنة',
    category: 'noon_sakinah',
    color: '#059669', // Deep green
    bgColor: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300',
    borderColor: 'border-teal-500',
    description: 'دمج النون الساكنة أو التنوين في حرفي (اللام والراء) دمجاً كاملاً بدون غنة.',
    letters: ['ل', 'ر'],
    examples: [
      { text: 'مِّن رَّبِّهِمْ', surahAyah: 'البقرة: 5' },
      { text: 'هُدًى لِّلْمُتَّقِينَ', surahAyah: 'البقرة: 2' }
    ]
  },
  {
    id: 'iqlab',
    nameAr: 'الإقلاب',
    category: 'noon_sakinah',
    color: '#ea580c', // Orange
    bgColor: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-500',
    description: 'قلب النون الساكنة أو التنوين إلى ميم مخفاة بغنة بمقدار حركتين عند حرف الباء.',
    letters: ['ب'],
    examples: [
      { text: 'مِنۢ بَعْدِ', surahAyah: 'البقرة: 27' },
      { text: 'عَلِيمٌۢ بِذَاتِ الصُّدُورِ', surahAyah: 'آل عمران: 119' },
      { text: 'أَنۢبِئْهُم', surahAyah: 'البقرة: 33' }
    ]
  },
  {
    id: 'ikhfa_haqiqi',
    nameAr: 'الإخفاء الحقيقي',
    category: 'noon_sakinah',
    color: '#9333ea', // Purple
    bgColor: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-500',
    description: 'النطق بالنون الساكنة أو التنوين بصفة بين الإظهار والإدغام مع بقاء الغنة بمقدار حركتين عند 15 حرفاً.',
    letters: ['ص', 'ذ', 'ث', 'ك', 'ج', 'ش', 'ق', 'س', 'د', 'ط', 'ز', 'ف', 'ت', 'ض', 'ظ'],
    examples: [
      { text: 'مِّن قَبْلِ', surahAyah: 'البقرة: 25' },
      { text: 'كُنتُمْ', surahAyah: 'البقرة: 23' },
      { text: 'رِزْقًا قَالُوا۟', surahAyah: 'البقرة: 25' }
    ]
  },

  // أحكام الميم الساكنة
  {
    id: 'ikhfa_shafawi',
    nameAr: 'الإخفاء الشفوي',
    category: 'meem_sakinah',
    color: '#7c3aed',
    bgColor: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300',
    borderColor: 'border-violet-500',
    description: 'إخفاء الميم الساكنة بغنة عند ملاقاة حرف الباء.',
    letters: ['ب'],
    examples: [
      { text: 'تَرْمِيهِم بِحِجَارَةٍ', surahAyah: 'الفيل: 4' },
      { text: 'يَعْتَصِم بِاللَّهِ', surahAyah: 'آل عمران: 101' }
    ]
  },
  {
    id: 'idgham_shafawi',
    nameAr: 'إدغام المتماثلين الصغير',
    category: 'meem_sakinah',
    color: '#15803d',
    bgColor: 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300',
    borderColor: 'border-green-500',
    description: 'إدغام الميم الساكنة في الميم المتحركة بعدها مع الغنة بمقدار حركتين.',
    letters: ['م'],
    examples: [
      { text: 'لَهُم مَّا يَشَآءُونَ', surahAyah: 'ق: 35' },
      { text: 'فِي قُلُوبِهِم مَّرَضٌ', surahAyah: 'البقرة: 10' }
    ]
  },
  {
    id: 'izhar_shafawi',
    nameAr: 'الإظهار الشفوي',
    category: 'meem_sakinah',
    color: '#0369a1',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300',
    borderColor: 'border-cyan-500',
    description: 'إظهار الميم الساكنة عند باقي الحروف الهجائية، وتكون أشد إظهاراً عند الواو والفاء.',
    letters: ['باقي الحروف ما عدا الباء والميم'],
    examples: [
      { text: 'أَنعَمْتَ عَلَيْهِمْ', surahAyah: 'الفاتحة: 7' },
      { text: 'هُمْ فِيهَا', surahAyah: 'البقرة: 25' }
    ]
  },

  // القلقلة
  {
    id: 'qalqalah',
    nameAr: 'القلقلة (قطب جد)',
    category: 'qalqalah',
    color: '#e11d48', // Rose / Red
    bgColor: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
    borderColor: 'border-rose-500',
    description: 'اضطراب صوت الحرف عند النطق به ساكناً في مخرجه حتى يُسمع له نبرة قوية (قطب جد). مراتبها: كبرى، وسطى، صغرى.',
    letters: ['ق', 'ط', 'ب', 'ج', 'د'],
    examples: [
      { text: 'قُلْ هُوَ اللَّهُ أَحَدٌ', surahAyah: 'الإخلاص: 1' },
      { text: 'الْفَلَقِ', surahAyah: 'الفلق: 1' },
      { text: 'يَجْعَلُونَ', surahAyah: 'البقرة: 19' }
    ]
  },

  // أحكام المدود
  {
    id: 'madd_tabiee',
    nameAr: 'المد الطبيعي (الأصلي)',
    category: 'madd',
    color: '#ca8a04', // Amber/Yellow
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-300',
    borderColor: 'border-yellow-500',
    description: 'المد الذي لا تقوم ذات حرف المد إلا به، ولا يتوقف على سبب من همز أو سكون، ويمد بمقدار حركتين.',
    letters: ['ا', 'و', 'ي'],
    examples: [
      { text: 'قَالَ', surahAyah: 'البقرة: 30' },
      { text: 'يَقُولُ', surahAyah: 'البقرة: 8' },
      { text: 'قِيلَ', surahAyah: 'البقرة: 11' }
    ]
  },
  {
    id: 'madd_muttasil',
    nameAr: 'المد الواجب المتصل',
    category: 'madd',
    color: '#b91c1c', // Deep Red
    bgColor: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300',
    borderColor: 'border-red-500',
    description: 'أن يأتي حرف المد وبعده همز متصل به في نفس الكلمة. يمد 4 أو 5 حركات وجوباً.',
    letters: ['ا', 'و', 'ي'],
    examples: [
      { text: 'السَّمَآءِ', surahAyah: 'البقرة: 19' },
      { text: 'جِيٓءَ', surahAyah: 'الفجر: 23' },
      { text: 'سُوٓءُ', surahAyah: 'الرعد: 18' }
    ]
  },
  {
    id: 'madd_munfasil',
    nameAr: 'المد الجائز المنفصل',
    category: 'madd',
    color: '#c2410c', // Orange Red
    bgColor: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-500',
    description: 'أن يأتي حرف المد في آخر الكلمة والهمزة في أول الكلمة التالية. يمد 4 أو 5 حركات جوازاً (أو حركتين من طريق الشاطبية/طيبة).',
    letters: ['ا', 'و', 'ي'],
    examples: [
      { text: 'إِنَّآ أَعْطَيْنَاكَ', surahAyah: 'الكوثر: 1' },
      { text: 'قُوٓا۟ أَنفُسَكُمْ', surahAyah: 'التحريم: 6' },
      { text: 'فِيٓ أَنفُسِكُمْ', surahAyah: 'الذاريات: 21' }
    ]
  },
  {
    id: 'madd_lazim',
    nameAr: 'المد اللازم',
    category: 'madd',
    color: '#831843', // Wine / Deep Pink
    bgColor: 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300',
    borderColor: 'border-pink-500',
    description: 'أن يأتي بعد حرف المد سكون أصلي ثابت وصلاً ووقفاً. يمد 6 حركات لزوماً (كلمي مثقل/مخفف أو حرفي مثقل/مخفف).',
    letters: ['ا', 'و', 'ي'],
    examples: [
      { text: 'الضَّآلِّينَ', surahAyah: 'الفاتحة: 7' },
      { text: 'الْحَآقَّةُ', surahAyah: 'الحاقة: 1' },
      { text: 'الٓمٓ', surahAyah: 'البقرة: 1' }
    ]
  }
]

export const TAJWEED_CATEGORIES: TajweedCategory[] = [
  {
    id: 'noon_sakinah',
    nameAr: 'أحكام النون الساكنة والتنوين',
    rules: TAJWEED_RULES.filter(r => r.category === 'noon_sakinah')
  },
  {
    id: 'meem_sakinah',
    nameAr: 'أحكام الميم الساكنة',
    rules: TAJWEED_RULES.filter(r => r.category === 'meem_sakinah')
  },
  {
    id: 'qalqalah',
    nameAr: 'أحكام القلقلة',
    rules: TAJWEED_RULES.filter(r => r.category === 'qalqalah')
  },
  {
    id: 'madd',
    nameAr: 'أحكام المدود',
    rules: TAJWEED_RULES.filter(r => r.category === 'madd')
  }
]

export function getTajweedRuleById(id: string): TajweedRule | undefined {
  return TAJWEED_RULES.find(r => r.id === id)
}
