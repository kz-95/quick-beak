# Changelog

All notable changes to QuickBeak are recorded here, newest first. The project
follows **Semantic Versioning** on one continuous line across tiers (see
`VERSIONING.md`). One entry per shipped version; one Git tag per entry
(`v1.0.0`, `v1.1.0`, …).

Entry format (from VERSIONING.md) — group by `Added` / `Changed` / `Fixed` /
`Security`, and tag each line with the tier it belongs to where relevant:

```
## [1.1.0] — 2026-MM-DD
### Added
- (Pro) Batch Magic Tidy — tidy all or tidy selected items.
### Fixed
- Sync no longer drops the dirty-dot indicator after a failed push.
```

---

## [Unreleased]

Work toward `1.0.0` (Free). Track granular tasks in `TODO.md`; move them here as
they ship in a tagged release.

### Added
- (Free) **Projects.** Create / select / rename / archive / delete projects, each
  typed Bug / Suggestion / Feedback. The board scopes to the active project; a
  project selector sits under the wordmark.
- (Free) **Fourth priority tier - Critical** (Critical / High / Medium / Low),
  with its own pill and priority sort order.
- (Free) **Trash (soft-delete).** Deleting an item moves it to Trash instead of
  erasing it; restore or permanently delete from the Trash panel; 30-day
  auto-purge. Required at Free (two-device sync can create conflicts).
- (Free) **Type filter** (Bug / Suggestion / Feedback) and an item **Type**
  selector in the editor, plus a type badge on cards.
- (Free) **Category mode** per project: AI-decide (default) or a preset pool with
  full add/remove; the editor shows a preset picker in preset mode.
- (Free) **Title mode + prefix** per project: AI-decide or self-pick; optional
  display prefix that prepends `[category] [priority] [type] [status]` tags. The
  prefix is a render-time layer - the raw stored title is never modified.
- (Free) **Project-aware Magic Tidy** - the prompt now states the project and its
  types, constrains the category to the preset pool when set, and respects the
  title mode (won't overwrite a self-written title).
- (Free) **Odysseus provider preset + adapter** (`POST /api/chat` with an `ody_`
  bearer token), behind the same https/localhost URL gate as other providers.
- (Free) **Copy button + export-format dropdown drive each other.** The dropdown
  offers Markdown (.md), JSON (.json) and **Table (.csv)**; Export downloads in
  that format (Table = CSV) and Copy puts the same in the clipboard (Table copies
  as TSV so it pastes into spreadsheet columns).
- (Free) **All Projects** entry in the project selector. It scopes the board and
  every export/backup/copy at once, replacing the separate export-scope control.
- (Free) **Brand logo** in the header (inlined, single-file safe).
- (Free) **Editor: Type moved into the header and a Project picker added** above
  the title, so you choose the item's project and type up top (handy from the
  All Projects view). The editor's type list, category mode and title prefix now
  follow the picked project.
- (Free) **Export format dropdown** (Markdown .md / JSON .json) + one Export
  button, replacing the separate Export/Backup buttons.
- (Free) **Data settings tab**: Forget all API keys + sync secret; Clear all
  local data.
- (Free) **`#reset` escape hatch** - opening `QuickBeak.html#reset` wipes all
  local QuickBeak keys (current + legacy `bugdump:*`) and starts fresh; a last
  resort when a device's stored data is unrecoverable.
- (Dev) **Headless smoke-test** (`test/smoke.mjs`, Playwright) that boots the
  app, runs a render-time XSS check on a malicious item, and verifies the
  data-model + control flows. Satisfies SECURITY-AUDIT defense #1.

### Changed
- Data model bumped to **`formatVersion` 2** with migrate-on-load: existing items
  fold into one default project and gain `projectIds`, `type`, `deletedAt`,
  `syncedVersion`. Team-only fields (`assignee`, `comments`, `history`, `source`,
  `shotVersions`) and project sync fields (`driveFolderId`, `sharedFolderId`) are
  defined now so there is never a later migration.
- Controls are responsive. **Desktop**: row 1 = Search : Sort : Reverse (8 : 1 : 1),
  row 2 = Category : Type (5 : 5). **Mobile**: Search : filters-button : Reverse
  (8 : 1 : 1), the button opening a **Filter & sort dialog** (Sort + Category +
  Type move into it and back out). The standalone Status filter was removed.
- **Status chips are now a multi-select filter.** "All" is the default; clicking a
  status filters to it (deselecting All), and you can add more statuses to combine
  them. Clicking the last one off, or "All", resets to everything.
- **Brand mark**: the logo now stands in for the "Q" (logo + "uickBeak", tucked).
- Tagline changed to "Beak it. Tidy it. Track it."; favicon now the QuickBeak
  `.ico` (inlined, single-file safe).
- Wordmark now set in **Comfortaa** (per the brand brief).
- Mobile layout: the import/export/copy row and the controls row each stay on a
  single line; vertical spacing between header sections normalised to 10px.

### Fixed
- **Load/save no longer loops alerts in restrictive webviews.** All localStorage
  access goes through guards that never throw, so a sandboxed/private-mode viewer
  (reads or writes blocked) degrades to an in-memory session with a single clear
  notice instead of looping "Couldn't save" / "corrupt" on every reload.
- **Migration is fully fault-tolerant.** `migrateDB` and every `sanitize*` /
  `ensure*` helper wrap per-item/per-project work in try/catch, skip bad entries,
  and default missing fields. The "couldn't be read / corrupt" alert now fires
  **only** when `JSON.parse` itself fails; an old/partial/weird blob migrates as
  far as it can and keeps its items (each gets a project) - it is never wiped.
  A malformed blob alerts once, self-heals, and does not recur on the next load.
- **Mobile horizontal overflow** — added `overflow-x: hidden` + `max-width: 100%`
  to `html,body`; vertically switched from `100vh` to `100dvh` (iOS Safari
  address-bar sizing). The export-format `.io-scope` select now shrinks
  responsively (280px desktop, fills remaining space on mobile) and the cascade
  order is correct so the mobile override wins.
- **Marketing site** (`index.html`) — same overflow guard on `body`.
- **`.proj-bar` gap** tightened to 6px.

### Security
- All **20** audit findings (C1-C4, W1-W11, I1-I5) + the prompt-injection guard +
  the modal-backdrop fix re-verified after the data-model + UI restructure. New
  painted surfaces (project name/id, category presets, item type, title-prefix
  tags) all route through `escapeHtml`; the Magic Tidy prompt keeps the untrusted
  note end-anchored after `NOTE FOLLOWS:`. The render-time XSS test now exists and
  runs (`test/smoke.mjs`).

---

<!--
When you ship 1.0.0, replace the Unreleased block with:

## [1.0.0] — 2026-MM-DD
### Added
- (Free) ...
...and start a fresh empty [Unreleased] section above it.
-->
