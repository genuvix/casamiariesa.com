/* ─────────────────────────────────────────────────────────────────────────────
   Casa Mia Riesa — menu.js
   HostBuzz API'den menüyü çeker, tab + panel olarak render eder.
   ───────────────────────────────────────────────────────────────────────────── */

const RESTAURANT_ID = 'b6d1d7fd-8e18-476d-8179-08dedaa4501a';
const API_URL       = `https://hostbuzz.app/api/menu/${RESTAURANT_ID}`;

// Kategori → tab label haritası (DE / EN)
const CAT_LABELS = {
  'Lo Chef Consiglia':              { de: 'Chef empfiehlt',  en: "Chef's Choice" },
  'Aperitivo':                      { de: 'Aperitivo',       en: 'Aperitivo'     },
  'Antipasti':                      { de: 'Antipasti',       en: 'Starters'      },
  'Zuppa':                          { de: 'Suppen',          en: 'Soups'         },
  'Insalata':                       { de: 'Salate',          en: 'Salads'        },
  'Pizze':                          { de: 'Pizza',           en: 'Pizza'         },
  'Pasta':                          { de: 'Pasta',           en: 'Pasta'         },
  'Risotto':                        { de: 'Risotto',         en: 'Risotto'       },
  'Fleischgerichte':                { de: 'Fleisch',         en: 'Meat'          },
  'Pesce':                          { de: 'Fisch',           en: 'Fish'          },
  'Piatti per Bambini':             { de: 'Kinder',          en: 'Kids'          },
  'Dolce':                          { de: 'Desserts',        en: 'Desserts'      },
  'Alkoholfreie Getränke':          { de: 'Alkoholfrei',     en: 'Soft Drinks'   },
  'Warme Getränke':                 { de: 'Warme Getränke',  en: 'Hot Drinks'    },
  'Biere':                          { de: 'Biere',           en: 'Beers'         },
  'Longdrinks (2cl)':               { de: 'Longdrinks',      en: 'Long Drinks'   },
  'Weine – Vini Aperti':            { de: 'Weine',           en: 'Wines'         },
  'Spumante – Sekt & Spirituosen':  { de: 'Sekt & Spirits',  en: 'Sparkling & Spirits' },
};

// panel ID'si için güvenli slug
function slug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Fiyat formatlama: 6.5 → "6,50 €"
function formatPrice(p) {
  if (p == null) return '';
  return p.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

// Name'den numara ayır: "A1 Broccolicremesuppe" → { nr: "A1", name: "Broccolicremesuppe" }
function parseName(raw) {
  const m = raw.match(/^([A-Z]?\d[\d/–]*[a-zA-Z]?)\s+(.+)$/);
  return m ? { nr: m[1], name: m[2] } : { nr: '', name: raw };
}

// Mevcut lang
function getLang() {
  return document.documentElement.lang === 'en' ? 'en' : 'de';
}

// Tabs + panelleri render et
function renderMenu(categories) {
  const tabsEl   = document.querySelector('.menu-tabs');
  const panelsEl = document.querySelector('.menu-panels');
  if (!tabsEl || !panelsEl) return;

  tabsEl.innerHTML   = '';
  panelsEl.innerHTML = '';

  categories.forEach((cat, i) => {
    const id     = slug(cat.category);
    const labels = CAT_LABELS[cat.category] || { de: cat.category, en: cat.category };

    // Tab butonu
    const btn = document.createElement('button');
    btn.className   = 'menu-tab' + (i === 0 ? ' active' : '');
    btn.dataset.panel = id;
    btn.dataset.de  = labels.de;
    btn.dataset.en  = labels.en;
    btn.setAttribute('role', 'tab');
    btn.textContent = getLang() === 'en' ? labels.en : labels.de;
    tabsEl.appendChild(btn);

    // Panel
    const panel = document.createElement('div');
    panel.className = 'menu-panel' + (i === 0 ? ' active' : '');
    panel.id = 'panel-' + id;

    const itemsSorted = [...cat.items].sort((a, b) => a.sortOrder - b.sortOrder);

    itemsSorted.forEach(item => {
      const { nr, name } = parseName(item.name);
      const price = formatPrice(item.price);

      const div = document.createElement('div');
      div.className = 'menu-item';
      div.innerHTML = `
        <div class="item-body">
          <div class="item-name">
            ${nr ? `<span class="item-nr">${nr}</span>` : ''}${name}
          </div>
          ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
        </div>
        ${price ? `<div class="item-price">${price}</div>` : ''}
      `;
      panel.appendChild(div);
    });

    panelsEl.appendChild(panel);
  });

  // Tab click
  tabsEl.querySelectorAll('.menu-tab').forEach(btn => {
    btn.addEventListener('click', function () {
      tabsEl.querySelectorAll('.menu-tab').forEach(b => b.classList.remove('active'));
      panelsEl.querySelectorAll('.menu-panel').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      const panel = document.getElementById('panel-' + this.dataset.panel);
      if (panel) panel.classList.add('active');
      this.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  });
}

// Loading / error states
function setLoading(on) {
  const el = document.getElementById('menu-loading');
  if (el) el.style.display = on ? 'block' : 'none';
}
function setError(msg) {
  const el = document.getElementById('menu-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

// Fetch
async function loadMenu() {
  setLoading(true);
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderMenu(data.categories || []);
  } catch (e) {
    console.error('Menu load error:', e);
    setError('Speisekarte konnte nicht geladen werden. Bitte versuchen Sie es später erneut.');
  } finally {
    setLoading(false);
  }
}

document.addEventListener('DOMContentLoaded', loadMenu);
