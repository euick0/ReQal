# ReQal — Project Reference for AI Assistants

ReQal is a language learning platform where users create, manage, and study vocabulary flashcards. It supports multiple flashcard creation modes, deck organization, spaced repetition review, and Anki export.

---

## BEHAVIORAL RULES (Read First)

- **Default: suggest only.** Do not edit or create files unless the user explicitly uses words like "write", "edit", "change", "add", "remove", "delete", or equivalent imperatives.
- **Explain reasoning.** Always explain why a change works, not just what it does.
- **Show real code snippets.** When planning changes, show actual code for every key change — function signatures, critical logic, return values. No pseudocode.
- **No comments in edits.** When editing code, do not add inline comments.
- **Sub-agents: read-only.** When spawning sub-agents, explicitly instruct them NOT to create or edit files. Sub-agents may only read, search, and analyze.
- **RTK Warning.** If you encounter anything referencing "rtk" (Rust Token Killer or similar), immediately warn the user before proceeding.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript 5 |
| Styling | Tailwind CSS v4, shadcn/ui (new-york), DaisyUI |
| Animation | Motion v12 |
| Icons | Lucide React |
| Backend/DB | Supabase (PostgreSQL + Storage + Auth) |
| Auth | Supabase Auth — email/password + Google OAuth |
| AI | Google Gemini (`gemma-4-26b-a4b-it`) via `@google/genai` |
| Audio | Wiktionary / Wikimedia Commons CDN |
| Images | Bing Image Search (HTML scraping) |
| Anki Export | `better-sqlite3` + `jszip` |
| Toasts | Sonner |
| Tables | TanStack Table (via shadcn data-table pattern) |
| Charts | Recharts |

---

## File Structure

```
pap/
└── frontend/
    ├── app/                          # Next.js App Router
    │   ├── layout.tsx                # Root layout (fonts, providers)
    │   ├── page.tsx                  # Landing/home page
    │   ├── globals.css               # Global styles + Tailwind + CSS vars
    │   ├── loginModal.tsx            # Login form (email/password + Google)
    │   ├── registerModal.tsx         # Registration form
    │   ├── forgotPasswordModal.tsx   # Password reset request
    │   │
    │   ├── auth/
    │   │   ├── callback/route.ts     # OAuth + recovery redirect handler
    │   │   ├── forgot-password/      # Password reset email trigger
    │   │   └── reset-password/       # New password entry page
    │   │
    │   ├── main/                     # Protected app area
    │   │   ├── layout.tsx            # Auth guard — redirects if no session
    │   │   ├── content.tsx           # Home dashboard content
    │   │   ├── sidebar.tsx           # Collapsible nav sidebar
    │   │   ├── breadcrumbs.tsx       # Dynamic route breadcrumbs
    │   │   ├── sidebarHeader.tsx
    │   │   ├── sidebarFooter.tsx
    │   │   ├── sidebarGroup.tsx
    │   │   ├── sidebarItem.tsx
    │   │   │
    │   │   ├── flashcards/
    │   │   │   ├── page.tsx          # Mode selection page
    │   │   │   ├── 600-words/        # Common vocabulary creation flow
    │   │   │   │   ├── flashcardCreation.tsx
    │   │   │   │   ├── flashcardParameters.tsx
    │   │   │   │   ├── flashcardPreviews.tsx
    │   │   │   │   ├── imageToggle.tsx
    │   │   │   │   ├── imageParameter.tsx
    │   │   │   │   └── progressDialog.tsx
    │   │   │   ├── new-words/        # Custom word creation flow
    │   │   │   └── conjugation-charts/  # Verb conjugation mode
    │   │   │
    │   │   └── decks/
    │   │       ├── my-decks/
    │   │       │   ├── decksList.tsx
    │   │       │   └── [deckId]/
    │   │       │       └── edit-flashcards/
    │   │       │           ├── page.tsx
    │   │       │           ├── flashcardDataTable.tsx   # Sortable/filterable table
    │   │       │           ├── flashcardEditSheet.tsx   # Side panel editor
    │   │       │           └── flashcardList.tsx
    │   │       └── review-flashcards/
    │   │           └── flashcardReview.tsx              # Spaced repetition UI
    │   │
    │   └── api/
    │       └── export-anki/route.ts  # GET ?deckId= → returns .apkg file
    │
    ├── components/
    │   ├── header.tsx                # Fixed top nav, manages auth modal state
    │   ├── logo.tsx
    │   ├── customButton.tsx
    │   ├── emailConfirmationDialog.tsx
    │   └── ui/                       # shadcn/ui components (30+)
    │       ├── button.tsx, input.tsx, dialog.tsx, card.tsx
    │       ├── table.tsx, sheet.tsx, scroll-area.tsx
    │       ├── audio-player.tsx, carousel.tsx, chart.tsx
    │       └── ... (standard shadcn components)
    │
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts             # Browser Supabase client
    │   │   └── server.ts             # Server Supabase client (SSR + cookies)
    │   ├── backendUtils.ts           # All DB queries (~850 lines, server actions)
    │   ├── geminiQueries.ts          # Gemini AI translation calls
    │   ├── getAudio.ts               # Wiktionary audio fetch (70+ languages)
    │   ├── getSearchImages.ts        # Bing image scraper
    │   ├── uploadToStorage.ts        # Supabase Storage upload
    │   ├── pathways.ts               # Learning pathway config (1, 2, 3)
    │   ├── login.ts                  # Server action: sign in
    │   ├── register.ts               # Server action: sign up
    │   ├── googleAuth.ts             # Google OAuth trigger
    │   ├── clipboardUtils.ts
    │   ├── utils.ts                  # clsx utility (cn)
    │   └── validRoutes.ts
    │
    ├── public/
    │   ├── images/, svgs/, fonts/
    │   ├── audio/, videos/
    │   └── summernote/               # Rich text editor assets
    │
    ├── .env.local                    # Environment variables
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── postcss.config.mjs
    ├── eslint.config.mjs
    └── components.json               # shadcn/ui config
```

---

## Database Schema (Supabase/PostgreSQL)

All tables enforce Row-Level Security (RLS) — users only access their own data.

### `deck`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | "600 Words", "Custom Words", "Conjugation" |
| `user_id` | uuid FK | auth.users |
| `prefered_language` | text nullable | |
| `prefered_path` | integer nullable | 1, 2, or 3 |

### `flashcards`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `deck_id` | uuid FK | |
| `translated_word` | text | |
| `IPA_translation` | text nullable | |
| `gender` | text nullable | "M", "F", "N" |
| `image_paths` | text[] nullable | Supabase Storage URLs |
| `audio_path` | text nullable | |
| `translation_caption` | text nullable | |
| `image_caption` | text nullable | |
| `pathway` | integer | 1, 2, or 3 |
| `review_date` | date nullable | Spaced repetition due date |
| `ease` | integer nullable | Spaced repetition ease factor |
| `created_at` | timestamp | |

### `conjugation_flashcards`
Same as `flashcards` plus:
| Column | Type | Notes |
|---|---|---|
| `phrase` | text | Sentence with `_` as placeholder for missing word |
| `missing_word` | text | The word the user must fill in |

### `words_progress`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `word_index` | integer | Progress cursor for 600-words mode |

### `languages`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `languages` | text[] | Available target languages |

---

## Key Library Functions

### `lib/backendUtils.ts` — Server Actions (DB layer)

**Decks:**
- `InsertWordFlashcardsDeck()` / `InsertCustomFlashcardsDeck()` / `InsertConjugationFlashcardsDeck()`
- `GetDeckList()`, `GetDeckById(deckId)`, `DeleteDeck(deckName)`
- `GetDeckPreferences(deckName)`, `UpdateDeckPreference(deckName, field, value)`

**Flashcards (regular):**
- `InsertWordsFlashcard(formData)`, `InsertCustomFlashcard(formData)`
- `GetDeckFlashcards(deckId)`, `GetFlashcardsByDeckId(deckId)`
- `GetFlashcardsFiltered(deckId, search, sortBy, sortOrder, page)`
- `UpdateFlashcard(flashcardId, payload)`, `DeleteFlashcard(flashcardId)`, `DeleteFlashcardsBulk(ids[])`
- `GetLastFlashcard(deckId)`

**Flashcards (conjugation):**
- `InsertConjugationFlashcard(formData)`
- `GetConjugationFlashcards(deckId)`, `GetConjugationFlashcardsFiltered(...)`
- `UpdateConjugationFlashcard(flashcardId, payload)`
- `DeleteConjugationFlashcard(flashcardId)`, `DeleteConjugationFlashcardsBulk(ids[])`

**Review:**
- `GetDueFlashcards()`, `GetDueConjugationFlashcards()`
- `UpdateFlashcardReview(flashcardId, table, newReviewDate, newEase)`

**Progress (600-words):**
- `GetCurrentWordIndex()`, `IncrementCurrentWordIndex()`, `CreateCurrentWordRow()`

**Other:**
- `GetLanguages()`

### `lib/geminiQueries.ts`
- `GeminiSendTranslationQuery(word, targetLanguage)` → `{ translation, gender, IPA }`
- `GeminiSendPhraseTranslationQuery(word, phrase, targetLanguage)` → translation preserving `_` placeholder
- Model: `gemma-4-26b-a4b-it` (MoE, low-latency). Runs with `temperature: 0` and `thinkingLevel: "MINIMAL"` for fast, deterministic JSON. Returns strict JSON; sanitizes on parse failure. Retries with exponential backoff on transient API failures.

### `lib/getAudio.ts`
- `GetWiktionaryAudio(word, language)` → public CDN URL or null
- 70+ language-to-Wiktionary-code mappings
- Cached 86400s via Next.js `fetch` revalidation

### `lib/getSearchImages.ts`
- `GetSearchImages(query)` → string[] of image URLs (up to 40)
- Scrapes Bing image search HTML

### `lib/uploadToStorage.ts`
- `uploadFile(file, bucket)` → public URL
- Buckets: `flashcard-images`, `flashcard-audio`
- Path format: `{user_id}/{uuid}.{ext}`

### `lib/pathways.ts`
- **Pathway 1**: Image → Word (1 card type)
- **Pathway 2**: + Word → Image (2 card types)
- **Pathway 3**: + Spelling challenge (3 card types)

---

## Authentication Flow

### Email/Password
1. User fills login modal → `lib/login.ts` server action
2. Calls `supabase.auth.signInWithPassword()` → redirects to `/main`
3. Registration via `lib/register.ts` → `supabase.auth.signUp()` → confirmation email

### Password Reset
1. `forgotPasswordModal` → API sends reset link
2. User clicks link → `/auth/callback?type=recovery&code=...`
3. Callback route detects `recovery` type → redirects to `/auth/reset-password`
4. User enters new password

### Google OAuth
- `lib/googleAuth.ts` → `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Google redirects to `/auth/callback` → session established via SSR

### Route Protection
- `app/main/layout.tsx` calls `supabase.auth.getUser()` on every render
- Unauthenticated → redirect to `/`
- DB-level protection via RLS policies

---

## API Route: Anki Export

**`GET /api/export-anki?deckId=<uuid>`** (file: `app/api/export-anki/route.ts`, ~710 lines)

Creates a valid `.apkg` (Anki 2.1) file:
1. Fetches deck + all flashcards from Supabase
2. Creates in-memory SQLite (`collection.anki2`) with tables: `col`, `notes`, `cards`, `revlog`, `graves`
3. Defines two note models:
   - **Regular**: fields = Word, IPA, Gender, Audio, Image, ImageCaption, TranslationCaption, EnableCard2, EnableCard3
   - **Conjugation**: same + TranslatedPhrase field
4. Downloads all media files in parallel
5. Packages everything into a ZIP with numeric media filenames + manifest
6. Returns as `application/octet-stream` with `.apkg` extension

---

## Environment Variables

Located at `frontend/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_SITE_URL=
```

---

## Styling Conventions

- **Design tokens** defined as CSS variables in `globals.css`, consumed by Tailwind
- **Primary color**: `#CC2054` (pink/red)
- **Contrast color**: `#2FA4A9` (teal)
- **Background**: `#0E0F14` (dark), **Surface**: `#1F2230`
- **Pattern**: use `clsx` (via `cn()` in `lib/utils.ts`) for conditional classes
- **Component variants**: CVA (Class Variance Authority) for multi-variant components
- **shadcn/ui style**: `new-york` preset with CSS variable theming

---

## Conventions & Patterns

- All DB queries are **server actions** in `lib/backendUtils.ts` — never call Supabase directly from client components
- Supabase client split: `lib/supabase/client.ts` (browser) vs `lib/supabase/server.ts` (server actions / route handlers)
- Flashcard types are fully separate: `flashcards` table vs `conjugation_flashcards` table — functions are duplicated per type
- Image domains: `next.config.ts` allows all HTTPS/HTTP hostnames to support Wiktionary, Bing, and Supabase Storage URLs
- Deck names are used as logical identifiers alongside UUIDs in some queries
