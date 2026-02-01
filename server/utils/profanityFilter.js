/**
 * Server-side Profanity Filter Utility
 * Backup validation for feedback content
 */

// List of common profane words (English + Hindi transliterated)
const profanityList = [
    // English common bad words
    'fuck', 'shit', 'ass', 'asshole', 'bitch', 'bastard', 'damn', 'crap',
    'dick', 'pussy', 'cock', 'whore', 'slut', 'idiot', 'stupid', 'dumb',
    'moron', 'retard', 'loser', 'suck', 'bullshit', 'cunt', 'piss',
    'fag', 'faggot', 'nigger', 'nigga', 'hell', 'jackass', 'douche',

    // Hindi common abusive words (transliterated)
    'madarchod', 'behenchod', 'chutiya', 'chutiye', 'bhenchod', 'bc', 'mc',
    'gaand', 'gandu', 'lund', 'lauda', 'laude', 'bhosdike', 'bhosdi',
    'randi', 'harami', 'haramkhor', 'kutta', 'kutti', 'sala', 'saala',
    'sali', 'saali', 'kamina', 'kamine', 'ullu', 'gadha', 'bakwas',
    'tatti', 'chodu', 'choodu', 'bhadwa', 'bhadwe', 'hijra', 'chakka',

    // Common variations
    'f*ck', 'sh*t', 'a$$', 'b*tch', 'f**k', 's**t',
    'fuk', 'fck', 'sht', 'btch', 'azz'
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
