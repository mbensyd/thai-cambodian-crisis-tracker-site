// Define a place to store events; will be loaded from the latest.json file.
let events = [];

// URL of the latest event feed hosted on GitHub. Adjust owner/repo if you fork.
const DATA_URL = 'https://raw.githubusercontent.com/mbensyd/thai-cambodian-crisis-tracker-site/main/data/latest.json';

// Fallback sample events used if fetch fails.
const sampleEvents = [
  {
    event_id: "2025-07-25T11:17-abcd1234",
    first_seen: "2025-07-25T11:17:53+00:00",
    classes: ["military"],
    sources: [
      { publisher: "Prachatai English" }
    ],
    translated: {
      en: {
        summary: "Fighting along the Thai–Cambodian frontier prompted Thailand and Cambodia to accuse each other of starting the clash. Prachatai reports that the UN Security Council scheduled an emergency meeting on 25 July to discuss the violence and that multiple embassies warned their citizens to avoid the disputed border.",
        context: "Reported by a mainstream independent outlet."
      }
    },
    rating: { stars: 3, rationale: "Single mainstream source; limited corroboration" }
  },
  {
    event_id: "2025-07-25T11:00-efgh5678",
    first_seen: "2025-07-25T11:00:09+00:00",
    classes: ["official statement"],
    sources: [ { publisher: "Khmer Times" } ],
    translated: {
      en: {
        summary: "Cambodian legal firm SK Law Office condemned a social‑media message by former Thai prime minister Thaksin Shinawatra that rejected mediation efforts and called for Thailand’s military to ‘teach Phnom Penh a lesson’; it warned the remark undermines dialogue.",
        context: "Single press release from the Cambodian side."
      }
    },
    rating: { stars: 3, rationale: "Single mainstream source; limited corroboration" }
  },
  {
    event_id: "2025-07-25T11:48-ijkl9012",
    first_seen: "2025-07-25T11:48:30+00:00",
    classes: ["border closure"],
    sources: [ { publisher: "r/Cambodia" } ],
    translated: {
      en: {
        summary: "A Reddit travel thread advises that, amid fighting along the Thai–Cambodian frontier, all land borders between the two countries are closed but air links and land crossings with Laos and Vietnam operate normally; travellers are urged to verify information and exercise common sense.",
        context: "User‑generated advisory; not independently verified."
      }
    },
    rating: { stars: 2, rationale: "Single social media source; unverified" }
  }
];

// Mapping of classes to emoji
const classEmoji = {
  military: '⚔️',
  'border closure': '🛂',
  'official statement': '📃',
  civil: '🧑‍🤝‍🧑',
  'info-ops': '🕵️',
  political: '🗳️'
};

function renderEvents() {
  const container = document.getElementById('event-list');
  container.innerHTML = '';
  events.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'event-card';
    const emoji = classEmoji[ev.classes[0]] || '';
    card.innerHTML = `
      <h3>${emoji} ${ev.translated.en.summary}</h3>
      <div class="event-meta">
        <div><strong>Class:</strong> ${ev.classes.join(', ')}</div>
        <div><strong>First seen:</strong> ${ev.first_seen}</div>
        <div><strong>Sources:</strong> ${ev.sources.map(s => s.publisher).join(', ')}</div>
      </div>
      <div class="rating">Reliability: ${'★'.repeat(ev.rating.stars)} (${ev.rating.rationale})</div>
      <div>${ev.translated.en.context}</div>
    `;
    container.appendChild(card);
  });
}

function initTicker() {
  const ticker = document.getElementById('ticker');
  let idx = 0;
  function updateTicker() {
    if (events.length === 0) return;
    const ev = events[idx % events.length];
    const emoji = classEmoji[ev.classes[0]] || '';
    ticker.textContent = `${emoji} ${ev.translated.en.summary}`;
    idx++;
  }
  updateTicker();
  setInterval(updateTicker, 8000);
}

function initMap() {
  const map = L.map('map').setView([14.6, 103.0], 5); // centre on Thailand/Cambodia
  // Use a dark-themed tile layer reminiscent of a Defcon-style map
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors, © CartoDB'
  }).addTo(map);
  let hasPins = false;
  events.forEach(ev => {
    if (ev.geo && ev.geo.lat != null && ev.geo.lon != null) {
      hasPins = true;
      // Draw a glowing circle marker instead of the default icon
      const marker = L.circleMarker([ev.geo.lat, ev.geo.lon], {
        radius: 6,
        color: '#f5cb5c',
        weight: 2,
        fillColor: '#f5cb5c',
        fillOpacity: 0.8
      }).addTo(map);
      marker.bindPopup(`<strong>${ev.translated.en.summary}</strong><br>${ev.classes.join(', ')}`);
    }
  });
  if (!hasPins) {
    const notice = L.control({ position: 'bottomright' });
    notice.onAdd = function () {
      const div = L.DomUtil.create('div');
      div.style.padding = '0.5rem';
      div.style.background = 'rgba(0,0,0,0.5)';
      div.style.color = '#fff';
      div.style.fontSize = '0.9rem';
      div.innerHTML = 'No geocoded events available.';
      return div;
    };
    notice.addTo(map);
  }
}

// Compute and render a simple summary of events
function renderSummary() {
  const container = document.getElementById('summary-section');
  if (!container) return;
  const total = events.length;
  const counts = {};
  let ratingSum = 0;
  events.forEach(ev => {
    ratingSum += (ev.rating?.stars || 0);
    ev.classes.forEach(cls => {
      counts[cls] = (counts[cls] || 0) + 1;
    });
  });
  const avgRating = total ? (ratingSum / total).toFixed(1) : 'N/A';
  let html = '';
  html += `<p><strong>Total events:</strong> ${total}</p>`;
  html += '<p><strong>Events by type:</strong></p>';
  html += '<ul>';
  Object.keys(counts).forEach(cls => {
    html += `<li>${cls}: ${counts[cls]}</li>`;
  });
  html += '</ul>';
  html += `<p><strong>Average reliability:</strong> ${avgRating} / 5</p>`;
  container.innerHTML = '<h2>Summary</h2>' + html;
}

// Load events from the remote JSON file and initialise the UI
async function loadData() {
  try {
    const response = await fetch(DATA_URL);
    if (response.ok) {
      events = await response.json();
    } else {
      console.warn('Failed to fetch remote events; using sample data');
      events = sampleEvents;
    }
  } catch (err) {
    console.warn('Error loading events:', err);
    events = sampleEvents;
  }
  renderEvents();
  initTicker();
  initMap();
  renderSummary();
}

// Initialise everything by loading data
loadData();