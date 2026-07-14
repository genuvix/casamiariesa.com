/* ─────────────────────────────────────────────────────────────────────────────
   Casa Mia Riesa — menu.js
   HostBuzz API'den menüyü çeker, tab + panel olarak render eder.
   ───────────────────────────────────────────────────────────────────────────── */

const RESTAURANT_ID = 'b6d1d7fd-8e18-476d-8179-08dedaa4501a';
const API_URL       = `https://hostbuzz.app/api/menu/${RESTAURANT_ID}`;

// Sabit kategori sırası (menü kartındaki sıra)
const CAT_ORDER = [
  'Lo Chef Consiglia',
  'Aperitivo',
  'Antipasti',
  'Zuppa',
  'Insalata',
  'Pizze',
  'Pasta',
  'Risotto',
  'Fleischgerichte',
  'Pesce',
  'Piatti per Bambini',
  'Dolce',
  'Alkoholfreie Getränke',
  'Warme Getränke',
  'Biere',
  'Longdrinks (2cl)',
  'Weine – Vini Aperti',
  'Spumante – Sekt & Spirituosen',
];

// Tab label haritası
const CAT_LABELS = {
  'Lo Chef Consiglia':              { de: 'Chef empfiehlt',       en: "Chef's Choice"          },
  'Aperitivo':                      { de: 'Aperitivo',            en: 'Aperitivo'               },
  'Antipasti':                      { de: 'Antipasti',            en: 'Starters'                },
  'Zuppa':                          { de: 'Suppen',               en: 'Soups'                   },
  'Insalata':                       { de: 'Salate',               en: 'Salads'                  },
  'Pizze':                          { de: 'Pizza',                en: 'Pizza'                   },
  'Pasta':                          { de: 'Pasta',                en: 'Pasta'                   },
  'Risotto':                        { de: 'Risotto',              en: 'Risotto'                 },
  'Fleischgerichte':                { de: 'Fleisch',              en: 'Meat'                    },
  'Pesce':                          { de: 'Fisch',                en: 'Fish'                    },
  'Piatti per Bambini':             { de: 'Kinder',               en: 'Kids'                    },
  'Dolce':                          { de: 'Desserts',             en: 'Desserts'                },
  'Alkoholfreie Getränke':          { de: 'Alkoholfrei',          en: 'Soft Drinks'             },
  'Warme Getränke':                 { de: 'Warme Getränke',       en: 'Hot Drinks'              },
  'Biere':                          { de: 'Biere',                en: 'Beers'                   },
  'Longdrinks (2cl)':               { de: 'Longdrinks',           en: 'Long Drinks'             },
  'Weine – Vini Aperti':            { de: 'Weine',                en: 'Wines'                   },
  'Spumante – Sekt & Spirituosen':  { de: 'Sekt & Spirits',       en: 'Sparkling & Spirits'     },
};

function slug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function formatPrice(p) {
  if (p == null) return '';
  return p.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '\u00a0€';
}

function parseName(raw) {
  const m = raw.match(/^([A-Z]?\d[\d/–]*[a-zA-Z]?)\s+(.+)$/);
  return m ? { nr: m[1], name: m[2] } : { nr: '', name: raw };
}

function getLang() {
  return document.documentElement.lang === 'en' ? 'en' : 'de';
}

function renderMenu(categories) {
  const tabsEl   = document.querySelector('.menu-tabs');
  const panelsEl = document.querySelector('.menu-panels');
  if (!tabsEl || !panelsEl) return;

  // API'den gelen kategorileri map'e al
  const catMap = {};
  categories.forEach(c => { catMap[c.category] = c; });

  // Sabit sıraya göre sırala, API'de olmayan kategorileri atla
  const ordered = CAT_ORDER.map(name => catMap[name]).filter(Boolean);
  // API'de olup listede olmayanları sona ekle
  categories.forEach(c => {
    if (!CAT_ORDER.includes(c.category)) ordered.push(c);
  });

  tabsEl.innerHTML   = '';
  panelsEl.innerHTML = '';

  ordered.forEach((cat, i) => {
    const id     = slug(cat.category);
    const labels = CAT_LABELS[cat.category] || { de: cat.category, en: cat.category };
    const lang   = getLang();

    // Tab
    const btn = document.createElement('button');
    btn.className     = 'menu-tab' + (i === 0 ? ' active' : '');
    btn.dataset.panel = id;
    btn.dataset.de    = labels.de;
    btn.dataset.en    = labels.en;
    btn.setAttribute('role', 'tab');
    btn.textContent = lang === 'en' ? labels.en : labels.de;
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
      div.innerHTML =
        '<div class="item-body">' +
          '<div class="item-name">' +
            (nr ? '<span class="item-nr">' + nr + '</span>' : '') +
            name +
          '</div>' +
          (item.description ? '<div class="item-desc">' + item.description + '</div>' : '') +
        '</div>' +
        (price ? '<div class="item-price">' + price + '</div>' : '');
      panel.appendChild(div);
    });

    panelsEl.appendChild(panel);
  });

  // Tab click
  tabsEl.querySelectorAll('.menu-tab').forEach(function(btn) {
    btn.addEventListener('click', function() {
      tabsEl.querySelectorAll('.menu-tab').forEach(function(b){ b.classList.remove('active'); });
      panelsEl.querySelectorAll('.menu-panel').forEach(function(p){ p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = document.getElementById('panel-' + btn.dataset.panel);
      if (panel) panel.classList.add('active');
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  });
}

function setLoading(on) {
  var el = document.getElementById('menu-loading');
  if (el) el.style.display = on ? 'block' : 'none';
}

function setError(msg) {
  var el = document.getElementById('menu-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

async function loadMenu() {
  setLoading(true);
  try {
    var res = await fetch(API_URL);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    var data = await res.json();
    renderMenu(data.categories || []);
  } catch(e) {
    console.error('Menu load error:', e);
    setError('Speisekarte konnte nicht geladen werden. Bitte versuchen Sie es später erneut.');
  } finally {
    setLoading(false);
  }
}

document.addEventListener('DOMContentLoaded', loadMenu);
