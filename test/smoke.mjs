/* QuickBeak headless smoke-test - the self-verify gate.
 *
 * Satisfies SECURITY-AUDIT "defense #1: a render-time XSS test". It loads the
 * real QuickBeak.html in headless Chromium and asserts:
 *   1. the app boots (DB loads, the board renders, no uncaught error), and
 *   2. a deliberately malicious item cannot execute script when rendered
 *      (covers C1 id-paint, C2 screenshot data-URL, and escapeHtml on text).
 *
 * Run from the repo root:  node test/smoke.mjs
 * or from this folder:     npm test
 *
 * Dev-only. Never shipped to users; QuickBeak itself has no build step.
 */
import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const APP = pathToFileURL(resolve(here, "..", "QuickBeak.html")).href;
const STORAGE_KEY = "quickbeak:db";

let failures = 0;
function check(name, cond) {
  console[cond ? "log" : "error"]((cond ? "  PASS " : "  FAIL ") + name);
  if (!cond) failures++;
}

/* The flag any successful injection would flip. If it ever becomes truthy, an
 * attacker-controlled string executed during render - i.e. an XSS regression. */
const XSS = "window.__xss=1";
const IMG = '"><img src=x onerror="' + XSS + '">'; // breaks out of an attribute, runs onerror
const SCRIPT = "<script>" + XSS + "<\/script>"; // inert via innerHTML, escaped path still tested
const MARKER = "QB_XSS_MARKER"; // lets us prove the text was rendered (escaped), not silently dropped

function maliciousDB() {
  const evil = MARKER + IMG + SCRIPT;
  return {
    formatVersion: 1,
    items: [
      {
        id: IMG, // C1: non-[A-Za-z0-9_-] id -> safeId() must mint a fresh one; escaped on paint
        title: evil,
        description: evil,
        category: evil,
        priority: 'high"><img src=x onerror="' + XSS + '">',
        status: 'open"><img src=x onerror="' + XSS + '">',
        shots: [
          'data:image/svg+xml,<svg onload="' + XSS + '">', // C2: svg rejected by isImageDataUrl
          'data:image/png;base64,AAAB"><img src=x onerror="' + XSS + '">', // C2: trailing payload rejected
        ],
        shotMeta: [],
        seq: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    settings: {}, // loadDB() backfills defaults
  };
}

const browser = await chromium.launch();
const page = await browser.newPage();
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(String(e)));
const dialogs = []; // every native alert()/confirm() message, so we can assert on them
page.on("dialog", (d) => {
  dialogs.push(d.message());
  d.accept();
});
const corruptAlerts = () => dialogs.filter((m) => /couldn't be read|corrupt/i.test(m));
const saveAlerts = () => dialogs.filter((m) => /couldn't save|blocking local storage/i.test(m));

/* ---- 1. Boot check (clean first load seeds the example item) ---- */
await page.goto(APP);
await page.waitForSelector("#list", { timeout: 10000 }).catch(() => {});
check("boot: #list present", (await page.$("#list")) !== null);
check("boot: a card rendered", (await page.$("#list .card")) !== null);
check("boot: no uncaught errors", pageErrors.length === 0);
check(
  "boot: Magic Tidy spinner keyframe 'sp' is defined (rotation works)",
  await page.evaluate(() =>
    [...document.styleSheets].some((ss) => {
      try {
        return [...ss.cssRules].some(
          (r) => r.type === CSSRule.KEYFRAMES_RULE && r.name === "sp",
        );
      } catch (_) {
        return false;
      }
    }),
  ),
);

/* ---- 2. Render-time XSS check ---- */
await page.evaluate(
  ([k, v]) => localStorage.setItem(k, v),
  [STORAGE_KEY, JSON.stringify(maliciousDB())],
);
pageErrors.length = 0;
await page.reload();
await page
  .waitForSelector("#list .card, #list .empty", { timeout: 10000 })
  .catch(() => {});
await page.waitForTimeout(300); // let any async onerror fire if it were going to

check(
  "xss: no payload executed (window.__xss unset)",
  !(await page.evaluate(() => window.__xss || 0)),
);
check(
  "xss: no live onerror <img> injected",
  (await page.evaluate(() => document.querySelectorAll("img[onerror]").length)) ===
    0,
);
check(
  "xss: malicious text rendered as escaped text",
  await page.evaluate(
    (m) => (document.querySelector("#list").textContent || "").includes(m),
    MARKER,
  ),
);
check("xss: no uncaught errors during malicious render", pageErrors.length === 0);

/* ---- 3. Data model: v1 -> v2 migration, 4-tier priority, soft-delete ---- */
const legacyDB = {
  formatVersion: 1, // pre-projects shape
  items: [
    {
      id: "alpha1",
      title: "Critical item",
      description: "d",
      category: "C",
      priority: "critical", // must survive the 4th tier
      status: "open",
      shots: [],
      createdAt: 1,
      updatedAt: 1,
      seq: 1,
    },
    {
      id: "beta2",
      title: "Trashed item",
      description: "d",
      category: "C",
      priority: "high",
      status: "open",
      shots: [],
      createdAt: 2,
      updatedAt: 2,
      seq: 2,
      deletedAt: Date.now(), // recent soft-delete: stays in store, hidden from board (not yet purgeable)
    },
    {
      id: "gamma3",
      title: "Ancient trash",
      description: "d",
      category: "C",
      priority: "low",
      status: "open",
      shots: [],
      createdAt: 3,
      updatedAt: 3,
      seq: 3,
      deletedAt: 1000, // 1970 - older than 30 days, must be auto-purged on load
    },
  ],
  settings: {},
};
await page.evaluate(
  ([k, v]) => localStorage.setItem(k, v),
  [STORAGE_KEY, JSON.stringify(legacyDB)],
);
pageErrors.length = 0;
await page.reload();
await page
  .waitForSelector("#list .card, #list .empty", { timeout: 10000 })
  .catch(() => {});
await page.waitForTimeout(150);

const stored = await page.evaluate(
  (k) => JSON.parse(localStorage.getItem(k) || "{}"),
  STORAGE_KEY,
);
check("model: formatVersion bumped to 2", stored.formatVersion === 2);
check(
  "model: a project exists after migration",
  Array.isArray(stored.projects) && stored.projects.length >= 1,
);
check(
  "model: every item got a projectId",
  Array.isArray(stored.items) &&
    stored.items.length === 2 &&
    stored.items.every((i) => Array.isArray(i.projectIds) && i.projectIds.length >= 1),
);
check(
  "model: critical priority preserved",
  stored.items.some((i) => i.priority === "critical"),
);
check(
  "model: soft-deleted item kept in store (not purged)",
  stored.items.some((i) => i.id === "beta2" && i.deletedAt),
);
check(
  "model: 30-day-old trash auto-purged on load",
  !stored.items.some((i) => i.id === "gamma3"),
);

const liveTitles = await page.evaluate(() =>
  Array.from(document.querySelectorAll("#list .card-title")).map(
    (e) => e.textContent || "",
  ),
);
check(
  "model: live critical item shows on board",
  liveTitles.some((t) => t.includes("Critical item")),
);
check(
  "model: trashed item hidden from board",
  !liveTitles.some((t) => t.includes("Trashed item")),
);
check(
  "model: critical priority pill rendered",
  (await page.$("#list .pill.pri-critical")) !== null,
);
check("model: no uncaught errors on migrated render", pageErrors.length === 0);

/* ---- 4. Step 3 controls: projects, type filter, trash ---- */
const cardTitles = () =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll("#list .card-title")).map(
      (e) => e.textContent || "",
    ),
  );

const twoProjDB = {
  formatVersion: 2,
  projects: [
    { id: "projaaa", name: "Alpha", types: ["bug", "suggestion", "feedback"] },
    { id: "projbbb", name: "Beta", types: ["bug", "suggestion", "feedback"] },
  ],
  items: [
    { id: "itemA1", projectIds: ["projaaa"], type: "bug", title: "Alpha bug one", priority: "high", status: "open", createdAt: 1, updatedAt: 1, seq: 1 },
    { id: "itemA2", projectIds: ["projaaa"], type: "suggestion", title: "Alpha suggestion", priority: "low", status: "open", createdAt: 2, updatedAt: 2, seq: 2 },
    { id: "itemB1", projectIds: ["projbbb"], type: "bug", title: "Beta bug only", priority: "medium", status: "open", createdAt: 3, updatedAt: 3, seq: 3 },
  ],
  settings: { activeProjectId: "projaaa" },
};
await page.evaluate(
  ([k, v]) => localStorage.setItem(k, v),
  [STORAGE_KEY, JSON.stringify(twoProjDB)],
);
pageErrors.length = 0;
await page.reload();
await page.waitForSelector("#list .card", { timeout: 10000 }).catch(() => {});

check(
  "ui: project selector has All Projects + 2 projects",
  await page.evaluate(() => {
    const s = document.querySelector("#projSel");
    return (
      !!s &&
      s.options.length === 3 &&
      [...s.options].some((o) => o.value === "__all__")
    );
  }),
);
check("ui: type filter present", (await page.$("#fType")) !== null);
check("ui: trash entry present", (await page.$("#trashBtn")) !== null);
check(
  "ui: export scope select removed (replaced by projSel)",
  (await page.$("#exportScope")) === null,
);
check("ui: copy-table button present", (await page.$("#copyTableBtn")) !== null);
check(
  "ui: export format dropdown present (.md/.json)",
  (await page.$("#exportFmt")) !== null,
);
check("ui: settings Data tab present", (await page.$("#tabBtnData")) !== null);

let titles = await cardTitles();
check(
  "ui: active project scopes the board (Alpha only)",
  titles.some((t) => t.includes("Alpha bug one")) &&
    titles.some((t) => t.includes("Alpha suggestion")) &&
    !titles.some((t) => t.includes("Beta bug only")),
);

await page.selectOption("#projSel", "projbbb");
await page.waitForTimeout(100);
titles = await cardTitles();
check(
  "ui: switching project updates the board (Beta only)",
  titles.some((t) => t.includes("Beta bug only")) &&
    !titles.some((t) => t.includes("Alpha bug one")),
);

// All Projects view shows items from every project
await page.selectOption("#projSel", "__all__");
await page.waitForTimeout(100);
titles = await cardTitles();
check(
  "ui: All Projects shows items from every project",
  titles.some((t) => t.includes("Alpha bug one")) &&
    titles.some((t) => t.includes("Beta bug only")),
);
// Copy follows the export-format dropdown: Table copies TSV (covering every project)
await page.selectOption("#exportFmt", "table");
check(
  "ui: copy (Table format) builds a TSV table for the current scope",
  await page.evaluate(() => {
    window.__cap = "";
    try {
      if (!navigator.clipboard)
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {},
        });
      navigator.clipboard.writeText = (t) => {
        window.__cap = t;
        return Promise.resolve();
      };
    } catch (_) {}
    document.querySelector("#copyTableBtn").click();
    const c = window.__cap || "";
    const head = c.split("\n")[0] || "";
    return (
      /\tTitle\t/.test(head) &&
      c.includes("Alpha bug one") &&
      c.includes("Beta bug only")
    );
  }),
);
check(
  "ui: export format dropdown offers md / json / table",
  await page.evaluate(() => {
    const o = [...document.querySelectorAll("#exportFmt option")].map(
      (x) => x.value,
    );
    return (
      o.includes("md") && o.includes("json") && o.includes("table")
    );
  }),
);
await page.selectOption("#exportFmt", "md");

await page.selectOption("#projSel", "projaaa");
// desktop: filters inline (no button), status filter removed entirely
check(
  "ui: status filter removed (#fStatus gone)",
  (await page.$("#fStatus")) === null,
);
check(
  "ui: filters inline on desktop, filter button hidden",
  await page.evaluate(() => {
    const t = document.querySelector("#fType");
    const btn = document.querySelector("#filterBtn");
    return !!t && t.offsetParent !== null && (!btn || btn.offsetParent === null);
  }),
);
await page.selectOption("#fType", "suggestion");
await page.waitForTimeout(100);
titles = await cardTitles();
check(
  "ui: type filter (suggestion) works",
  titles.some((t) => t.includes("Alpha suggestion")) &&
    !titles.some((t) => t.includes("Alpha bug one")),
);
await page.selectOption("#fType", "");
await page.waitForTimeout(50);

// mobile: filter button shows, opens dialog (selects move in), then move back on close
await page.setViewportSize({ width: 390, height: 800 });
await page.waitForTimeout(50);
check(
  "ui(mobile): filter button visible, inline filters hidden",
  await page.evaluate(() => {
    const btn = document.querySelector("#filterBtn");
    const f = document.querySelector("#filters");
    return !!btn && btn.offsetParent !== null && f.offsetParent === null;
  }),
);
await page.click("#filterBtn");
await page.waitForTimeout(80);
check(
  "ui(mobile): dialog open with filters moved into it",
  await page.evaluate(
    () =>
      document.querySelector("#filterOverlay").classList.contains("open") &&
      document
        .querySelector("#filterSlot")
        .contains(document.querySelector("#filters")),
  ),
);
await page.click('#filterOverlay [data-close="filter"]');
await page.waitForTimeout(80);
check(
  "ui(mobile): filters moved back to controls on close",
  await page.evaluate(() =>
    document
      .querySelector("#controls")
      .contains(document.querySelector("#filters")),
  ),
);
await page.setViewportSize({ width: 1280, height: 720 });
await page.waitForTimeout(50);

// soft-delete the "Alpha bug one" card via its delete button + confirm dialog
await page.evaluate(() => {
  const c = [...document.querySelectorAll("#list .card")].find((x) =>
    (x.textContent || "").includes("Alpha bug one"),
  );
  c.querySelector('[data-action="delete"]').click();
});
await page.waitForTimeout(80);
await page.click("#delConfirm");
await page.waitForTimeout(100);
titles = await cardTitles();
check(
  "ui: deleted item leaves the board",
  !titles.some((t) => t.includes("Alpha bug one")),
);
check(
  "ui: trash count reflects the soft-delete",
  /\(1\)/.test(await page.evaluate(() => document.querySelector("#trashBtn").textContent)),
);
check(
  "ui: soft-deleted item still in store",
  await page.evaluate((k) => {
    const d = JSON.parse(localStorage.getItem(k) || "{}");
    return d.items.some((i) => i.id === "itemA1" && i.deletedAt);
  }, STORAGE_KEY),
);

// open Trash, restore it
await page.click("#trashBtn");
await page.waitForTimeout(80);
await page.evaluate(() =>
  document.querySelector('#trashList [data-tact="restore"]').click(),
);
await page.waitForTimeout(100);
check(
  "ui: restore clears deletedAt",
  await page.evaluate((k) => {
    const d = JSON.parse(localStorage.getItem(k) || "{}");
    return d.items.some((i) => i.id === "itemA1" && !i.deletedAt);
  }, STORAGE_KEY),
);
// close the Trash overlay we left open, then check the editor
await page.evaluate(() =>
  document.querySelector("#trashOverlay").classList.remove("open"),
);
await page.waitForTimeout(50);
// editor opens with the new Type selector populated
await page.click("#fabMain");
await page.waitForTimeout(80);
check(
  "ui: editor opens with populated Type + Project selectors",
  await page.evaluate(() => {
    const e = document.querySelector("#editor");
    const t = document.querySelector("#edType");
    const pr = document.querySelector("#edProject");
    return (
      !!e &&
      e.classList.contains("open") &&
      !!t &&
      t.options.length >= 1 &&
      !!pr &&
      pr.options.length >= 1
    );
  }),
);
await page.click("#edCancel");
await page.waitForTimeout(50);

check("ui: no uncaught errors during controls flow", pageErrors.length === 0);

/* ---- 5. Step 4: category preset mode, title prefix, Odysseus preset ---- */
const tidyDB = {
  formatVersion: 2,
  projects: [
    {
      id: "tproj",
      name: "Tidy",
      types: ["bug", "suggestion", "feedback"],
      categoryMode: "preset",
      categoryPresets: ["UI", "Backend", "Docs"],
      titleMode: "ai",
      titlePrefixOn: true,
      titlePrefixTags: ["category", "priority"],
    },
  ],
  items: [
    { id: "t1", projectIds: ["tproj"], type: "bug", title: "Crash on save", category: "Backend", priority: "critical", status: "open", createdAt: 1, updatedAt: 1, seq: 1 },
  ],
  settings: { activeProjectId: "tproj" },
};
await page.evaluate(
  ([k, v]) => localStorage.setItem(k, v),
  [STORAGE_KEY, JSON.stringify(tidyDB)],
);
pageErrors.length = 0;
await page.reload();
await page.waitForSelector("#list .card", { timeout: 10000 }).catch(() => {});

check(
  "tidy: title prefix renders category+priority tags on the board",
  /\[Backend\]\s*\[critical\]\s*Crash on save/.test(
    await page.evaluate(() => {
      const el = document.querySelector("#list .card-title");
      return el ? el.textContent || "" : "";
    }),
  ),
);

await page.evaluate(() =>
  document
    .querySelector("#list .card")
    .querySelector('[data-action="edit"]')
    .click(),
);
await page.waitForTimeout(120);
check(
  "tidy: preset category picker shown (free-text hidden) with the pool",
  await page.evaluate(() => {
    const sel = document.querySelector("#fCategorySel");
    const inp = document.querySelector("#fCategory");
    return (
      !!sel &&
      sel.style.display !== "none" &&
      !!inp &&
      inp.style.display === "none" &&
      [...sel.options].some((o) => o.value === "UI") &&
      sel.value === "Backend"
    );
  }),
);
check(
  "tidy: editor title preview reflects the prefix",
  await page.evaluate(() => {
    const tp = document.querySelector("#titlePreview");
    return !!tp && tp.style.display !== "none" && /\[Backend\]/.test(tp.textContent || "");
  }),
);
await page.click("#edCancel");
await page.waitForTimeout(50);

await page.click("#gearBtn");
await page.waitForTimeout(120);
check(
  "tidy: Odysseus preset present in the provider list",
  await page.evaluate(() => {
    const sp = document.querySelector("#sProvider");
    return (
      !!sp &&
      [...sp.options].some(
        (o) => /odysseus/i.test(o.textContent || "") || o.value === "odysseus",
      )
    );
  }),
);
check(
  "tidy: provider kind dropdown offers odysseus",
  await page.evaluate(() => {
    const k = document.querySelector("#sKind");
    return !!k && [...k.options].some((o) => o.value === "odysseus");
  }),
);
await page.evaluate(() =>
  document.querySelector("#setOverlay").classList.remove("open"),
);
check("tidy: no uncaught errors during step-4 flow", pageErrors.length === 0);

/* ---- 6. Security re-verify: XSS on the NEW project / category / type surfaces ---- */
const evil2 = 'QB2<img src=x onerror="window.__xss=1">';
const xssProjDB = {
  formatVersion: 2,
  projects: [
    {
      id: "pevil",
      name: evil2,
      types: ["bug", "suggestion", "feedback"],
      categoryMode: "preset",
      categoryPresets: [evil2],
      titlePrefixOn: true,
      titlePrefixTags: ["category", "priority"],
    },
  ],
  items: [
    { id: "e1", projectIds: ["pevil"], type: "bug", title: evil2, category: evil2, priority: "high", status: "open", createdAt: 1, updatedAt: 1, seq: 1 },
  ],
  settings: { activeProjectId: "pevil" },
};
await page.evaluate(
  ([k, v]) => localStorage.setItem(k, v),
  [STORAGE_KEY, JSON.stringify(xssProjDB)],
);
pageErrors.length = 0;
await page.reload();
await page
  .waitForSelector("#list .card, #list .empty", { timeout: 10000 })
  .catch(() => {});
await page.waitForTimeout(150);
check(
  "sec: malicious project/category did not execute on the board",
  !(await page.evaluate(() => window.__xss || 0)),
);
await page.click("#projManageBtn");
await page.waitForTimeout(120);
check(
  "sec: projects overlay (name + preset chips) did not execute payload",
  !(await page.evaluate(() => window.__xss || 0)),
);
check(
  "sec: no live onerror <img> anywhere in the document",
  (await page.evaluate(() => document.querySelectorAll("img[onerror]").length)) === 0,
);
await page.evaluate(() =>
  document.querySelector("#projOverlay").classList.remove("open"),
);
await page.evaluate(() =>
  document
    .querySelector('#list .card [data-action="edit"]')
    .click(),
);
await page.waitForTimeout(120);
check(
  "sec: editor (preset picker + type + preview) did not execute payload",
  !(await page.evaluate(() => window.__xss || 0)),
);
await page.evaluate(() =>
  document.querySelector("#editor").classList.remove("open"),
);
check("sec: no uncaught errors during security re-verify", pageErrors.length === 0);

/* ---- 7. Load robustness: valid JSON is never wiped; only true corruption hits W9 ---- */
// (a) valid JSON but garbage shape -> salvage, do NOT wipe to .bak
await page.evaluate((k) => {
  localStorage.removeItem(k + ".bak");
  localStorage.setItem(
    k,
    JSON.stringify({
      formatVersion: 1,
      items: [
        null,
        5,
        { id: "ok1", title: "survivor", priority: "weird", status: "??", projectIds: "x", type: 9, shots: "no", deletedAt: "x", createdAt: 1 },
      ],
      projects: "notarray",
      settings: { providers: "notarray" },
    }),
  );
}, STORAGE_KEY);
pageErrors.length = 0;
await page.reload();
await page.waitForSelector("#list", { timeout: 10000 }).catch(() => {});
await page.waitForTimeout(150);
check(
  "robust: valid-JSON garbage was NOT wiped to .bak",
  await page.evaluate((k) => !localStorage.getItem(k + ".bak"), STORAGE_KEY),
);
check(
  "robust: surviving item salvaged, project-assigned, fields clamped",
  await page.evaluate((k) => {
    const d = JSON.parse(localStorage.getItem(k) || "{}");
    const it = (d.items || []).find((i) => i.id === "ok1");
    return (
      !!it &&
      Array.isArray(it.projectIds) &&
      it.projectIds.length >= 1 &&
      it.priority === "medium"
    );
  }, STORAGE_KEY),
);
check(
  "robust: app still booted (project selector populated)",
  await page.evaluate(() => {
    const s = document.querySelector("#projSel");
    return !!s && s.options.length >= 1;
  }),
);

// (b) genuinely unparseable -> W9 .bak path still fires
await page.evaluate((k) => {
  localStorage.removeItem(k + ".bak");
  localStorage.setItem(k, "{not valid json,,,");
}, STORAGE_KEY);
pageErrors.length = 0;
await page.reload();
await page.waitForTimeout(150);
check(
  "robust: genuinely corrupt JSON is still preserved as .bak (W9 intact)",
  await page.evaluate((k) => !!localStorage.getItem(k + ".bak"), STORAGE_KEY),
);

/* ---- 8. Old/edge blobs migrate, never "corrupt", data preserved ---- */
const ALL_KEYS = [
  "quickbeak:db",
  "quickbeak:db.bak",
  "quickbeak:sec",
  "bugdump:db",
  "bugdump:sec",
];
async function settle() {
  await page
    .waitForSelector("#list .card, #list .empty", { timeout: 10000 })
    .catch(() => {});
  await page.waitForTimeout(150);
}
async function seedReload(pairs) {
  dialogs.length = 0;
  pageErrors.length = 0;
  await page.evaluate(
    ([keys, kv]) => {
      keys.forEach((k) => localStorage.removeItem(k));
      kv.forEach(([k, v]) => localStorage.setItem(k, v));
    },
    [ALL_KEYS, pairs],
  );
  await page.reload();
  await settle();
}

// (a) formatVersion 0, no projects, items missing type/projectIds/deletedAt
await seedReload([
  [
    "quickbeak:db",
    JSON.stringify({
      items: [{ id: "x1", title: "old item", priority: "high", status: "open" }],
    }),
  ],
]);
check(
  "edge: fv0/no-projects boots with no corrupt alert",
  corruptAlerts().length === 0 && (await page.$("#list .card")) !== null,
);
check(
  "edge: fv0 item kept, project-assigned, defaults filled",
  await page.evaluate((k) => {
    const d = JSON.parse(localStorage.getItem(k) || "{}");
    const it = (d.items || []).find((i) => i.title === "old item");
    return (
      d.formatVersion === 2 &&
      !!it &&
      it.projectIds.length >= 1 &&
      it.type === "bug" &&
      it.deletedAt === null
    );
  }, STORAGE_KEY),
);

// (b) legacy bugdump:db key is migrated to quickbeak:db
await seedReload([
  [
    "bugdump:db",
    JSON.stringify({
      formatVersion: 1,
      items: [{ id: "leg1", title: "legacy bug", priority: "low", status: "done" }],
      settings: {},
    }),
  ],
]);
check(
  "edge: legacy bugdump:db migrates with no corrupt alert",
  corruptAlerts().length === 0,
);
check(
  "edge: legacy item carried into quickbeak:db",
  await page.evaluate(
    (k) =>
      ((JSON.parse(localStorage.getItem(k) || "{}").items) || []).some(
        (i) => i.title === "legacy bug",
      ),
    STORAGE_KEY,
  ),
);

// (c) encrypted state present (sec blob + blanked provider key)
await seedReload([
  [
    "quickbeak:db",
    JSON.stringify({
      formatVersion: 2,
      projects: [{ id: "p1", name: "P", types: ["bug"] }],
      items: [{ id: "i1", projectIds: ["p1"], type: "bug", title: "enc item", priority: "high", status: "open", createdAt: 1 }],
      settings: {
        activeProjectId: "p1",
        providers: [{ id: "ollama", name: "Ollama", kind: "openai", baseUrl: "http://localhost:11434/v1", key: "", models: ["llama3.3"] }],
      },
    }),
  ],
  [
    "quickbeak:sec",
    JSON.stringify({ v: 1, salt: "AAAA", iter: 210000, iv: "AAAA", ct: "AAAA" }),
  ],
]);
check(
  "edge: encrypted state boots, no corrupt/save alert",
  corruptAlerts().length === 0 &&
    saveAlerts().length === 0 &&
    (await page.$("#list .card")) !== null,
);

// (d) malformed blob alerts ONCE then self-heals (no loop on next reload)
await seedReload([["quickbeak:db", "{bad json,,,"]]);
const firstCorrupt = corruptAlerts().length;
dialogs.length = 0;
await page.reload();
await settle();
check(
  "edge: malformed blob alerts once then self-heals (no reload loop)",
  firstCorrupt >= 1 && corruptAlerts().length === 0,
);

// (e) #reset escape hatch wipes everything and starts fresh
dialogs.length = 0;
await page.evaluate(
  (k) =>
    localStorage.setItem(
      k,
      JSON.stringify({
        formatVersion: 2,
        projects: [{ id: "p1", name: "ToWipe", types: ["bug"] }],
        items: [{ id: "i1", projectIds: ["p1"], type: "bug", title: "will be wiped", priority: "high", status: "open", createdAt: 1 }],
        settings: { activeProjectId: "p1" },
      }),
    ),
  STORAGE_KEY,
);
await page.goto(APP + "#reset");
await page.reload(); // a hash-only goto may not reload; force init to run with #reset present
await settle();
check(
  "reset: #reset wiped old data and started fresh",
  await page.evaluate(
    (k) =>
      !((JSON.parse(localStorage.getItem(k) || "{}").items) || []).some(
        (i) => i.title === "will be wiped",
      ),
    STORAGE_KEY,
  ),
);
check(
  "reset: url hash cleared after reset",
  await page.evaluate(() => location.hash === ""),
);

/* ---- 9. Blocked / sandboxed storage degrades gracefully (in-memory) ---- */
async function blockedRun(label, initScript) {
  const ctx = await browser.newContext();
  const pg = await ctx.newPage();
  const al = [];
  const er = [];
  pg.on("dialog", (d) => {
    al.push(d.message());
    d.accept();
  });
  pg.on("pageerror", (e) => er.push(String(e)));
  await pg.addInitScript(initScript);
  await pg.goto(APP);
  await pg.waitForTimeout(300);
  await pg.reload(); // mimic "every reload"
  await pg.waitForTimeout(300);
  const booted = (await pg.$("#list .card, #list .empty")) !== null;
  check(
    label + ": boots + renders, no pageerror, no corrupt alert",
    booted &&
      er.length === 0 &&
      !al.some((m) => /corrupt|couldn't be read/i.test(m)),
  );
  await ctx.close();
}
await blockedRun("blocked-write", () => {
  window.localStorage.setItem = () => {
    throw new DOMException("blocked", "SecurityError");
  };
});
await blockedRun("blocked-all", () => {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get() {
      throw new DOMException("blocked", "SecurityError");
    },
  });
});

/* ---- 10. Stats chips = multi-select status filter ---- */
const stDB = {
  formatVersion: 2,
  projects: [{ id: "sp", name: "S", types: ["bug"] }],
  items: [
    { id: "so", projectIds: ["sp"], type: "bug", title: "OPEN one", priority: "high", status: "open", createdAt: 1, updatedAt: 1, seq: 1 },
    { id: "sw", projectIds: ["sp"], type: "bug", title: "WIP one", priority: "high", status: "in progress", createdAt: 2, updatedAt: 2, seq: 2 },
    { id: "sd", projectIds: ["sp"], type: "bug", title: "DONE one", priority: "high", status: "done", createdAt: 3, updatedAt: 3, seq: 3 },
  ],
  settings: { activeProjectId: "sp" },
};
await page.evaluate(
  ([k, v]) => localStorage.setItem(k, v),
  [STORAGE_KEY, JSON.stringify(stDB)],
);
await page.reload();
await page.waitForSelector("#list .card", { timeout: 10000 }).catch(() => {});
const stTitles = () => cardTitles();
const clickStat = (s) =>
  page.evaluate((s) => {
    [...document.querySelectorAll("#stats .stat")]
      .find((b) => b.getAttribute("data-status") === s)
      .click();
  }, s);

let st = await stTitles();
check("stats: All (default) shows every status", st.length === 3);
await clickStat("open");
await page.waitForTimeout(50);
st = await stTitles();
check(
  "stats: pick Open -> only open (All deselected)",
  st.length === 1 && st[0].includes("OPEN one"),
);
await clickStat("in progress");
await page.waitForTimeout(50);
st = await stTitles();
check(
  "stats: add WIP -> open + wip (multi-select)",
  st.length === 2 &&
    st.some((x) => x.includes("OPEN one")) &&
    st.some((x) => x.includes("WIP one")),
);
await clickStat("open");
await page.waitForTimeout(50);
st = await stTitles();
check(
  "stats: toggle Open off -> only wip",
  st.length === 1 && st[0].includes("WIP one"),
);
check(
  "stats: All chip inactive while a status is selected",
  await page.evaluate(
    () =>
      !document
        .querySelector('#stats .stat[data-status=""]')
        .classList.contains("active"),
  ),
);
await clickStat("");
await page.waitForTimeout(50);
st = await stTitles();
check(
  "stats: All resets to everything",
  st.length === 3 &&
    (await page.evaluate(() =>
      document
        .querySelector('#stats .stat[data-status=""]')
        .classList.contains("active"),
    )),
);

await browser.close();
if (pageErrors.length) console.error("page errors:\n" + pageErrors.join("\n"));
console.log(failures ? "\nSMOKE FAILED (" + failures + ")" : "\nSMOKE OK");
process.exit(failures ? 1 : 0);
