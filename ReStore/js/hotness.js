// =============================================================================
// hotness.js
//
// Load order in research.html:
//   <script src="js/ui-utils.js"></script>
//   <script src="js/hotness.js"></script>
//   <script src="js/workloadGenerator.js"></script>
//   <script src="js/algorithms.js"></script>
// =============================================================================


// ─── Fixed constants ──────────────────────────────────────────────────────────

// tTemp: derived from updateTemperature(alpha=0.05, windowSize=10).
// These do not depend on workload size.
//   TEMP_MAX = 1 - 0.5/exp(0.05 * 10) = 0.6967  (max reachable temperature)
//   TEMP_MIN = 0.35  (below the 0.5 initial value so decay is always visible
//              and initial pages show amber rather than cold yellow — correct,
//              they are genuinely warm before any observation.)
const TEMP_MAX = 0.6967;
const TEMP_MIN = 0.35;

// Total unique pages — used to derive per-workload constants.
// Mirrors the value in init.js.
const TOTAL_PAGES = 40;


// ─── Workload-derived constants ───────────────────────────────────────────────
// Called once per render; results are tiny arithmetic so no caching needed.
//
// LRU_WINDOW: how many idle rounds before a page is fully cold.
//   = 2 × (N / totalPages)  — roughly two full "rounds" of equal access.
//   Floor of 10 so very short workloads still have a visible cooling range.
//
// LFU_CAP: frequency above which all pages show max-hot.
//   = 3 × (N / totalPages)  — three times the average access count.
//   Floor of 5 so even tiny workloads have a spread across the ramp.

function derivedConstants(workloadLength) {
    const avg = workloadLength / TOTAL_PAGES;
    return {
        LRU_WINDOW: Math.max(10, Math.round(2 * avg)),
        LFU_CAP:    Math.max(5,  Math.round(3 * avg)),
    };
}


// ─── 1. Per-algorithm normalised heat → [0, 1] ───────────────────────────────

function pageHeatNorm(page, algIndex, currentRound, consts) {
    if (algIndex === 0) {
        // LRU — windowed recency
        if (page.lastRequestRound === -1 || page.lastRequestRound === undefined) return 0;
        const idle = currentRound - page.lastRequestRound;
        return Math.max(0, 1 - idle / consts.LRU_WINDOW);
    }
    if (algIndex === 1) {
        // LFU — capped frequency
        return Math.min(page.frequency ?? 0, consts.LFU_CAP) / consts.LFU_CAP;
    }
    if (algIndex === 2) {
        // tTemp — remapped to [TEMP_MIN, TEMP_MAX]
        if (page.lastRequestRound === -1 || page.lastRequestRound === undefined) return 0;
        const raw = page.temperature ?? TEMP_MIN;
        return Math.max(0, Math.min(1, (raw - TEMP_MIN) / (TEMP_MAX - TEMP_MIN)));
    }
    return 0;
}


// ─── 2. Colour ramp — pale yellow → amber → orange → red ────────────────────
// t = 0.00  #fff9c4  pale yellow  (cold / never accessed)
// t = 0.35  #ffcc02  amber        (warm)
// t = 0.65  #ff7300  orange       (hot)
// t = 1.00  #d32f2f  strong red   (very hot / about to migrate)

function heatToColor(t) {
    t = Math.max(0, Math.min(1, t));

    const stops = [
        [0.00, 255, 249, 196],
        [0.35, 255, 204,   2],
        [0.65, 255, 115,   0],
        [1.00, 211,  47,  47],
    ];

    let i = 0;
    while (i < stops.length - 2 && t > stops[i + 1][0]) i++;

    const [t0, r0, g0, b0] = stops[i];
    const [t1, r1, g1, b1] = stops[i + 1];
    const u = (t - t0) / (t1 - t0);

    const r = Math.round(r0 + u * (r1 - r0));
    const g = Math.round(g0 + u * (g1 - g0));
    const b = Math.round(b0 + u * (b1 - b0));
    return `rgb(${r},${g},${b})`;
}

function heatTextColor(t) {
    return t > 0.50 ? '#fff' : '#333';
}


// ─── 3. Core repaint ──────────────────────────────────────────────────────────

function renderTierHotness(s, algIndex) {
    const currentRound    = s.p;
    const workloadLength  = s.workload.length || 1;
    const consts          = derivedConstants(workloadLength);

    const tierArrs = [
        s.tier1CurPages[algIndex],
        s.tier2CurPages[algIndex],
        s.tier3CurPages[algIndex],
    ];

    // Raw metric for migration-candidate detection — same comparison the
    // algorithm itself uses when deciding to migrate.
    function rawMetric(pg) {
        if (algIndex === 0) return pg.lastRequestRound ?? -1;
        if (algIndex === 1) return pg.frequency        ?? 0;
        if (algIndex === 2) return pg.temperature      ?? 0;
        return 0;
    }

    function extremes(arr) {
        let maxVal = -Infinity, minVal = Infinity, maxIdx = -1, minIdx = -1;
        arr.forEach((pg, i) => {
            const v = rawMetric(pg);
            if (v > maxVal) { maxVal = v; maxIdx = i; }
            if (v < minVal) { minVal = v; minIdx = i; }
        });
        return { maxVal, minVal, maxIdx, minIdx };
    }
    const ex = tierArrs.map(extremes);

    // Paint every cell
    for (let tierNo = 1; tierNo <= 3; tierNo++) {
        tierArrs[tierNo - 1].forEach((pg, i) => {
            const el = document.getElementById(`tier${tierNo}alg${algIndex}-${i}`);
            if (!el) return;
            const t = pageHeatNorm(pg, algIndex, currentRound, consts);
            el.style.backgroundColor = heatToColor(t);
            el.style.color = heatTextColor(t);
            el.classList.remove('migration-candidate', 'migration-victim');
        });
    }

    // Tier 2 hottest > Tier 1 coldest → migration imminent
    if (ex[1].maxIdx !== -1 && ex[0].minIdx !== -1 && ex[1].maxVal > ex[0].minVal) {
        const cand = document.getElementById(`tier2alg${algIndex}-${ex[1].maxIdx}`);
        const vict = document.getElementById(`tier1alg${algIndex}-${ex[0].minIdx}`);
        if (cand) cand.classList.add('migration-candidate');
        if (vict) vict.classList.add('migration-victim');
    }
    // Tier 3 hottest > Tier 2 coldest → migration imminent
    if (ex[2].maxIdx !== -1 && ex[1].minIdx !== -1 && ex[2].maxVal > ex[1].minVal) {
        const cand = document.getElementById(`tier3alg${algIndex}-${ex[2].maxIdx}`);
        const vict = document.getElementById(`tier2alg${algIndex}-${ex[1].minIdx}`);
        if (cand) cand.classList.add('migration-candidate');
        if (vict) vict.classList.add('migration-victim');
    }
}

function renderAllHotness(s) {
    for (let a = 0; a < 3; a++) renderTierHotness(s, a);
}


// ─── 4. Operation indicators ──────────────────────────────────────────────────
// Same signature as the original highlightCells() — no call sites change.
// None touch background-color — hotness owns that.

function highlightCells(cellIds, className, delay) {
    const opClass = _resolveOpClass(className);
    const ms = delay;
    cellIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove('op-read', 'op-write', 'op-migrate-src', 'op-migrate-dst');
        void el.offsetWidth;
        el.classList.add(opClass);
        setTimeout(() => el.classList.remove(opClass), ms);
    });
}

function _resolveOpClass(className) {
    switch (className) {
        case 'highlight-read':  return 'op-read';
        case 'highlight-write': return 'op-write';
        case 'highlight-from':  return 'op-migrate-src';
        case 'highlight-to':    return 'op-migrate-dst';
        default:                return 'op-read';
    }
}


// ─── 5. Wrap algoDisplay ──────────────────────────────────────────────────────

function _patchAlgoDisplay() {
    if (typeof algoDisplay !== 'function') return false;
    const _orig = algoDisplay;
    algoDisplay = function (algoIndex, s) {
        _orig(algoIndex, s);
        renderTierHotness(s, algoIndex);
    };
    return true;
}

if (!_patchAlgoDisplay()) {
    document.addEventListener('DOMContentLoaded', _patchAlgoDisplay);
}