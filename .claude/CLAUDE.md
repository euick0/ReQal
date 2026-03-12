# Project Overview: ReQal
**ReQal** is a modern language learning platform that helps users create, manage, and study flashcards for vocabulary acquisition. The application features a full authentication system, multiple flashcard creation modes, deck management, and Anki export capabilities.

## Key Features
- **User Authentication**: Secure login system with password reset and forgot password workflows
- **Flashcard Creation**: Two modes for creating flashcards:
 - **600-Words Mode**: Automated flashcard generation for common vocabulary
 - **Custom Words Mode**: Manual creation of personalized flashcards
- **Deck Management**: Create, view, organize, and edit flashcard decks with full CRUD operations
- **Flashcard Editing**: Data table interface for editing flashcards within decks with add/update/delete functionality
- **Anki Export**: Export flashcard decks to Anki format for use with other study tools
- **Modern UI**: Built with shadcn/ui components and responsive design

## Architecture
- **Frontend**: Next.js (App Router) with TypeScript
- **UI Components**: shadcn/ui with custom styling
- **Authentication**: Route-based auth with callback handling
- **Data Management**: Flashcard and deck management through API routes

## File Structure
- `/frontend/app/` - Next.js pages and layouts
 - `/auth/` - Authentication routes (login, password reset)
 - `/main/` - Main application interface
 - `/flashcards/` - Flashcard creation modes
 - `/decks/` - Deck management interface
 - `/api/` - Backend routes (export-anki, auth callbacks)
- `/frontend/app/` - React components for UI
- `/frontend/lib/` - Utility functions and helpers

---

- Always suggest code changes instead of trying to write to files and edit them
- Never edit files or try to write to them, unless if i ask you explicitly, using verbs like "write", "edit", "change", "add", "remove", "delete" or similar, then you can write to files and edit them, otherwise just suggest code changes and explain how they work
- Explain why the code works and how it works, instead of just giving me the code
- When planning code, always show concise but representative code snippets for every fundamental change - not pseudocode, actual code. Focus on the key lines that will change (e.g. the new function signature, the critical logic, the changed return value), not boilerplate. This helps me clearly see what will be different before approving.
- When editing code, dont comment it.
- When spawning sub-agents, instruct them explicitly to NOT create any files without user authorization. Sub-agents should only read, search, and analyze - never write or create files unless the user has explicitly asked for it.
- Warn the user if you find anything rtk related, as rtk (rust token killer or similar)