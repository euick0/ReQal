/**
 * A set of all valid routes in the app that have a page.tsx file.
 * Dynamic segments (e.g. [deckId]) are represented with a "*" wildcard.
 *
 * To keep this in sync with the app router, add/remove entries here
 * whenever you add/remove a page.tsx file.
 *
 * Format: slash-separated path relative to the app root (no leading slash).
 */
export const VALID_ROUTES = new Set([
  '',                                            // app/page.tsx
  'main',                                        // app/main/page.tsx
  'main/flashcards',                             // app/main/flashcards/page.tsx
  'main/flashcards/600-words',                   // app/main/flashcards/600-words/page.tsx
  'main/flashcards/conjugation-charts',          // app/main/flashcards/conjugation-charts/page.tsx
  'main/flashcards/new-words',                   // app/main/flashcards/new-words/page.tsx
  'main/decks',                                  // app/main/decks/page.tsx
  'main/decks/my-decks',                         // app/main/decks/my-decks/page.tsx
  'main/decks/my-decks/*/edit-flashcards',       // app/main/decks/my-decks/[deckId]/edit-flashcards/page.tsx
  'auth/reset-password',                         // app/auth/reset-password/page.tsx
]);

/**
 * Returns true if the given pathname (e.g. "/main/flashcards/600-words") resolves
 * to a valid route with a page.tsx file.
 *
 * Dynamic segments (folders named [paramName]) match any single path segment.
 */
export function isValidRoute(pathname: string): boolean {
  const normalised = pathname.replace(/^\//, '');

  for (const route of VALID_ROUTES) {
    const routeSegments = route.split('/');
    const pathSegments = normalised.split('/');

    if (routeSegments.length !== pathSegments.length) continue;

    const matches = routeSegments.every(
      (seg, i) => seg === '*' || seg === pathSegments[i]
    );

    if (matches) return true;
  }

  return false;
}
