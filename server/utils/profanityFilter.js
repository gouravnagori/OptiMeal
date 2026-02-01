/**
 * Server-side Profanity Filter Utility
 * Backup validation for feedback content
 */

// Comprehensive list of profane words (English + Hindi transliterated)
const profanityList = [
    // English common bad words
    'fuck', 'fucker', 'fucking', 'fucked', 'fck', 'fuk', 'fuking', 'fukking',
    'shit', 'shitty', 'bullshit', 'shitting', 'sht',
    'ass', 'asshole', 'arse', 'arsehole', 'a$$', 'azz',
    'bitch', 'bitches', 'bitchy', 'btch',
    'bastard', 'bastards',
    'damn', 'dammit', 'goddamn',
    'crap', 'crappy',
    'dick', 'dickhead', 'dck',
    'pussy', 'pussies',
    'cock', 'cocksucker',
    'whore', 'whores',
    'slut', 'slutty', 'sluts',
    'idiot', 'idiots', 'idiotic',
    'stupid', 'stupidity',
    'dumb', 'dumbass', 'dumbfuck',
    'moron', 'moronic',
    'retard', 'retarded',
    'loser', 'losers',
    'suck', 'sucks', 'sucker',
    'cunt', 'cunts',
    'piss', 'pissed', 'pissing',
    'fag', 'faggot', 'fags',
    'nigger', 'nigga', 'negro',
    'hell', 'hellhole',
    'jackass', 'jerk', 'jerks',
    'douche', 'douchebag',
    'wanker', 'wank',
    'twat', 'tits', 'boobs',
    'screw', 'screwed',
    'bloody', 'bugger',
    'motherfucker', 'mf', 'mofo',
    'sob', 'sonofabitch',

    // Hindi abusive words (transliterated - comprehensive)
    'madarchod', 'madarchodh', 'madarchot', 'maderchod', 'mc',
    'behenchod', 'behanchod', 'bhenchod', 'bhainchod', 'banchod', 'bc', 'behen ke lode',
    'chutiya', 'chutiye', 'chutia', 'chutiyapa', 'chutiyap', 'chu',
    'gaand', 'gand', 'gandu', 'gandmari', 'gand mara', 'gaandu',
    'lund', 'lawda', 'lauda', 'laude', 'lavda', 'lavde', 'loda', 'lode',
    'bhosdike', 'bhosdi', 'bhosdiwale', 'bhosda', 'bsdk',
    'randi', 'raand', 'randwa', 'randi ka bachcha', 'randibaaz',
    'harami', 'haramkhor', 'haraamzada', 'haramzade', 'haraamzaade',
    'kutta', 'kutte', 'kutti', 'kutiya', 'kutia',
    'sala', 'saala', 'saale', 'sali', 'saali',
    'kamina', 'kamine', 'kameena', 'kameene', 'kamini',
    'ullu', 'ullu ka pattha', 'ullu ke pathe',
    'gadha', 'gadhe', 'gadhaa',
    'bakwas', 'bakwaas',
    'tatti', 'tatty', 'tatti khana',
    'chodu', 'chod', 'choodu', 'chodna', 'chudai', 'chudna',
    'bhadwa', 'bhadwe', 'bhadwi', 'bhadva',
    'hijra', 'hijda', 'chakka',
    'suwar', 'suar', 'suwar ka bachcha',
    'gashti', 'gashthi',
    'jhant', 'jhatu', 'jhaat',
    'chinal', 'chinaal',
    'dalla', 'dalal', 'dalle',
    'pataka', 'patakha',
    'bhikari', 'bhikhari',
    'nalayak', 'nikamma', 'nikamme',
    'bewakoof', 'bewkoof', 'bevkoof', 'bevakoof',
    'pagal', 'paagal', 'pagla',
    'chapri', 'chapris',
    'chor', 'chora',
    'badtameez', 'badtamiz',
    'kanjoos', 'kanjus',
    'ghatiya', 'ghatia',
    'pokht', 'pokhtey',
    'bhosad', 'bhosadpappu',
    'maaki', 'teri maa ki', 'teri maki',
    'baap', 'tere baap ka', 'tera baap',
    'maa', 'teri maa', 'maa ki',
    'bhen', 'behen', 'teri behen',
    'aand', 'andh', 'tatto',
    'muth', 'mutth', 'muthhal',
    'penchod', 'painchod',

    // Common variations, leetspeak and misspellings
    'f*ck', 'sh*t', 'a$$', 'b*tch', 'f**k', 's**t',
    'phuck', 'phuk', 'fvck',
    '@ss', '@$$hole',
    'b!tch', 'bi+ch',
    'd!ck', 'c0ck',
    'pr!ck', 'prick',
    'a55', 'a55hole',
    'wtf', 'stfu', 'gtfo'
];

// Create regex patterns
const profanityPatterns = profanityList.map(word => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i');
});

/**
 * Check if text contains any profanity
 * @param {string} text - The text to check
 * @returns {boolean} - True if profanity is found
 */
export const containsProfanity = (text) => {
    if (!text || typeof text !== 'string') return false;

    const lowerText = text.toLowerCase();
    return profanityPatterns.some(pattern => pattern.test(lowerText));
};

/**
 * Censor profane words in text
 * @param {string} text - The text to censor
 * @returns {string} - Censored text
 */
export const censorText = (text) => {
    if (!text || typeof text !== 'string') return text;

    let censored = text;
    profanityList.forEach(word => {
        const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        censored = censored.replace(pattern, '*'.repeat(word.length));
    });

    return censored;
};

export default { containsProfanity, censorText };
