function renderTiers(tier1, tier2, tier3, algorithms, currentRound) {
    var tooltipText = "Page Property";
    for (let algNo = 0; algNo < algorithms.length; algNo++) {
        if (algorithms[algNo] === null) continue; // skip rendering for null
        renderTier(1, `tier1alg${algNo}`, tier1);
        renderTier(2, `tier2alg${algNo}`, tier2);
        renderTier(3, `tier3alg${algNo}`, tier3);
        renderTemperature(tier1, tier2, tier3, algorithms, algNo, currentRound);
    }
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

function renderTemperature(tier1, tier2, tier3, algorithms, algNo, currentRound) {
    var hotness = 0;
    var hotnessDenominator = 100;   // hardcoded for now, can be dynamically adjusted based on workload size or page count?
    const algorithmName = algorithms[algNo].name;
    var tooltipSuffix = "";

    if (currentRound < 0) {
        return;
    }
    else if (currentRound > totalPages/2 && algorithmName === "tLFU") {
        // hotnessDenominator = 100;
        tier1.forEach(page => { if (page.frequency > hotnessDenominator) hotnessDenominator = page.frequency; });
        tier2.forEach(page => { if (page.frequency > hotnessDenominator) hotnessDenominator = page.frequency; });
        tier3.forEach(page => { if (page.frequency > hotnessDenominator) hotnessDenominator = page.frequency; });
    }

    var tooltipPrefix = "Page Property: ";
    if (algorithmName === "tLRU") {
        tooltipPrefix = "Last Request Round: ";
    }
    else if (algorithmName === "tLFU") {
        tooltipPrefix = "Frequency: ";
    }
    else if (algorithmName === "TEMP") {
        tooltipPrefix = "Temperature: ";
    }
    else if (algorithmName === "ReStore") {
        tooltipPrefix = "Temperature: ";
    }

    function applyHeatToTier(tierArr, tierNo) {
        tierArr.forEach((page, i) => {
            if (algorithmName === "tLRU") {
                tooltipSuffix = `${page.lastRequestRound}`;
                if (currentRound - page.lastRequestRound > hotnessDenominator) {
                    hotness = 0; // if the page hasn't been accessed for a long time, consider it cold
                }
                else if (currentRound < hotnessDenominator) {
                    hotness = 1 - (hotnessDenominator - page.lastRequestRound) / hotnessDenominator;
                }
                else {
                    hotness = 1 - (currentRound - page.lastRequestRound) / hotnessDenominator;
                }
            } else if (algorithmName === "tLFU") {
                tooltipSuffix = `${page.frequency}`;
                hotness = page.frequency / hotnessDenominator;
            } else if (algorithmName === "TEMP" || algorithmName === "ReStore") {
                tooltipSuffix = `${page.temperature.toFixed(2)}`;
                hotness = page.temperature;
                // if (page.id === 42 || page.id === 26 || page.id === 15 || page.id === 21) {
                //     console.log(`Page ${page.id} temperature ${page.temperature} in algorithm ${algorithmName} at round ${currentRound}`);
                // }
            }

            hotness = Math.max(0, Math.min(1, hotness)); // clamp to [0, 1]

            const r = Math.round(255);
            const g = Math.round(250 - 180 * hotness);
            const b = Math.round(150 - 150 * hotness);

            const el = document.getElementById(`tier${tierNo}alg${algNo}-${i}`);
            if (el){
                el.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
                // update tooltip
                el.setAttribute("title", `${tooltipPrefix}${tooltipSuffix}`);
            }
        });
    }

    applyHeatToTier(tier1, 1);
    applyHeatToTier(tier2, 2);
    applyHeatToTier(tier3, 3);
}

function renderTier(tierNo, id, arr) {
    // console.log(id);
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
        div.setAttribute("data-toggle", "tooltip");
        div.setAttribute("data-placement", "left");
        container.appendChild(div);
    });
}

function highlightCells(cells, className, delay) {
    cells.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        // console.log(`Adding ${className} to ${id} for ${delay}ms`);
        el.classList.add(className);

        // auto remove highlight
        setTimeout(() => {
            // console.log(`Removing ${className} from ${id}`);
            el.classList.remove(className);
        }, delay);
    });
}

function asyncSleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function sleep(ms) {
    setTimeout(() => {
        // Do nothing
    }, ms);
}