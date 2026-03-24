const threadPoolEnabled = false;

const totalPages = 40; // Total number of unique pages in the system
const tier1Ratio = 0.12;
const tier2Ratio = 0.16;

const tier1Size = Math.round(totalPages * tier1Ratio);
const tier2Size = Math.round(totalPages * tier2Ratio);
// const tier3Size = totalPages;
const tier3Size = totalPages - tier1Size - tier2Size; // As per original implementation, tier3 gets the remaining pages

const tier1PerRow = tier1Size;
const tier2PerRow = Math.ceil(tier2Size/2);
const tier3PerRow = Math.ceil(tier3Size/3);

const highestPageId = tier3Size - 1; // Assuming page IDs start from 0 and go up to tier3Size-1

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

async function loadHTML(id, file) {
  const el = document.getElementById(id);
  const html = await fetch(file).then(r => r.text());
  el.innerHTML = html;
}

window.addEventListener('DOMContentLoaded', () => {
  loadHTML('page-top', 'header.html');
  loadHTML('left-sidebar', 'left-sidebar.html');
  loadHTML('page-bottom', 'footer.html');
  emptyTiers();
  renderTiers(tier1, tier2, tier3, state.tiers.algorithms.length);
});