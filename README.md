# QuickBeak

> A road of proof of concept — drop your bugs, suggestions, and feedback as you build.

A single-file, offline-first issue tracker for indie developers and makers.
Open `QuickBeak.html` directly from your file system (`file://`) on Android,
desktop, anywhere — no server, no install, no build step. All data lives in
your browser's `localStorage`.

**The pitch:** a *private, local-AI* issue tracker that syncs through the
*cheapest thing every indie already has* — a Google account. Your messy bug
notes and half-baked ideas get cleaned up by an AI running on your own
machine (Ollama, Odysseus, or any local model) and never leave it. Team
collaboration rides on a plain Google Sheet, not paid per-seat SaaS.

**Three tiers** (see "Pricing" below): **Free** (open HTML, core tracking,
local Magic Tidy — the adoption hook), **Pro** ($1 once, the polished
desktop `.exe` with the full Magic Tidy suite, themes, projects, undo), and
**Team** ($1 per seat, once — Google Sheet collaboration, identity, public
intake).

---

## Origin

QuickBeak started life as **QuickBeak**, a single-file bug tracker. It has
been renamed, expanded, and is being commercialised as QuickBeak Pro — a
lightweight issue tracker covering bugs, suggestions, and user feedback in
one place.

---

## Core concept — Projects

QuickBeak organises work into **Projects**. Each project has one or more
**types**, chosen by checkbox at creation (pick one, two, or all three):

- **Bug** — defects, crashes, things that are broken
- **Suggestion** — feature ideas, improvements, "wouldn't it be nice"
- **Feedback** — user reactions, comments, sentiment

The type drives the whole experience. Most importantly, **Magic Tidy adapts its
AI instructions to the item's type** - a Bug is tidied by a bug-report tidier, a
Suggestion by a product-suggestion tidier, and Feedback by a user-feedback tidier
that keeps your sentiment instead of rewriting it into a defect.

---

## What it does

- Capture items with title, description, free-text category, **priority
  (Critical / High / Medium / Low)**, status, and up to 3 screenshots
  (auto-compressed).
- Filter by status (clickable stats bar) and category, search (matches
  title, description, and category separately), and sort — Latest updated,
  Priority, ID number, Latest created, Status, or Alphabet — each with a
  one-tap reverse toggle. Drag the grip handle on a card to set a manual
  order.
- Tap a card's eye icon for a read-only preview; tap a screenshot to open
  it full-screen (pinch / drag to pan / double-tap to zoom, click-to-zoom
  on desktop).
- **Sync & Collaborate** — see the Sync section below.
- **Optional encryption** — encrypt stored API keys and sync tokens with a
  passphrase.

### Existing features to preserve (carry forward in the restructure)

These work in the current app and **must survive** the QuickBeak restructure —
listing them explicitly so none is dropped during the rebuild:

- **FAB** (floating add button) with its **collapse** toggle
- **Pull-to-refresh** (mobile sync gesture)
- **Toast notifications** (the app's feedback mechanism)
- **Dirty-dot push indicator** (shows unsynced local changes pending upload)
- **Lightbox**: pinch-zoom, drag-to-pan, double-tap zoom, **swipe between
  screenshots**, click-to-zoom on desktop
- **Drag-grip manual reorder** of cards
- **Clickable stats bar** filter + category filter + multi-field search
- **Sort** (Latest updated / Priority / ID / Latest created / Status / Alphabet)
  each with **one-tap reverse**
- **Eye-icon read-only preview**
- **Stable seq IDs** (#numbers, never reused)
- **Optional AES-GCM encryption** (PBKDF2 passphrase) for keys/tokens
- **Auto-compressed JPEG** screenshots
- **`.json` backup** + restore (REPLACE-warning), **`.md` export**
- All **20 SECURITY-AUDIT fixes** + prompt-injection guard

---

## QuickBeak Pro — feature set

Everything in the free version, plus:

### 1. Five Magic Tidy actions (project-type aware)

All five send context based on the project type (Bug / Suggestion /
Feedback) so the AI responds appropriately.

**Provider presets.** QuickBeak ships one-tap provider presets in **every tier
(Free included)** for OpenAI-compatible, Gemini, and local Ollama endpoints -
plus **Odysseus** (PewDiePie's self-hosted AI workspace). The Pro differentiator
in this section is the five Magic Tidy actions above, not the presets. A few
verified facts shape how the Odysseus preset works:

- Odysseus is an OpenAI-compatible *client*, not a standard OpenAI *server*.
  It does **not** expose `/v1/chat/completions`. Its own chat surface is
  `POST /api/chat` (streaming), secured by a `Bearer ody_…` API token with a
  `chat` scope. So the Odysseus preset needs a small base-URL/path adapter
  plus the `ody_` token — not a drop-in OpenAI key swap.
- This lets a user's local Odysseus models power QuickBeak's Magic Tidy, which
  keeps bug text private and on-machine — a good fit for the privacy pitch.

| Button | What it does |
|---|---|
| **Magic Tidy** | Cleans up and rewrites the title + description for clarity |
| **Auto Title** | Generates a concise title from the description |
| **Auto Description** | Expands a fuller description from just the title |
| **Auto Priority** | Reads the description and assigns Critical / High / Medium / Low |
| **Magic Image Suggestion** | Looks at the attached screenshot and suggests what the issue likely is |

### 2. Four priority tiers

Critical / High / Medium / Low — replaces the old three-tier model. Auto
Priority and all priority pills, filters, and sorting use the four tiers.

### 3. Themes & color palette

- **Day / Night toggle** — light and dark mode
- **Adjustable color palette** — preset palettes plus custom accent color
  selection, applied live across the whole app

**Canonical design tokens (the real baseline, from the existing app):**
- Fonts: **Fraunces** (serif headings) + **Outfit** (sans body/UI)
- Light theme: paper `#eef4ec`, card `#ffffff`, ink `#1c2620`, ink-soft
  `#5d6b60`, accent `#2f8f57`, accent-soft `#dcefe1`, line `#d8e4d8`
- Priority (bright ramp, shipped 1.0.1 - critical must read hotter than high):
  Critical `#ff0000`, High `#ff7a45`, Medium `#f2d24a`, Low `#75927c`
- Status (each one distinct): open `#ef5a2a` (reddish orange),
  in-progress `#eab308` (yellow), done `#4a9d6a` (green)
- Radius `14px`, shadow `0 6px 20px rgba(30,60,40,0.12)`
- Dark theme: inverted (deep green-charcoal bg, brightened accent) — the
  evolution; keep the warm, organic feel. *(The app's own CSS in `QuickBeak.html`
  is the design source of truth; the old STITCH-BRIEF was archived 2026-06-29.)*

### 3b. Brand splash / intro (Free - shipped in v1.0.1)

- A branded intro that plays **on first launch** — a brand-selling moment that
  makes QuickBeak feel like a real product.
- **Skippable instantly** (click / Skip — never traps anyone).
- **Shows once**, then auto-off for subsequent launches — a first impression,
  not a recurring toll.
- **Settings toggle** to re-enable or disable. Default: shows once on first run.
- Polish item — built in the launch-quality pass, not a Phase-0 blocker, but
  the *toggle + once-then-off behavior* is part of the v1.0.0 spec.

### 4. Projects & labels

- Create multiple projects, each typed Bug / Suggestion / Feedback (or a
  mix)
- Items belong to a project; filter and view per project
- Link an item to one project, or to several

### 4b. Category mode (Free — set in Settings, per project)

Magic Tidy **always** assigns a category based on the item's context. A
per-project setting controls *which pool it chooses from*:

- **AI-decide (default)** — the AI categorizes freely, inventing categories as
  it sees fit. Zero setup; works on first run.
- **Preset** — the user maintains a **per-project list of categories** (each
  Google Sheet / project has its own, fitting its type — a Bug project's
  categories differ from a Feedback project's). Magic Tidy must pick **only
  from that list**.

Rules:
- The preset list has full **CRUD** — create / edit / delete categories anytime.
- Switching modes only affects **future** Magic Tidy runs — **existing items
  are never rewritten**. To re-categorize an old item, just run Magic Tidy on
  it again.
- Deleting a preset is **non-destructive** — old items keep their category text;
  it simply isn't in the current preset list anymore.
- Default is AI-decide so new users have no setup friction; preset is opt-in
  for those who want clean, consistent buckets.
- **In Free, ships in v1.0.0.**

### 5. Secure Google sync (OAuth)

Authenticated sync via Google sign-in — shipped **after Pro** and offered to
**Pro and Team only (never Free)**. It is **optional and recommended**, and it
retires the old shared-secret Apps Script model on the tiers that adopt it:

- **Google Sheets** — sign in with Google (OAuth), grant access, sync
  directly. No shared secret, no public endpoint, no manual Apps Script
  deployment. Access is gated by Google's own Sheet/Drive sharing (revoke =
  instant).
- **Single-user** OAuth sync (your own devices) lands first, post-Pro.
  **Multi-user** collaboration sync is the **Team** differentiator — see Team
  features below.
- **Free never gets OAuth.** Free stays local and keeps the existing
  shared-secret Apps Script sync in the interim (see "Free version — sync"
  below) — making cloud OAuth sync one of the first reasons to go Pro.
- **Optional license backup.** When a user links Google, their license
  key/token is backed up to a **separate, private file in their own Drive**
  (never our server, never mixed with the data Sheet) — so a lost local token
  can be restored on their devices (the 2-device limit still applies).

*(Notion and other targets are deferred — see "Deferred" below. Keeping one
sync engine keeps Pro easy to maintain.)*

**Drive folder choice.** When syncing screenshots to Google Drive, the user
chooses how projects are organised:

- **Shared folder** — all projects dump their images into one folder
- **Per-project folders** — each project gets its own folder

Some people prefer everything in one place; others want clean separation.
Both are supported.

### 6. Undo / restore (soft-delete)

Deleted items are not gone immediately — they move to a **Recently Deleted**
holding area with a `deletedAt` timestamp. Restore with one tap, or let them
auto-purge after 30 days. Covers the "oops I deleted that" case without a
heavy version-history system.

### 7. Identity, comments & ownership (Team)

Because team members each connect with their **own Google login**, that login
*is* their identity — no separate QuickBeak account system to build.

- **Comments** — threaded notes under each item: `{author, text, timestamp}`,
  synced through the Sheet like everything else.
- **Assignee / transfer** — an `assignee` field; "transfer" is just reassigning
  it.
- **Lightweight history** — logs the meaningful events only (created,
  assigned, status changed, reopened), not every keystroke. Avoids an
  unbounded audit firehose bloating the Sheet.

**Honest limit:** identity is self-reported from each person's Google session
and written to a shared Sheet, so it's *honest-team* identity, not
*tamper-proof* identity. A teammate with Sheet access could hand-edit a row.
Fine for a trusting indie team; it is Jira-*style*, not Jira-*grade*, and is
not marketed as a forensic audit log.

### 8. Custom multi-stage workflows (Team, 10+ seats)

Teams of 10+ seats can replace the fixed three stages with their own ordered
pipeline — define the stages that match how the team actually works.

- Example (3D art pipeline): concept → whitebox → blocking → rough texture →
  highpoly → lowpoly → collision/lightmap → bake → done.
- General: any pipeline-based team (game studios, content production,
  hardware) defines its own ordered stages. Same item shape, configurable
  stages.
- **Stats bar, filter, and sort adapt** to the custom stages automatically.
- **Admin/owner-editable only** — the workflow definition is shared, syncable
  data; restricting edits to owner/admin keeps schema-conflicts rare. Concurrent
  workflow edits resolve last-write-wins with a shadow copy, same as scalar
  fields.
- **Removing a stage** with items still in it: those items fall back to the
  previous stage (or a default) — never deleted.
- **Minimal by design** — ordered stage names only. No per-stage permissions,
  required fields, or transition automations unless real users ask (avoids the
  Jira-complexity tar pit).

Free, Pro, and Team under 10 seats keep the fixed three stages
(open / in progress / done).

### 9. Public intake links (Team)

Collect suggestions/feedback from strangers without building a backend —
works like a Google Form, writing into a Google Sheet the team owns.

- **Submit-only link** — a branded QuickBeak page that can *only append* a new
  submission. It cannot read, edit, or list existing items.
- **Separate intake Sheet (not just a tab).** Submissions go into a
  **dedicated Google Sheet, physically separate from the main team Sheet** —
  so the public submit path only ever touches the intake Sheet, never the
  internal one. If the intake Sheet leaked, you lose a list of suggestions, not
  internal data. Stronger isolation than a quarantine tab in the same file.
- **Intake Sheet creation — two modes:** **auto-generate** (QuickBeak creates a
  sibling Sheet beside the main one, e.g. `<MainSheet>_Intake`, zero setup) or
  **pick manually** (point at your own Sheet, your Drive, your naming). If a
  user manually points intake at the *same* Sheet as the main team Sheet,
  QuickBeak **warns/prevents it** — that would defeat the isolation.
- **Accept / reject flow.** The intake link is **tied to a destination
  project** when created. **Accept** copies the submission into the main team
  Sheet as a normal item (the intake row is marked "accepted" as an audit
  record); the item is **editable after acceptance** (intake stays a clean
  read-only record). **Reject** sends it to **Trash** (recoverable, sticky,
  like everything else). **Any teammate** with edit access can review.
- **Source tracking** — generate a different link per platform
  (`?p=abc&src=twitter`); each submission is stamped with where it came from.
- **Untrusted by construction** — submissions are stranger-authored, so intake
  text is treated as **untrusted even after acceptance**: the prompt-injection
  guard and output whitelist wrap intake-derived content when it's later fed to
  Magic Tidy, and `escapeHtml`/`isImageDataUrl`/`safeId` apply on render.
- **Safe endpoint** — append-only, carries no secret, so a leaked link is
  harmless (worst case: spam you don't accept). Bot defenses (honeypot,
  min-time-to-submit) included.

### 10. Image annotation (tiered)

Mark up screenshots — circle the broken button, add an arrow, redact a secret.
Built on the existing lightbox/image viewer. **The original screenshot is
always kept, at every tier — annotation is never destructive to the original.**
Annotations **flatten on save** (baked into a new image); no re-editable layers
(that complexity is deliberately out of scope).

- **Free** — **freehand draw only.** Basic scribble-on-screenshot.
- **Pro** — adds **crop, rectangle, arrow, text**, a few colors,
  **flip & rotate**, and **undo/redo while editing** (an in-session edit stack,
  cleared on save — not re-editing a saved annotation later).
- **Team** — adds **image versioning**, Google-Sheets-style: every saved
  version is kept and timestamped; you can **jump back/forward** through
  versions and restore any. Branching rule (pure Google-style): if you rewind
  to an older version and then edit, the forward versions are **overwritten and
  vanish** — a new linear path continues from that point.
  - *Honest caveat:* this overwrite is a deliberate **exception** to QuickBeak's
    "nothing is ever truly lost" rule. It's acceptable because the original
    screenshot is always preserved, so the irreplaceable thing is never at
    risk — only intermediate annotated versions can be discarded.

*(Redaction — a black-box/blur tool to hide secrets before an image syncs or
goes to public intake — is a strong privacy-aligned addition; see roadmap.)*

**Download.** Every image has a **download button** in the lightbox — save the
viewed screenshot to the device (sensible filename, e.g.
`quickbeak-item-12-shot-1.jpg`). Works in the browser (data URL) and via the
native save dialog in the Tauri build. **Free, all tiers** — it's the user's
data. Ships v1.0.0.

### Security model — the three access levels

| Role | How they get in | What they can touch |
|---|---|---|
| **Owner** | Their Google login, owns the Sheet | Everything |
| **Teammate** | Their Google login + owner shared the Sheet (Google's native sharing) | Real project, edit, review intake |
| **Public submitter** | Branded append-only link, no login | Append one row to `_intake` |

Team sharing uses **Google's own sharing** on the Sheet + Drive folder —
QuickBeak builds no permission system of its own. Revoke someone in Google's
share dialog and they instantly lose access in QuickBeak too. Constraint: team
collaboration requires a Google account (submitters don't).

---

## Business model — full feature matrix

Every feature discussed, by tier. (`—` = not available; `✓` = included.)

### Core tracking
| Feature | Free | Pro | Team |
|---|---|---|---|
| Format | Open HTML | Desktop `.exe` (Tauri) | Desktop `.exe` (Tauri) |
| Items: title, description, category | ✓ | ✓ | ✓ |
| Screenshots per item | 3 | 5 | Unlimited* |
| Search / filter / sort / drag-reorder | ✓ | ✓ | ✓ |
| Lightbox image viewer | ✓ | ✓ | ✓ |
| Stats bar (status filter) | ✓ | ✓ | ✓ |
| Projects — Bug / Suggestion / Feedback types | ✓ | ✓ | ✓ |
| Category mode (AI-decide / preset, per-project, CRUD) | ✓ | ✓ | ✓ |
| Four priority tiers (Critical/High/Med/Low) | ✓ | ✓ | ✓ |
| First-run sample project | ✓ | ✓ | ✓ |

### AI (Magic Tidy)
| Feature | Free | Pro | Team |
|---|---|---|---|
| Local LLM providers (Ollama / Odysseus / OpenAI-compat / Gemini) | ✓ | ✓ | ✓ |
| Core Magic Tidy (single action, project-aware) | ✓ | ✓ | ✓ |
| Auto Title | — | ✓ | ✓ |
| Auto Description | — | ✓ | ✓ |
| Auto Priority | — | ✓ | ✓ |
| Magic Image Suggestion (vision) | — | ✓ | ✓ |
| Batch Magic Tidy (all / selected) | — | ✓ | ✓ |

### Images & annotation
| Feature | Free | Pro | Team |
|---|---|---|---|
| Freehand draw | ✓ | ✓ | ✓ |
| Crop / rectangle / arrow / text / colors | — | ✓ | ✓ |
| Flip / rotate | — | ✓ | ✓ |
| In-editor undo/redo | — | ✓ | ✓ |
| Redaction (black-box/blur) *(optional)* | — | ✓ | ✓ |
| Image versioning (Google-Sheets-style) | — | — | ✓ |
| Original always kept (non-destructive) | ✓ | ✓ | ✓ |

### Appearance
| Feature | Free | Pro | Team |
|---|---|---|---|
| Day / night theme | — | ✓ | ✓ |
| Adjustable color palette | — | ✓ | ✓ |

### Data safety
| Feature | Free | Pro | Team |
|---|---|---|---|
| Undo / restore (soft-delete, 30-day Trash) | ✓ | ✓ | ✓ |
| Done-not-delete lifecycle | ✓ | ✓ | ✓ |
| Import / Export (JSON / CSV / MD) | ✓ | ✓ | ✓ |

### Sync & collaboration
| Feature | Free | Pro | Team |
|---|---|---|---|
| Cloud sync | Apps Script (interim, secret-gated) | OAuth single-user (post-Pro) | OAuth multi-user |
| Google OAuth sync | — (never on Free) | ✓ (post-Pro, optional) | ✓ |
| License backup to own Google Drive (via OAuth link) | — | ✓ (optional) | ✓ (optional) |
| Sync conflict resolution (picker + union + Trash) | ✓ | ✓ | ✓ |
| Drive folder mode (shared / per-project) | ✓ | ✓ | ✓ |
| Identity (Google login) | — | — | ✓ |
| Comments | — | — | ✓ |
| Assignee / transfer | — | — | ✓ |
| Lightweight ownership history | — | — | ✓ |
| Public intake links (separate Sheet, source-tracked) | — | — | ✓ |
| Custom multi-stage workflows | — | — | 10+ seats |

### Platform & updates
| Feature | Free | Pro | Team |
|---|---|---|---|
| Works on web (any browser / mobile) | ✓ | ✓ | ✓ |
| Native desktop app | — | ✓ | ✓ |
| Auto-update | — | ✓ | ✓ |
| Native Mac/iOS | *(after Team ships — see roadmap)* | | |

### Commercial
| | Free | Pro | Team |
|---|---|---|---|
| Price | Free | **$1 once** | **$1 / seat, once — min 5 seats** |
| Device limit | n/a | 2 devices | 2 devices/seat |
| Tip jar (optional donation) | ✓ | ✓ | ✓ |

### Team seat thresholds
- **Minimum 5 seats** ($5 one-time) to buy Team at all. Sold as 5 minimum,
  then +1 at a time. A 2–3 person group buys individual Pro licenses or steps
  up to the 5-seat floor.
- **5–9 seats** — full collaboration, **fixed three stages**.
- **10+ seats** — adds **custom multi-stage workflows**, unlocked
  **permanently** by a 10-seat purchase (not tied to maintaining 10 active).

The 5-seat floor also puts every Team sale past the worst of the $1 fee zone
(smallest Team sale = $5, nets ~$4.38).

*\*Unlimited images = unlimited **in the user's own Google Drive** (storage is
theirs, not ours). Requires sync on; offline, the local `localStorage` quota
applies until images sync. Pro's 5-image cap is a pricing lever, not a
technical limit.*

**Why this shape.** Local features cost nothing to run and leak anyway (the
HTML is readable), so they're cheap or free. Connected features (multi-user
sync, identity, intake) are both more valuable *and* the only part gateable
server-side. **Local AI is the adoption engine; convenience and teamwork are
what you charge for.**

**One-time, not subscription** — on-brand with "cheap, honest, no-subscription."
Per-seat backend cost is near-zero, so recurring revenue isn't needed.

### What you actually keep — full transparency (shown to buyers)

QuickBeak's stance is **radical transparency**: buyers and donors see exactly
where their money goes, in a **live breakdown at the moment of payment**. The
maker pays all processing fees and hides nothing.

**The setup:** charge in **USD** (one currency, worldwide), settle to **MYR**
(Malaysian account). That means a typical sale stacks three fee layers:

| Layer | Rate | When it applies |
|---|---|---|
| Stripe base | ~2.9% + $0.30 | Every transaction |
| International card | +1.5% | Buyer's card issued outside Malaysia (most worldwide buyers) |
| Currency conversion | +2% | USD collected → MYR payout (essentially every payout) |
| Bank receiving fee | *varies* | Your local bank, on payout — **estimate only, confirm with your bank** |

**Default (honest) case — foreign card, converted to MYR** (~6.4% + $0.30):

| Charged | Stripe fee | **Maker nets (USD)** | % lost |
|---|---|---|---|
| $1 | $0.36 | **$0.64** | 36% |
| $2 | $0.43 | **$1.57** | 21% |
| $3 | $0.49 | **$2.51** | 16% |
| $5 | $0.62 | **$4.38** | 12% |
| $10 | $0.94 | **$9.06** | 9% |

*(MYR payout ≈ net USD × live FX rate, then minus your bank's receiving fee.
FX floats; never show a fixed RM figure as if guaranteed.)*

**The honest takeaway:** at $1, ~36% is eaten — almost all of it the flat
$0.30, made worse by the conversion stack. This is *why* the dollar price is
a goodwill/adoption play, not income, and why **bundling matters**: the flat
fee is paid once per transaction, so larger single amounts (Team seat
bundles, a single larger tip) keep far more per dollar than many tiny ones.

### Live fee-breakdown calculator (build spec)

At every donate/purchase point, show a real-time breakdown as the user picks
an amount. Framing is "Where your money goes — I pay every fee, nothing
hidden," not "fees lost."

Formula the calculator runs (USD charge, MY settle):
```
variablePct = 0.029 + 0.015 (intl card) + 0.02 (USD→MYR conversion)   // ≈ 6.4%
stripeFee   = amount * variablePct + 0.30
netUSD      = amount - stripeFee
netMYR      ≈ netUSD * liveFxRate           // label "estimate", FX floats
afterBank   ≈ netMYR - bankReceivingFee     // label "estimate, varies by bank"
```
Rules for honesty:
- Default to the **foreign-card + conversion** stack (the realistic worldwide
  case), not the rosy domestic-only number.
- Mark FX and bank-fee lines clearly as **estimates** — do not imply a precise
  guaranteed RM payout.
- Show the maker pays the fee, framed as respect for the buyer, not a guilt
  trip.

### Team seat math (also at checkout — helps the buyer decide)

Separately, Team checkout shows seat math because it *helps* the purchase
decision (bundling one transaction across seats also softens the flat fee):

| Team purchase | One charge | Maker nets | Per seat |
|---|---|---|---|
| 2 seats | $2 | ~$1.57 | ~$0.79 |
| 5 seats | $5 | ~$4.38 | ~$0.88 |
| 10 seats | $10 | ~$9.06 | ~$0.91 |

The Pro/Team `.exe` is built with **Tauri** (Rust + WebView2) — a single
lightweight executable, no Electron, no Node runtime required.

---

## Licensing & anti-piracy

The `.exe` is freely copyable — that's fine. It's useless without
activation; you gate *what it does* on a valid key.

1. Pay at Stripe ($1, or $1 × seats for Team).
2. A Cloudflare Worker receives the Stripe webhook, generates a unique
   **license key**, emails it to the buyer.
3. Paste the key on first launch.
4. The `.exe` calls the Worker once: "valid key, free device slot?" → records
   the device, returns a token cached locally. Works offline afterward.
5. Bound to a limited number of devices per seat (suggest 2–3 so one buyer on
   laptop + desktop isn't punished).

**What Cloudflare stores (and what it does *not*):**

- **license** — `key`, `stripeCustomerId`, `seatsPaid`, `status`, `createdAt`
- **activation** — `key`, `deviceId`, `activatedAt` (one row per device)
- **No Google OAuth tokens, no user secrets.** Those stay encrypted
  **on-device**. Cloudflare only answers "is this key valid and is a seat
  free?" If the store leaked, the worst case is a list of random keys — no
  access to anyone's data.

**Where the key actually bites.** The valuable Pro/Team features that depend
on the backend (seat validation, and anything routed through the Worker)
simply won't function without a valid key — so editing a local `if` can't
unlock them. Purely-local niceties (themes, extra buttons) can be bypassed by
a determined person; that's accepted, because the goal isn't unbreakable DRM,
it's making "just pay $1" easier than hunting a cracked build. At $1, almost
everyone pays.

**Honest scope note.** Any client-side check can be cracked; chasing
pirates isn't worth it for a $1 product. The key-signing/validation and
secret-handling code must be written carefully and reviewed before launch —
a weak check makes the whole thing pointless, and storing license data is the
one place a mistake has real consequences.

### Before payment — Terms acknowledgment

The purchase is bookended by acknowledgments: agree to the terms going in,
confirm you saved the key coming out.

At checkout, **before** the charge, a short Terms summary is shown with a tick
box. The **Pay button stays disabled until the box is ticked**:

> ☐ I have read and agree — **all sales final / no refunds**, **no key
> recovery or reset**, **2-device limit**, provided **as-is**, mine **forever
> at today's price**, and **my data stays in my own Google account**.

Full terms live in `TERMS.md` (linked from checkout). Honest caveat: a tick is
an *acknowledgment*, not absolute legal armor — mandatory consumer law
(EU/UK/Malaysia) and Stripe chargeback rules can still override "no refund" in
some cases. It sets expectations and strengthens your position; it is not a
guarantee. (Not legal advice; have the terms reviewed before launch.)

### Key delivery flow (shown on the success page)

Keys are shown **on the Stripe success page** (no email service to maintain).
Because there is **no reset and no recovery** — by deliberate design — the
delivery moment is heavily guarded so a careless tab-close can't cost a buyer
their key. Friction here is intentional: it is a one-time, post-payment step,
and its whole job is to guarantee the buyer registers "save this now."

1. Payment succeeds → success page shows the key prominently, with a **copy
   button** and an optional one-click **`mailto:` self-send** (pre-fills an
   email to themselves with the key — a free backup, no email service needed).
2. **Three sequential confirmations**, each with *different* wording so people
   read instead of reflex-clicking:
   - **Step 1:** "Here is your key — copy it now."
   - **Step 2:** "Confirm you have saved it somewhere safe."
   - **Step 3 (final):** "This key cannot be recovered if lost. There is **no
     reset** by design. If you lose it, you must purchase again. Acknowledge
     to continue."
3. **The final confirm has a forced 5-second countdown** — the OK/close button
   is disabled and shows the timer, enabling only after 5s, so the buyer
   physically cannot rush past the warning.
4. Only after the third, timer-gated acknowledgment does the page release.

The wording explicitly tells the buyer to acknowledge that the key, once lost,
is lost forever and cannot be retrieved, that the system is designed with no
reset button, and that a lost key means buying a new one.

---

## Import / Export

Import/export is a **user convenience for moving their own data in and out** —
**completely separate from how QuickBeak syncs internally** (sync is the link +
Google Sheet contract; see below). These are just doors in and out; the user
picks whichever format suits *their* purpose.

Three formats, user's choice (available to **everyone, Free up** — it's their
data, never locked in):

- **JSON** — full fidelity. Projects, items, all fields, nested data
  (comments, history, image versions), settings. Round-trips perfectly — the
  "back up / move everything to a new device" format. Carries a
  **`formatVersion`** field so a file exported from an older QuickBeak imports
  safely into a newer one.
- **CSV** — opens in any spreadsheet (Excel, Google Sheets). The flat item
  fields, one row per item. **Lossy on nested data** (comments, history, extra
  image versions) by nature — and that's fine, because it's one option the
  user chooses *when a spreadsheet is what they want*. Not meant to be
  full-fidelity.
- **Markdown** — human-readable, for reading or sharing. Also lossy. Good for
  pasting into a doc or issue, not for perfect re-import.

The user picks: JSON for completeness, CSV for spreadsheets, MD for reading.
None of these is how QuickBeak stores or syncs data — they're interchange files
for the human.

---

## Updates & data persistence

**Core rule: an update must never force the user to set up again.** Data and
settings are stored separately from app code, so updating the code leaves them
intact. This is a hard requirement — breaking it (forcing re-entry or
re-activation after an update) is exactly the kind of thing that makes users
abandon a tool.

- **Tracked data, settings, category presets, theme** — live in `localStorage`
  (and synced to the user's Google Sheet). Updates don't touch them.
- **Data `formatVersion` + migrate-on-load** — when a new version changes the
  data shape, the app **upgrades existing data on load**, never asks the user
  to re-enter anything.
- **License persists** — the activation token is cached locally; updates must
  **never force re-activation** (critical given the no-key-recovery rule — a
  paying user must never be locked out by an update).
- **Google OAuth connection persists** — encrypted tokens survive updates; only
  a genuine scope/auth change would trigger a rare one-time re-consent.
- **Delivery channels:** desktop (Pro/Team) updates via the **signed Tauri
  auto-updater** in place — seamless, nothing to redo. Server-driven config
  (pricing/promo) updates without an app rebuild.
- **Free HTML gotcha (origin-sensitive):** `localStorage` is tied to the file's
  origin. Replacing the HTML file **in the same location** keeps the data;
  opening a new copy from a **different path** makes the browser treat it as a
  new origin, so the old data won't appear. Guidance: replace in place, or host
  Free at a stable URL. Worth surfacing to users so an update doesn't look like
  data loss.

> **Note on remote code:** updates ship as *signed* builds (Tauri) or static
> file replacement — **never** by fetching and executing remote/injected script
> at runtime. Runtime code injection would be a remote-code-execution channel
> that breaks the CSP hardening and endangers user data; it is explicitly out
> of scope.

---

## Tip jar

Settings → **Support QuickBeak** opens a Stripe tip link for optional donations.
Quiet and unobtrusive — see Distribution & conversion for why. (License
activation and anti-piracy are covered above under "Licensing & anti-piracy".)

---

## Data model

Stored under `localStorage["quickbeak:db"]` as `{ formatVersion, projects, items, settings }` (one-shot migrated from the old `bugdump:db` key; `formatVersion` is currently `2`).

Each project:

| field | meaning |
|---|---|
| `id` | stable project key |
| `name` | display name |
| `types` | array of `bug` \| `suggestion` \| `feedback` |
| `folderMode` | `shared` \| `per-project` (Drive image layout) |
| `syncTarget` | `gsheet` \| none |
| `categoryMode` | `ai` (default) \| `preset` — per project; controls Magic Tidy's category pool |
| `categoryPresets` | array of user-defined categories (preset mode); full CRUD |
| `titleMode` | `ai` (default) \| `self` — does Magic Tidy write the title, or the user |
| `titlePrefixOn` / `titlePrefixTags` | optional display prefix; which of `category`/`priority`/`type`/`status` tags to prepend to the *shown* title (raw title untouched) |
| `archived` | hidden from the active selector, data kept (reversible) |
| `driveFolderId` | this project's Drive image-folder id (located by id, never by name) |
| `intakeLinks` | array of `{token, src, destProjectId}` — public submit links + source tag + destination project |
| `intakeSheetId` | (project/team) the separate intake Google Sheet, distinct from the main team Sheet |

Each item:

| field | meaning |
|---|---|
| `id` | stable random key — the sync key, never reused/changed |
| `seq` | human-friendly #number, assigned in creation order |
| `order` | manual drag-sort position |
| `projectIds` | array — one or several projects this item links to |
| `type` | `bug` \| `suggestion` \| `feedback` (one of the item's project's allowed types) |
| `title` / `description` / `category` | text fields (`title` is the raw title; any tag prefix is display-only) |
| `priority` | `critical` \| `high` \| `medium` \| `low` |
| `status` | `open` \| `in progress` \| `done` |
| `assignee` | Google email of current owner, or null (Team) |
| `comments` | array of `{author, text, timestamp, deletedAt}` (Team); deleted comments go to Trash, sticky |
| `history` | array of `{actor, action, from, to, timestamp}` — key events only (Team) |
| `source` | for intake items: which `src` tag they arrived through |
| `shots` | array of compressed JPEG data URLs (local copies); annotations flatten into new entries, original always kept |
| `shotVersions` | (Team) per-image saved annotated versions, timestamped; Google-Sheets-style linear history |
| `shotMeta` | array of `{h: contentHash, id: driveFileId}` for sync dedup |
| `createdAt` / `updatedAt` | timestamps |
| `syncedVersion` | last-synced baseline for conflict detection (both-changed → conflict) |
| `deletedAt` | soft-delete timestamp; null = live, set = in Trash/Recently Deleted (30-day purge) |

Cloudflare (license server) stores only `license` and `activation` records —
**never Google tokens or user data**. See "Licensing & anti-piracy".

---

## Sync setup

### Google Sheets (Pro — OAuth)

1. Settings → Sync → **Connect Google**.
2. Sign in and grant access to Sheets + Drive.
3. Pick or create a sheet; choose **shared** or **per-project** folder mode
   for screenshots.
4. Sync. Tokens are stored encrypted; no shared secret to leak.

### Notion and other targets (deferred)

Deferred to keep the maintenance surface small. Each OAuth integration is an
ongoing commitment (provider API changes, secret rotation, support load), so
Pro v1 ships with Google Sheets only.

### Free version — sync (no OAuth)

**Free never gets OAuth.** Free stays **local-first** and keeps the **existing
shared-secret Apps Script sync** from QuickBeak as its interim cloud sync, plus
JSON/CSV/MD import-export for moving data. OAuth sync is introduced **after Pro**
and is offered to **Pro/Team only** — it is one of the first concrete reasons to
upgrade.

Why this shape: it keeps Free shippable fast (no heavy OAuth rebuild gating the
Free launch), and it makes cloud sync a paid, gateable value rather than a free
feature. Linking Google (the OAuth path) is optional even on Pro/Team.

**Honest security caveat (interim).** Because Free retains the Apps Script sync,
the SECURITY-AUDIT **C3** concern stays *live on Free* until OAuth retires that
path post-Pro — so the C3 hardening (folder-scoped, fail-closed, image-MIME
checked) must remain in place. The Apps Script `/exec` URL + secret is still the
weak point on Free; treat it carefully and prefer import/export for sharing where
possible. OAuth removes this weak point entirely on the tiers that adopt it (no
secret, no public endpoint; access gated by Google's own sharing).

---

## Sync conflict resolution

Conflicts happen even in **Free** — the same person on two devices (phone +
laptop) syncing to the same place. In **Team**, different people edit the same
item. The one unforgivable bug for a tracker is silent data loss, so the model
below is deliberate. (This touches Free, so the **undo/soft-delete function is
a Phase-0 / pre-Free-ship requirement**, not Pro-only.)

### Detecting a conflict — version markers (required)

Each item carries a **per-item synced-version baseline** (the last version both
sides agreed on), plus `updatedAt`. On sync, compare against the baseline:

- Local changed, remote didn't → push local. No conflict.
- Remote changed, local didn't → pull remote. No conflict.
- **Both changed since baseline → conflict → ask the user.**
- Neither changed → nothing to do.

Without the baseline you can't tell a real conflict from a normal update, so
this marker is mandatory.

### Resolving — by field type

- **Scalar fields** (title, description, priority, status) → **user chooses**
  via a conflict picker: **Use Local** or **Use Google Sheet**, shown with a
  **diff** so they pick with eyes open. The rejected ("losing") version is kept
  as a **shadow copy** (recoverable), never hard-discarded.
- **Additive lists** (comments, screenshots, history) → **union** both sides,
  so nobody's comment or screenshot is lost when an unrelated scalar field
  "loses" the pick.
- **Unresolved conflicts wait** — never auto-resolve in the background while
  the user isn't looking. Flag the item "needs resolution" and hold both.

### Deletion — done, not delete (Jira-style lifecycle)

The everyday "I'm finished" action is a **status transition** (→ done), **not
deletion**. Done items stay fully intact, just filtered out of the active view
— history preserved, and the scary delete-vs-edit conflict mostly evaporates
(it's just a normal status field change).

Genuine deletion (mistakes, spam, duplicates) is rare and **moves the thing to
Trash** — a sticky, recoverable state:

- Delete an item or a comment → it moves to **Trash**, not gone.
- **Sticky:** if a teammate was offline still editing/commenting on it when it
  was deleted, that late activity **follows it into Trash** rather than
  resurrecting it. The bin wins; the person can pull it back out if the delete
  was wrong.
- Recoverable until the **30-day purge** (same window as Recently Deleted).
- Applies at both **item and comment** level — one unified Trash concept.

### Backups

- **Shadow-copy sheet** — losing versions and conflict casualties written to a
  separate backup tab/sheet.
- **Google Sheets native version history** — lean on Google's own built-in
  revision history as a free, zero-code recovery path; surface "restore via
  Google Sheets version history" as documented guidance.

### Workflow-definition conflicts (Team 10+ multi-stage)

The custom-stage pipeline is shared, syncable data. To keep schema-conflicts
rare, workflow edits are **admin/owner-only**; concurrent edits resolve
last-write-wins with a shadow copy, same as scalar fields.

---

## Roadmap

**Pro tier**
- [x] Rename to QuickBeak
- [x] Define Project concept (Bug / Suggestion / Feedback types)
- [ ] Add `projects` + `projectIds` to data model
- [ ] Four priority tiers (add Critical)
- [ ] Five Magic Tidy actions, project-type aware
- [ ] Batch Magic Tidy (tidy all / tidy selected)
- [ ] Odysseus provider preset (PewDiePie self-hosted; `/api/chat` + `ody_` token adapter)
- [ ] Magic Image Suggestion (vision)
- [ ] Day/night theme + adjustable palette
- [ ] Undo / restore (soft-delete + Recently Deleted)
- [ ] Tauri packaging (Windows `.exe`)
- [ ] Stripe license activation + Cloudflare license/seat server
- [ ] In-app tip jar
- [ ] Auto-update via Tauri updater

**Team tier**
- [ ] Google Sheets OAuth sync (multi-user, native Google sharing)
- [ ] Drive folder mode (shared / per-project)
- [ ] Identity via Google login
- [ ] Comments, assignee, transfer
- [ ] Lightweight ownership history (key events)
- [ ] Public intake links (separate intake Sheet, append-only, source tracking)

**Later**
- [ ] macOS and Linux builds

### Resolved design decisions (settled in brainstorming)

- **Server-driven pricing hook (build in from `1.x`).** The app reads the
  current price + active promo from the Worker at checkout, rather than
  hardcoding "$1". Cheap now (one config row + one read endpoint), painful to
  retrofit. Enables "charge more one day" from the admin dashboard with **no
  app redeploy**. Cache last-known price for display; checkout needs
  connectivity anyway. Dashboard *controls* come later — only the *hook* is
  built early.
- **Grandfathering.** Price changes affect **new purchases only**. Any license
  already bought stays valid forever at the price paid (TERMS §6). Required by
  the "forever" promise.
- **First-run onboarding.** New users land on a pre-made **sample project**
  ("Welcome to QuickBeak") containing one bug, one suggestion, and one feedback
  item — showing the model and the Magic Tidy buttons immediately. One tap to
  clear. Serves the "Free is the training ground" goal better than an empty
  state or a setup wizard.
- **Support/contact.** Best-effort via **support@quickbeak.com** + a GitHub
  issues link. No ticketing system. Set expectations honestly given $1 + no
  resets. Surfaced in-app (About) and in TERMS §13.

### Deferred (keeping v1 lean & maintainable)

- Notion sync, GitHub Issues sync — extra OAuth engines to maintain
- Full version history — soft-delete covers the real need
- Full Jira-grade audit trail (every field change) — lightweight history covers the real need

### Parked — future ideas (revisit after core ships)

- **AI cost guard for paid endpoints** — if a user points Magic Tidy (esp.
  *batch* tidy) at a paid API (OpenAI etc.), a surprise bill is possible.
  Parked: **add a confirm-before-batch / usage cap only if someone asks.**
  Local models (Ollama/Odysseus) are free, so this is moot for the default
  privacy-first path. (Decided: not needed until requested.)

These are deliberately set aside until the core product is built and in real
use. Captured here so they're not lost, not so they're built now.

- **AI agent / Autopilot QA** — hook an AI agent to a project to triage,
  cluster duplicates, suggest priorities across the whole list, and draft
  repro steps (light version), and eventually attempt to reproduce/verify
  fixes (heavy version — effectively its own product). Revisit only once the
  tracker itself has real users.

- **Todo / task project type** — a fourth project type alongside Bug /
  Suggestion / Feedback, reusing the *exact same item shape* (title,
  description, priority, status) with Magic Tidy phrasing tasks as
  actionable. Deliberately minimal — **no** due dates, subtasks, reminders,
  or recurring tasks unless real users ask. Bundled with the QA-agent version,
  not v1. (Shopping list and other consumer list types are explicitly **out
  of scope** — different product, different audience, would blur the focus.)

- **BYO backend / self-host connector (v3+, advanced Pro/Team).** A
  true-privacy escape hatch for technical users: point QuickBeak at *their own*
  server instead of Google, so data never touches a third party. **The user
  hosts it, not us** — we publish a sync-contract spec + a reference
  implementation (small Node/Python/Docker script); we do not operate or debug
  anyone's server. Explicitly **best-effort / unsupported, for technical
  users.** Honest privacy pitch: not "Google spies on you" (overstated), but
  "with self-host your data never touches a third party — you don't have to
  trust anyone's promises, including Google's or ours."
  *Design discipline adopted now:* Phase-0 Google sync is built **behind a
  sync-contract abstraction** (talk to an interface, not hardwired to Google),
  so this slots in later without a rewrite — same "design the hook now, build
  the feature later" move as server-driven pricing.

- **More connectors (v3 / v4+).** Once the sync contract is proven, additional
  connectors can slot in as implementations of the same interface. **Candidate
  list (ideas, demand-gated, NOT commitments — each added only on real demand):**
  - **Git repo as backend** — items stored as CSV/Markdown files, committed &
    pulled. Strong fit for the dev audience ("my issues are `.md` files in my
    repo"), great own-your-data story. *(Note: distinct from the user-facing
    JSON/CSV/MD **import/export** — that's one-way file interchange for the
    user; this Git connector is two-way **sync**.)*
  - **Self-host backend** (the v3 BYO option above)
  - **Notion** database
  - **GitHub / GitLab Issues**
  - **S3-compatible object storage**
  - **Generic webhook / REST endpoint** (catch-all for anything custom)

  A *public* connector SDK ("anyone can write connectors") is **parked
  indefinitely**: it's a real security + maintenance surface (a bad connector
  could mishandle user data) and a big ongoing responsibility, only worth it
  with genuine traction.

- **Enterprise tier ($20/mo, custom DB/backend, SSO, etc.)** — **parked,
  probably indefinitely.** Considered during brainstorming and deliberately
  rejected for now: it betrays the core model (zero-server, data in the user's
  own Google, one-time pricing) and would make QuickBeak an enterprise SaaS
  company with infrastructure, contracts, and support obligations — a
  different product and a different life. Multi-stage workflows (the feature
  that tempted this) live in **Team at 10+ seats** instead, needing no new
  tier or backend. *Revisit only if many paying teams have real traction and
  explicitly ask — and only as a conscious pivot, not a feature bolt-on.*

- **Live inside Odysseus via MCP** — make QuickBeak appear *as a tool* inside
  PewDiePie's Odysseus workspace so its agent can create/list/update tickets
  and search feedback. Verified mechanism (researched against the repo, June
  2026): Odysseus has **no plugin/extension/npm-install system**; the only
  supported path is an **MCP server** registered by an admin via
  `POST /api/mcp/servers` (transport `stdio` with a `command`, or `sse` with
  a `url` — note: legacy SSE, **not** Streamable HTTP). Tools surface to the
  agent as `mcp__{server_id}__{tool_name}`. "Skills" are agent-authored
  `SKILL.md` files, not a third-party packaging channel. Build QuickBeak's
  actions as an MCP server (mirroring Odysseus's built-in stdio servers),
  start with read-only tools, and **pin to a commit SHA** — Odysseus is a
  1.0 launched 31 May 2026 with no tagged releases and security fixes landing
  directly on `main`, so treat it as a fast-moving target. Do the standalone
  free version first; add the MCP integration once their API settles.

---

## Distribution & conversion

Two free channels feed one funnel toward Pro / Team / donations:

1. **GitHub** — the free HTML version, downloadable and standalone. Works
   regardless of any platform. Ship this first; it depends on no one.
2. **Inside Odysseus (later)** — QuickBeak as an MCP tool (see Parked above).
   Matches the Odysseus crowd's all-in-one, self-hosted, stick-with-the-
   ecosystem mindset. Bigger build, gated on their API stabilising.

**Soft conversion, not walls.** The free tier protects nothing (the HTML is
readable), so it converts by *invitation*, not gating: one unobtrusive
"Support QuickBeak" tip link (Stripe) and a tasteful "What's in Pro / Team"
card. Keep asks quiet — the privacy/indie/self-hoster audience funds tools it
respects and bristles at naggy upsells.

**Marketing line — stay honest.** "Works with Odysseus" / "plug in your local
Odysseus models" is fine (factual interop). Implying partnership or
endorsement by PewDiePie/Odysseus is not. You support their thing; you do not
claim they support yours. Lean on the durable pitch (private, local, cheap),
let Odysseus be one named example, not the whole identity.

---

## Name & trademark

**QuickBeak** — validated clean as of June 2026. No registered trademark
conflict found in USPTO Class 9 or Class 42. No active software product
using the name. Domain registration recommended before launch:
`quickbeak.com` / `quickbeak.io`.

---

## License

**QuickBeak is not open source.** Released under a source-available,
no-redistribution license - read it before using, since using it means you
accept the terms.

- **You may** use it for any purpose, personal or commercial (including at
  work or in your own commercial products), and modify it for your own use.
- **You may not** sell, rent, sublicense, or redistribute it; embed or bundle
  it into another product or service you ship; make it available to third
  parties as a standalone or competing offering; or remove the
  copyright/license notices.
- The grant is **non-transferable and revocable at will.**
- Provided **"as is"**, with no warranty and no liability.

For redistribution, embedding, OEM, or any permission beyond the above,
contact the Licensor.
