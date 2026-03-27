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
var tier2PerRow = Math.ceil(tier2Size/2);
var tier3PerRow = Math.ceil(tier3Size/3);

var highestPageId = totalPages - 1; // Assuming page IDs start from 0 and go up to totalPages-1

const pciSSD = [12.4, 3.0, 6]; // PCI
const sataSSD = [100, 1.5, 9]; // SATA
const optaneSSD = [6.8, 1.1, 5]; // Optane
const virtualSSD = [50, 2.0, 10]; // Virtual
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

function initTiers() {
  let currentId = 0;
  tier1 = Array.from({ length: tier1Size }, () =>
      createPage(currentId++)
  );
  tier2 = Array.from({ length: tier2Size }, () =>
      createPage(currentId++)
  );

  tier3 = Array.from({ length: tier3Size }, () =>
      createPage(currentId++)
  );
}

// won't work if we do with tier config because user can change tier %
// change this function later
function initTierConfig(tierConfig) {
    totalPages = tierConfig[0]; // Total number of unique pages in the system
    highestPageId = totalPages - 1; // Assuming page IDs start from 0 and go up to totalPages-1

    tier1Ratio = tierConfig[1][0] / 100.0;
    tier2Ratio = tierConfig[1][1] / 100.0;
    
    tier1Size = Math.round(totalPages * tier1Ratio);
    tier2Size = Math.round(totalPages * tier2Ratio);
    tier3Size = totalPages - tier1Size - tier2Size; // As per original implementation, tier3 gets the remaining pages
    
    tier1PerRow = tier1Size;
    tier2PerRow = Math.ceil(tier2Size/2);
    tier3PerRow = Math.ceil(tier3Size/3);

    // Update the corresponding fields
    $("#topTierCapacity").val(tierConfig[1][0]);
    $("#midTierCapacity").val(tierConfig[1][1]);
    $("#bottomTierCapacity").val(tierConfig[1][2]);

    // Enable the inputs in case they were disabled
    $("#topTierCapacity").prop("disabled", false);
    $("#midTierCapacity").prop("disabled", false);

    emptyTiers();
    renderTiers(tier1, tier2, tier3, 4);
    // Assuming 4 algorithms for now, can be dynamic based on state.tiers.algorithms.length
    // But has some bug so hardcoded it for now
}

async function loadHTML(id, file) {
  const el = document.getElementById(id);
  const html = await fetch(file).then(r => r.text());
  el.innerHTML = html;
}

window.addEventListener('DOMContentLoaded', () => {
  loadHTML('page-top', 'header.html');
  loadHTML('left-sidebar', 'left-sidebar.html');
  loadHTML('page-bottom', 'footer.html');
});