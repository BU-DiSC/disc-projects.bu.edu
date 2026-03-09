function renderTiers(tier1, tier2, tier3) {
    renderTier(1, "tier1alg0", tier1);
    renderTier(2, "tier2alg0", tier2);
    renderTier(3, "tier3alg0", tier3);

    renderTier(1, "tier1alg1", tier1);
    renderTier(2, "tier2alg1", tier2);
    renderTier(3, "tier3alg1", tier3);

    renderTier(1, "tier1alg2", tier1);
    renderTier(2, "tier2alg2", tier2);
    renderTier(3, "tier3alg2", tier3);
}

function renderUpdatedTiers(fromTier, toTier, fromPos, toPos, algNo) {
    const from = `tier${fromTier}alg${algNo}-${fromPos}`;
    const to = `tier${toTier}alg${algNo}-${toPos}`;
    // swap the text in fromEl and toEl
    const fromEl = document.getElementById(from);
    const toEl = document.getElementById(to);
    const fromText = fromEl.textContent;
    const toText = toEl.textContent;
    fromEl.textContent = toText;
    toEl.textContent = fromText;
}

function renderTier(tierNo, id, arr) {
    const container = document.getElementById(id);
    container.innerHTML = "";

    // Decide how many per row
    let perRow;
    if (tierNo === 1) perRow = tier1PerRow;
    else if (tierNo === 2) perRow = tier2PerRow;
    else if (tierNo === 3) perRow = tier3PerRow;

    // Apply grid layout
    container.style.display = "grid";
    container.style.gridTemplateColumns = `repeat(${perRow}, 20px)`;
    container.style.gap = "0px";

    arr.forEach((page, i) => {
        const div = document.createElement("div");
        div.className = "cell";
        div.textContent = page.id;
        div.id = `${id}-${i}`;
        container.appendChild(div);
    });
}

function highlightCells(cells, className, delay) {
    cells.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        el.classList.add(className);

        // auto remove highlight
        setTimeout(() => {
            el.classList.remove(className);
        }, delay);
    });
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}