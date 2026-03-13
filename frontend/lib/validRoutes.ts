const validSegments: string[] = [
    'main',
    'decks',
    'my-decks',
    'edit-flashcards',
    'flashcards',
    '600-words',
    'conjugation-charts',
    'new-words',
    'auth',
    'reset-password',
];

export const isValidRoute = (path: string): boolean => {
    const segments = path
        .split('/')
        .filter(Boolean)
        .filter(seg => !(seg.startsWith('[') && seg.endsWith(']')));

    return segments.length > 0 && segments.every(seg => validSegments.includes(seg));
};
