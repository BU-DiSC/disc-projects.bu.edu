const threadPoolEnabled = false;

// tierRatioCapacities[[totalPage, [tier1%, tier2%, tier3%], [totalPage, [tier1%, tier2%, tier3%]], ...]
const tierRatioCapacities = [[44, [3, 8, 89]], [48, [3, 16, 81]], [46, [6, 9, 85]], [50, [12, 16, 72]], [51, [10, 20, 70]], [46, [9, 26, 65]]];
var tierConfig = tierRatioCapacities[5]; // Default to last (custom) configuration

var totalPages = 46; // Total number of unique pages in the system
// for video: 46
var tier1Ratio = 0.09;
var tier2Ratio = 0.26;

var tier1Size = Math.round(totalPages * tier1Ratio);
var tier2Size = Math.round(totalPages * tier2Ratio);
var tier3Size = totalPages - tier1Size - tier2Size; // As per original implementation, tier3 gets the remaining pages

var tier1PerRow = tier1Size;
var tier2PerRow = Math.ceil(tier2Size / 2);
var tier3PerRow = Math.ceil(tier3Size / 3);

var highestPageId = totalPages - 1; // Assuming page IDs start from 0 and go up to totalPages-1

const optaneSSD = [30, 1.5, 8]; // Optane
const pciSSD = [200, 2, 4]; // PCI
const sataSSD = [500, 4, 2]; // SATA
const virtualSSD = [100, 2, 8]; // Virtual
var devices = [pciSSD, sataSSD, optaneSSD, virtualSSD]

tier1 = [];
tier2 = [];
tier3 = [];

function createPage(id) {
    return {
        id: id,
        lastRequestRound: -1,
        frequency: 0,
        temperature: 0.5,
        reqRounds: []
    };
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function emptyTiers() {
    tier1 = Array.from({ length: tier1Size }, () =>
        createPage(' ')
    );

    tier2 = Array.from({ length: tier2Size }, () =>
        createPage(' ')
    );

    tier3 = Array.from({ length: tier3Size }, () =>
        createPage(' ')
    );
}

// 2. Shuffle the array using the Fisher-Yates algorithm
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Pick a random index from 0 to i
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements array[i] and array[j]
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initTiers() {
    if (fixedId === 0) {
        initTiersOriginal();
        return;
    }
    else if (fixedId === 1) {
        tier1 = Array.from({ length: tier1Fixed1.length }, (_, i) =>
            createPage(tier1Fixed1[i])
        );
        tier2 = Array.from({ length: tier2Fixed1.length }, (_, i) =>
            createPage(tier2Fixed1[i])
        );
        tier3 = Array.from({ length: tier3Fixed1.length }, (_, i) =>
            createPage(tier3Fixed1[i])
        );
        return;
    }
    else if (fixedId === 2) {
        tier1 = Array.from({ length: tier1Fixed2.length }, (_, i) =>
            createPage(tier1Fixed2[i])
        );
        tier2 = Array.from({ length: tier2Fixed2.length }, (_, i) =>
            createPage(tier2Fixed2[i])
        );
        tier3 = Array.from({ length: tier3Fixed2.length }, (_, i) =>
            createPage(tier3Fixed2[i])
        );
        return;
    }
}

function initTiersOriginal() {
    const numbers = Array.from({ length: totalPages }, (_, i) => i);
    shuffle(numbers);
    let currentId = 0;

    tier1 = Array.from({ length: tier1Size }, () =>
        createPage(numbers[currentId++])
    );
    tier2 = Array.from({ length: tier2Size }, () =>
        createPage(numbers[currentId++])
    );

    tier3 = Array.from({ length: tier3Size }, () =>
        createPage(numbers[currentId++])
    );
}

// won't work if we do with tier config because user can change tier %
// change this function later
function initTierConfig(tierConfig, algorithms) {
    totalPages = tierConfig[0]; // Total number of unique pages in the system
    highestPageId = totalPages - 1; // Assuming page IDs start from 0 and go up to totalPages-1

    tier1Ratio = tierConfig[1][0] / 100.0;
    tier2Ratio = tierConfig[1][1] / 100.0;

    tier1Size = Math.round(totalPages * tier1Ratio);
    tier2Size = Math.round(totalPages * tier2Ratio);
    tier3Size = totalPages - tier1Size - tier2Size; // As per original implementation, tier3 gets the remaining pages

    tier1PerRow = tier1Size;
    tier2PerRow = Math.ceil(tier2Size / 2);
    tier3PerRow = Math.ceil(tier3Size / 3);

    // Update the corresponding fields
    $("#topTierCapacity").val(tierConfig[1][0]);
    $("#midTierCapacity").val(tierConfig[1][1]);
    $("#bottomTierCapacity").val(tierConfig[1][2]);

    // Enable the inputs in case they were disabled
    $("#topTierCapacity").prop("disabled", false);
    $("#midTierCapacity").prop("disabled", false);

    emptyTiers();
    renderTiers(tier1, tier2, tier3, algorithms, -1);
    // Assuming 4 algorithms for now, can be dynamic based on state.tiers.algorithms.length
    // But has some bug so hardcoded it for now
}

async function loadHTML(id, file) {
    const el = document.getElementById(id);
    const html = await fetch(file).then(r => r.text());
    el.innerHTML = html;
}

function printSimulationInputs(savedTime, savedTier1, savedTier2, savedTier3, savedWorkload) {
    // convert items in savedTier1 to a list of page ids
    savedTier1 = savedTier1.map(page => page.id);
    savedTier2 = savedTier2.map(page => page.id);
    savedTier3 = savedTier3.map(page => page.id);
    console.log(`Estimated Enqueue Time (in microseconds) per Request:\n${savedTime}`);
    // add space between page ids and print in the format of [id1, id2, id3, ...]
    console.log(`Tier 1 Pages:\n[${savedTier1.join(', ')}]`);
    console.log(`Tier 2 Pages:\n[${savedTier2.join(', ')}]`);
    console.log(`Tier 3 Pages:\n[${savedTier3.join(', ')}]`);

    // print workload in the format of the savedWorkloadFixed1, i.e., list of [R/W, pageId]
    // 10 in each row and an additional newline after 10 such rows, each entry should be enclosed in [ and ]
    let workloadLines = [];
    for (let i = 0; i < savedWorkload.length; i += 10) {
        let line = savedWorkload.slice(i, i + 10).map(req => `['${req[0]}', ${req[1]}]`).join(', ');
        if (i+10 < savedWorkload.length) {
            line += ','; // add comma at the end of the line if it's not the last line
        }

        // After every 10 lines → add extra blank line
        if ((i / 10 + 1) % 10 === 0) {
            line += '\n'; // add comma at the end of the line if it's not the last line and we are adding an extra newline after this
        }
        workloadLines.push(line);
    }

    const formatted = workloadLines.join('\n');
    console.log(`Workload:\n${formatted}`);
}

window.addEventListener('DOMContentLoaded', () => {
    loadHTML('page-top', 'header.html');
    loadHTML('left-sidebar', 'left-sidebar.html');
    loadHTML('page-bottom', 'footer.html');
});