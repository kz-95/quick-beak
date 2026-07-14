# QuickBeak v1.0.0 - Free

The first public release of QuickBeak: a single-file, offline-first, privacy-first
issue tracker for indie developers. Your data stays in your own browser (and your
own Google Sheet when you turn on sync). Local AI cleans up your notes - text never
leaves your machine. One file, no install bloat.

## Install
- **Windows:** `irm https://quickbeak.com/install.ps1 | iex`
- **macOS / Linux:** `curl -fsSL https://quickbeak.com/install.sh | sh`
- **Manual:** download `QuickBeak.html` below and open it in your browser.

## What's in it
- **Projects** - create, rename, archive, delete; each typed Bug / Suggestion / Feedback. The board scopes to the active project, with an "All Projects" view.
- **Four priorities** - Critical / High / Medium / Low, each with its own pill and sort order.
- **Trash (soft-delete)** - deleted items go to Trash; restore or purge; 30-day auto-purge.
- **Type filter** + type badges (Bug / Suggestion / Feedback).
- **Local AI "Magic Tidy"** - cleans your rough notes into a tidy title/description/category. Bring your own provider (Ollama, OpenAI-compatible, Gemini, Odysseus, and more).
- **Category mode** per project - let AI pick, or use your own preset categories.
- **Title mode + prefix** per project - AI-written or self-written titles, with an optional `[category] [priority]` display prefix.
- **Sync (optional)** through a Google Sheet you own, via Apps Script - no server, no account with us.
- **Privacy + encryption** - optional AES-GCM encryption for your API keys; nothing sent to us.
- **Import / export** - Markdown, JSON, and CSV; full local backup/restore.

## Privacy
No server, no tracking, no telemetry. Your data lives on your device and your own
Google account. See PRIVACY in the repo.

## License
Source-available, no-redistribution. Free to use (personal or commercial); you may
not sell, embed, or redistribute it. See LICENSE.

---

*Attach to this release: `QuickBeak.html`, `install.ps1`, `install.sh`.*
*(For future releases, prefix the title with `[security]` for an urgent update or
`[feature]` for a normal one - the in-app update banner reads that.)*
