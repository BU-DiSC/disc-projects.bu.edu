const tier1Size = 4;
const tier2Size = 12;
const tier3Size = 24;

const tier1PerRow = 4;
const tier2PerRow = 6;
const tier3PerRow = 8;

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

  tier1 = Array.from({ length: tier1Size }, () =>
      createPage(randomInt(0, highestPageId))
  );

  tier2 = Array.from({ length: tier2Size }, () =>
      createPage(randomInt(0, highestPageId))
  );

  tier3 = Array.from({ length: highestPageId + 1 }, (_, i) => createPage(i));

  // Shuffle using Fisher-Yates
  for (let i = tier3.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tier3[i], tier3[j]] = [tier3[j], tier3[i]];
  }

  // Take only tier3Size pages
  tier3 = tier3.slice(0, tier3Size);
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
  renderTiers(tier1, tier2, tier3);
});