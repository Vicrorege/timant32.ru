/**
 * Ingress Fingerprint & Palette Themes
 */
export const TIERS = {
  local: {
    label: 'loopback',
    primary: '#7a7a7a',
    glow: 'rgba(122, 122, 122, 0.45)',
    border: 'rgba(122, 122, 122, 0.55)',
    gradientStart: '#9a9a9a',
    gradientEnd: '#555555',
    grid: 'rgba(122, 122, 122, 0.05)',
  },
  budget: {
    label: 'budget-tld',
    primary: '#00FF00',
    glow: 'rgba(0, 255, 0, 0.5)',
    border: 'rgba(0, 255, 0, 0.4)',
    gradientStart: '#00FF99',
    gradientEnd: '#00CC33',
    grid: 'rgba(0, 255, 0, 0.04)',
  },
  commodity: {
    label: 'commodity-tld',
    primary: '#FF2E8A',
    glow: 'rgba(255, 46, 138, 0.5)',
    border: 'rgba(255, 46, 138, 0.45)',
    gradientStart: '#FF6BB5',
    gradientEnd: '#C4005C',
    grid: 'rgba(255, 46, 138, 0.045)',
  },
  mid: {
    label: 'mid-tld',
    primary: '#00E5FF',
    glow: 'rgba(0, 229, 255, 0.5)',
    border: 'rgba(0, 229, 255, 0.45)',
    gradientStart: '#66F0FF',
    gradientEnd: '#0099CC',
    grid: 'rgba(0, 229, 255, 0.045)',
  },
  premium: {
    label: 'premium-tld',
    primary: '#FFB000',
    glow: 'rgba(255, 176, 0, 0.5)',
    border: 'rgba(255, 176, 0, 0.45)',
    gradientStart: '#FFD060',
    gradientEnd: '#FF7A00',
    grid: 'rgba(255, 176, 0, 0.045)',
  },
  luxury: {
    label: 'luxury-tld',
    primary: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.45)',
    border: 'rgba(255, 215, 0, 0.55)',
    gradientStart: '#FFE680',
    gradientEnd: '#FF9900',
    grid: 'rgba(255, 215, 0, 0.05)',
  },
};

export const NAMED_THEMES = {
  green: {
    name: 'matrix green',
    primary: '#00FF00',
    glow: 'rgba(0, 255, 0, 0.5)',
    border: 'rgba(0, 255, 0, 0.4)',
    gradientStart: '#00FF99',
    gradientEnd: '#00CC33',
    grid: 'rgba(0, 255, 0, 0.04)',
  },
  amber: {
    name: 'fallout amber',
    primary: '#FFB000',
    glow: 'rgba(255, 176, 0, 0.5)',
    border: 'rgba(255, 176, 0, 0.45)',
    gradientStart: '#FFD060',
    gradientEnd: '#FF7A00',
    grid: 'rgba(255, 176, 0, 0.045)',
  },
  cyan: {
    name: 'synthwave cyan',
    primary: '#00E5FF',
    glow: 'rgba(0, 229, 255, 0.5)',
    border: 'rgba(0, 229, 255, 0.45)',
    gradientStart: '#66F0FF',
    gradientEnd: '#0099CC',
    grid: 'rgba(0, 229, 255, 0.045)',
  },
  magenta: {
    name: 'cyber magenta',
    primary: '#FF2E8A',
    glow: 'rgba(255, 46, 138, 0.5)',
    border: 'rgba(255, 46, 138, 0.45)',
    gradientStart: '#FF6BB5',
    gradientEnd: '#C4005C',
    grid: 'rgba(255, 46, 138, 0.045)',
  },
  gold: {
    name: 'luxury gold',
    primary: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.45)',
    border: 'rgba(255, 215, 0, 0.55)',
    gradientStart: '#FFE680',
    gradientEnd: '#FF9900',
    grid: 'rgba(255, 215, 0, 0.05)',
  },
  violet: {
    name: 'neon violet',
    primary: '#B347FF',
    glow: 'rgba(179, 71, 255, 0.5)',
    border: 'rgba(179, 71, 255, 0.45)',
    gradientStart: '#D187FF',
    gradientEnd: '#8800FF',
    grid: 'rgba(179, 71, 255, 0.045)',
  },
  blood: {
    name: 'crimson red',
    primary: '#FF3344',
    glow: 'rgba(255, 51, 68, 0.5)',
    border: 'rgba(255, 51, 68, 0.45)',
    gradientStart: '#FF6677',
    gradientEnd: '#CC0011',
    grid: 'rgba(255, 51, 68, 0.045)',
  },
  mono: {
    name: 'monochrome terminal',
    primary: '#9e9e9e',
    glow: 'rgba(158, 158, 158, 0.4)',
    border: 'rgba(158, 158, 158, 0.5)',
    gradientStart: '#c2c2c2',
    gradientEnd: '#666666',
    grid: 'rgba(158, 158, 158, 0.04)',
  },
};

const TLD_TIER = {
  localhost: 'local',
  local: 'local',
  lan: 'local',
  test: 'local',
  invalid: 'local',

  ru: 'budget',
  su: 'budget',
  by: 'budget',
  kz: 'budget',
  ua: 'budget',
  'xn--p1ai': 'budget', // .рф

  com: 'commodity',
  net: 'commodity',
  org: 'commodity',
  info: 'commodity',
  biz: 'commodity',
  xyz: 'commodity',
  online: 'commodity',
  site: 'commodity',
  website: 'commodity',
  fun: 'commodity',

  io: 'mid',
  dev: 'mid',
  app: 'mid',
  me: 'mid',
  co: 'mid',
  cc: 'mid',
  to: 'mid',
  is: 'mid',
  sh: 'mid',
  page: 'mid',
  tech: 'mid',
  cloud: 'mid',

  ai: 'premium',
  gg: 'premium',
  tv: 'premium',
  fm: 'premium',
  so: 'premium',
  game: 'premium',
  games: 'premium',

  luxury: 'luxury',
  museum: 'luxury',
  insurance: 'luxury',
  bond: 'luxury',
  car: 'luxury',
  cars: 'luxury',
  auto: 'luxury',
  crypto: 'luxury',
  nft: 'luxury',
  rich: 'luxury',
};

function parseHost(hostname = '') {
  const host = String(hostname).toLowerCase().replace(/\.$/, '');
  if (!host || host === 'localhost') {
    return { host: host || 'localhost', tld: 'localhost', sld: 'localhost' };
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':')) {
    return { host, tld: 'localhost', sld: host };
  }

  const parts = host.split('.').filter(Boolean);
  if (parts.length === 1) {
    return { host, tld: parts[0], sld: parts[0] };
  }

  const tld = parts[parts.length - 1];
  const sld = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  return { host, tld, sld };
}

export function resolveIngress(hostname = typeof window !== 'undefined' ? window.location.hostname : 'timant32.ru') {
  const { host, tld, sld } = parseHost(hostname);
  const tierKey = TLD_TIER[tld] || 'budget';
  let theme = TIERS[tierKey];

  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('timant32_custom_theme');
    if (custom && NAMED_THEMES[custom]) {
      theme = NAMED_THEMES[custom];
    }
  }

  return {
    host,
    tld,
    sld,
    short: sld || 'timant32',
    tier: tierKey,
    tierLabel: theme.name || theme.label || tierKey,
    theme,
  };
}

export function applyIngressTheme(ingress = resolveIngress()) {
  if (typeof document === 'undefined') return ingress;
  const root = document.documentElement;
  const { theme, host, tier, tld } = ingress;

  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--glow-color', theme.glow);
  root.style.setProperty('--border-color', theme.border);
  root.style.setProperty('--gradient-start', theme.gradientStart);
  root.style.setProperty('--gradient-end', theme.gradientEnd);
  root.style.setProperty('--grid-color', theme.grid);
  root.dataset.ingress = host;
  root.dataset.tld = tld;
  root.dataset.tldTier = tier;

  return ingress;
}

export function applyCustomTheme(themeName) {
  if (typeof window === 'undefined') return null;
  const normalized = String(themeName).toLowerCase().trim();

  if (normalized === 'default' || normalized === 'auto' || normalized === 'reset') {
    localStorage.removeItem('timant32_custom_theme');
    const ingress = resolveIngress();
    applyIngressTheme(ingress);
    return { success: true, themeName: 'auto', theme: ingress.theme };
  }

  const theme = NAMED_THEMES[normalized] || (normalized === 'matrix' ? NAMED_THEMES.green : null) || (normalized === 'fallout' ? NAMED_THEMES.amber : null) || (normalized === 'cyber' ? NAMED_THEMES.magenta : null) || (normalized === 'synthwave' ? NAMED_THEMES.cyan : null);

  if (!theme) {
    return {
      success: false,
      available: Object.keys(NAMED_THEMES),
    };
  }

  localStorage.setItem('timant32_custom_theme', normalized);
  const ingress = resolveIngress();
  ingress.theme = theme;
  ingress.tierLabel = theme.name;
  applyIngressTheme(ingress);
  return { success: true, themeName: normalized, theme };
}

export default resolveIngress;
