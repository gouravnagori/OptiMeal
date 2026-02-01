/**
 * Profanity Filter Utility
 * Checks text for inappropriate/abusive words and blocks submission
 */

// List of common profane words (English + Hindi transliterated)
// This list can be extended as needed
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

    // Common variations and leetspeak
    'f*ck', 'sh*t', 'a$$', 'b*tch', 'f**k', 's**t',
    'fuk', 'fck', 'sht', 'btch', 'azz'
];

// Create regex patterns for each word (case insensitive, word boundaries)
const profanityPatterns = profanityList.map(word => {
    // Escape special regex characters
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

    // Check against each pattern
    return profanityPatterns.some(pattern => pattern.test(lowerText));
};

/**
 * Get list of found profane words in text (for logging/debugging)
 * @param {string} text - The text to check
 * @returns {string[]} - Array of found profane words
 */
export const findProfanity = (text) => {
    if (!text || typeof text !== 'string') return [];

    const found = [];
    const lowerText = text.toLowerCase();

    profanityList.forEach(word => {
        const pattern = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (pattern.test(lowerText)) {
            found.push(word);
        }
    });

    return found;
};

/**
 * Censor profane words in text (replace with asterisks)
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

export default { containsProfanity, findProfanity, censorText };
