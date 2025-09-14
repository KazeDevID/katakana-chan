// Complete Katakana character data with stroke orders and categories
const KATAKANA_DATA = [
    // Basic vowels (a, i, u, e, o)
    { katakana: 'ア', romanji: 'a', category: 'basic', strokes: [[70,30,70,150],[70,30,130,30],[70,80,120,80]] },
    { katakana: 'イ', romanji: 'i', category: 'basic', strokes: [[50,30,50,150],[90,30,90,150],[50,80,90,80]] },
    { katakana: 'ウ', romanji: 'u', category: 'basic', strokes: [[50,30,120,30],[70,30,70,80],[70,80,110,120],[50,120,120,120]] },
    { katakana: 'エ', romanji: 'e', category: 'basic', strokes: [[50,30,120,30],[50,80,120,80],[50,120,120,120]] },
    { katakana: 'オ', romanji: 'o', category: 'basic', strokes: [[50,30,120,30],[50,30,50,120],[70,80,120,80],[120,80,120,120]] },
    
    // K sounds (ka, ki, ku, ke, ko)
    { katakana: 'カ', romanji: 'ka', category: 'k-sounds', strokes: [[50,30,120,30],[50,30,50,120],[70,80,120,80]] },
    { katakana: 'キ', romanji: 'ki', category: 'k-sounds', strokes: [[50,30,50,150],[70,50,100,30],[70,100,100,150]] },
    { katakana: 'ク', romanji: 'ku', category: 'k-sounds', strokes: [[50,30,120,80],[90,60,90,150]] },
    { katakana: 'ケ', romanji: 'ke', category: 'k-sounds', strokes: [[50,30,120,30],[50,80,120,80],[70,120,120,150]] },
    { katakana: 'コ', romanji: 'ko', category: 'k-sounds', strokes: [[50,30,120,30],[50,120,120,120]] },
    
    // S sounds (sa, shi, su, se, so)
    { katakana: 'サ', romanji: 'sa', category: 's-sounds', strokes: [[50,30,120,30],[70,30,70,120],[50,120,120,120]] },
    { katakana: 'シ', romanji: 'shi', category: 's-sounds', strokes: [[60,50,80,30],[80,80,100,60],[100,120,120,100]] },
    { katakana: 'ス', romanji: 'su', category: 's-sounds', strokes: [[50,30,120,50],[70,80,110,80],[90,80,90,150]] },
    { katakana: 'セ', romanji: 'se', category: 's-sounds', strokes: [[50,30,120,30],[70,80,110,80],[50,120,120,150]] },
    { katakana: 'ソ', romanji: 'so', category: 's-sounds', strokes: [[60,30,80,50],[90,80,110,100]] },
    
    // T sounds (ta, chi, tsu, te, to)
    { katakana: 'タ', romanji: 'ta', category: 't-sounds', strokes: [[50,30,120,30],[70,80,110,80],[90,80,90,150]] },
    { katakana: 'チ', romanji: 'chi', category: 't-sounds', strokes: [[50,30,120,50],[70,80,110,80],[90,80,90,150]] },
    { katakana: 'ツ', romanji: 'tsu', category: 't-sounds', strokes: [[60,30,80,50],[90,80,110,100],[50,120,120,120]] },
    { katakana: 'テ', romanji: 'te', category: 't-sounds', strokes: [[50,30,120,30],[70,80,110,80],[50,120,120,120]] },
    { katakana: 'ト', romanji: 'to', category: 't-sounds', strokes: [[50,30,120,50],[90,50,90,150]] },
    
    // N sounds (na, ni, nu, ne, no)
    { katakana: 'ナ', romanji: 'na', category: 'n-sounds', strokes: [[50,30,120,30],[70,30,70,120],[50,80,120,80]] },
    { katakana: 'ニ', romanji: 'ni', category: 'n-sounds', strokes: [[50,50,120,50],[50,120,120,120]] },
    { katakana: 'ヌ', romanji: 'nu', category: 'n-sounds', strokes: [[60,30,90,30],[60,30,60,80],[60,80,100,120],[70,120,120,150]] },
    { katakana: 'ネ', romanji: 'ne', category: 'n-sounds', strokes: [[50,30,120,30],[70,30,70,80],[70,80,110,120],[50,120,120,120]] },
    { katakana: 'ノ', romanji: 'no', category: 'n-sounds', strokes: [[60,30,120,150]] },
    
    // H sounds (ha, hi, fu, he, ho)
    { katakana: 'ハ', romanji: 'ha', category: 'h-sounds', strokes: [[50,30,50,150],[90,30,90,150],[70,80,70,150]] },
    { katakana: 'ヒ', romanji: 'hi', category: 'h-sounds', strokes: [[50,30,50,150],[90,30,90,150],[50,80,90,80]] },
    { katakana: 'フ', romanji: 'fu', category: 'h-sounds', strokes: [[50,30,120,30],[70,80,110,80]] },
    { katakana: 'ヘ', romanji: 'he', category: 'h-sounds', strokes: [[60,30,120,150]] },
    { katakana: 'ホ', romanji: 'ho', category: 'h-sounds', strokes: [[50,30,120,30],[50,30,50,120],[70,80,120,80],[120,30,120,120]] },
    
    // M sounds (ma, mi, mu, me, mo)
    { katakana: 'マ', romanji: 'ma', category: 'm-sounds', strokes: [[50,30,120,30],[70,30,70,120],[50,80,120,80]] },
    { katakana: 'ミ', romanji: 'mi', category: 'm-sounds', strokes: [[50,50,120,50],[60,80,100,80],[70,120,110,120]] },
    { katakana: 'ム', romanji: 'mu', category: 'm-sounds', strokes: [[50,30,120,80],[90,60,90,150]] },
    { katakana: 'メ', romanji: 'me', category: 'm-sounds', strokes: [[60,30,120,150],[120,30,60,150]] },
    { katakana: 'モ', romanji: 'mo', category: 'm-sounds', strokes: [[50,30,120,30],[70,80,110,80],[50,120,120,120],[90,80,90,120]] },
    
    // Y sounds (ya, yu, yo)
    { katakana: 'ヤ', romanji: 'ya', category: 'y-sounds', strokes: [[50,30,120,30],[70,30,70,80],[70,80,110,120],[50,120,110,120]] },
    { katakana: 'ユ', romanji: 'yu', category: 'y-sounds', strokes: [[50,30,100,50],[70,80,110,80],[50,120,120,120]] },
    { katakana: 'ヨ', romanji: 'yo', category: 'y-sounds', strokes: [[50,30,120,30],[70,80,110,80],[50,120,120,120],[90,80,90,120]] },
    
    // R sounds (ra, ri, ru, re, ro)
    { katakana: 'ラ', romanji: 'ra', category: 'r-sounds', strokes: [[50,30,120,30],[70,30,70,120],[70,80,120,80]] },
    { katakana: 'リ', romanji: 'ri', category: 'r-sounds', strokes: [[50,30,50,150],[90,30,90,150]] },
    { katakana: 'ル', romanji: 'ru', category: 'r-sounds', strokes: [[50,30,100,30],[60,30,60,80],[60,80,100,120],[70,120,120,150]] },
    { katakana: 'レ', romanji: 're', category: 'r-sounds', strokes: [[50,30,120,150]] },
    { katakana: 'ロ', romanji: 'ro', category: 'r-sounds', strokes: [[50,30,120,30],[50,30,50,120],[120,30,120,120],[50,120,120,120]] },
    
    // W sounds (wa, wo) and N
    { katakana: 'ワ', romanji: 'wa', category: 'w-sounds', strokes: [[50,30,120,30],[70,30,70,80],[70,80,110,120],[50,120,110,120]] },
    { katakana: 'ヲ', romanji: 'wo', category: 'w-sounds', strokes: [[50,30,120,30],[70,30,70,120],[50,80,120,80],[90,80,90,120]] },
    { katakana: 'ン', romanji: 'n', category: 'n-sound', strokes: [[50,30,50,120],[90,30,50,150]] }
];

// Name conversion data for quiz
const NAME_CONVERSIONS = [
    { english: 'Michael', katakana: 'マイケル', romanji: 'maikeru' },
    { english: 'Izzul', katakana: 'イズル', romanji: 'izuru' },
    { english: 'Hizkia', katakana: 'ヒズキア', romanji: 'hizukia' },
    { english: 'Fadel', katakana: 'ファデル', romanji: 'faderu' },
    { english: 'Sarah', katakana: 'サラ', romanji: 'sara' },
    { english: 'David', katakana: 'デイビッド', romanji: 'deibiddo' },
    { english: 'Maria', katakana: 'マリア', romanji: 'maria' },
    { english: 'John', katakana: 'ジョン', romanji: 'jon' },
    { english: 'Anna', katakana: 'アンナ', romanji: 'anna' },
    { english: 'Robert', katakana: 'ロバート', romanji: 'robaato' },
    { english: 'Lisa', katakana: 'リサ', romanji: 'risa' },
    { english: 'Tom', katakana: 'トム', romanji: 'tomu' },
    { english: 'Emily', katakana: 'エミリー', romanji: 'emirii' },
    { english: 'Daniel', katakana: 'ダニエル', romanji: 'danieru' },
    { english: 'Jessica', katakana: 'ジェシカ', romanji: 'jeshika' }
];

// Common katakana words for fill-in-the-blank quiz
const KATAKANA_WORDS = [
    { word: 'コンピューター', romanji: 'konpyuutaa', meaning: 'computer', blanks: [2, 5] }, // コン_ピュー_ー
    { word: 'テレビ', romanji: 'terebi', meaning: 'television', blanks: [1] }, // テ_ビ
    { word: 'カメラ', romanji: 'kamera', meaning: 'camera', blanks: [0] }, // _メラ
    { word: 'ホテル', romanji: 'hoteru', meaning: 'hotel', blanks: [2] }, // ホテ_
    { word: 'レストラン', romanji: 'resutoran', meaning: 'restaurant', blanks: [1, 4] }, // レ_トラ_
    { word: 'タクシー', romanji: 'takushii', meaning: 'taxi', blanks: [3] }, // タクシ_
    { word: 'バス', romanji: 'basu', meaning: 'bus', blanks: [0] }, // _ス
    { word: 'メニュー', romanji: 'menyuu', meaning: 'menu', blanks: [2] }, // メニュ_
    { word: 'サラダ', romanji: 'sarada', meaning: 'salad', blanks: [1] }, // サ_ダ
    { word: 'コーヒー', romanji: 'koohii', meaning: 'coffee', blanks: [3] }, // コーヒ_
];

// Category definitions
const CATEGORIES = {
    'basic': { name: 'Basic Vowels', description: 'あ、い、う、え、お sounds' },
    'k-sounds': { name: 'K Sounds', description: 'か、き、く、け、こ sounds' },
    's-sounds': { name: 'S Sounds', description: 'さ、し、す、せ、そ sounds' },
    't-sounds': { name: 'T Sounds', description: 'た、ち、つ、て、と sounds' },
    'n-sounds': { name: 'N Sounds', description: 'な、に、ぬ、ね、の sounds' },
    'h-sounds': { name: 'H Sounds', description: 'は、ひ、ふ、へ、ほ sounds' },
    'm-sounds': { name: 'M Sounds', description: 'ま、み、む、め、も sounds' },
    'y-sounds': { name: 'Y Sounds', description: 'や、ゆ、よ sounds' },
    'r-sounds': { name: 'R Sounds', description: 'ら、り、る、れ、ろ sounds' },
    'w-sounds': { name: 'W Sounds', description: 'わ、を sounds' },
    'n-sound': { name: 'N Sound', description: 'ん sound' }
};

// Difficulty levels for progressive quiz
const DIFFICULTY_LEVELS = [
    {
        level: 1,
        name: 'Beginner',
        categories: ['basic'],
        questionCount: 5
    },
    {
        level: 2,
        name: 'Elementary',
        categories: ['basic', 'k-sounds', 's-sounds'],
        questionCount: 8
    },
    {
        level: 3,
        name: 'Intermediate',
        categories: ['basic', 'k-sounds', 's-sounds', 't-sounds', 'n-sounds'],
        questionCount: 10
    },
    {
        level: 4,
        name: 'Advanced',
        categories: ['k-sounds', 's-sounds', 't-sounds', 'n-sounds', 'h-sounds', 'm-sounds'],
        questionCount: 12
    },
    {
        level: 5,
        name: 'Expert',
        categories: Object.keys(CATEGORIES),
        questionCount: 15
    }
];

// Export data for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { KATAKANA_DATA, NAME_CONVERSIONS, KATAKANA_WORDS, CATEGORIES, DIFFICULTY_LEVELS };
}