// Sample event data – in a real deployment you would fetch latest.json
const events = [
  {
    event_id: "2025-07-25T11:17-abcd1234",
    first_seen: "2025-07-25T11:17:53+00:00",
    classes: ["military"],
    sources: [
      { publisher: "Prachatai English" }
    ],
    translated: {
      en: {
        summary: "Fighting along the Thai–Cambodian frontier prompted Thailand and Cambodia to accuse each other of starting the clash.  Prachatai reports that the UN Security Council scheduled an emergency meeting on 25 July to discuss the violence and that multiple embassies warned their citizens to avoid the disputed border.",
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
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  let hasPins = false;
  events.forEach(ev => {
    if (ev.geo && ev.geo.lat && ev.geo.lon) {
      hasPins = true;
      const marker = L.marker([ev.geo.lat, ev.geo.lon]).addTo(map);
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

// Initialise everything
renderEvents();
initTicker();
initMap();