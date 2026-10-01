/**
 * Centralized Dual Identity Resolver & Configuration
 *
 * One person, one digital environment, two entry points:
 * - vicrorege: current / public / dev / project identity (vicrorege.com)
 * - timant32:  legacy / old home / nostalgic identity (timant32.ru)
 */

export const IDENTITIES = {
  vicrorege: {
    id: 'vicrorege',
    role: 'current',
    brand: 'Vicrorege',
    heroTitle: 'vicrorege.',
    heroSubtitle: 'aka tim / timant32',
    domain: 'vicrorege.com',
    altDomain: 'timant32.ru',
    altBadgeText: {
      ru: 'старый интернет-дом → timant32.ru',
      en: 'legacy digital home → timant32.ru',
    },
    tagline: {
      ru: 'делаю ботов, сервисы и всякие свои штуки.',
      en: 'building bots, services, and digital experiments.',
    },
    subtagline: {
      ru: 'linux · self-hosting · иногда фронтенд',
      en: 'linux · self-hosting · occasional frontend',
    },
    statusText: {
      ru: 'systems nominal',
      en: 'systems nominal',
    },
    links: {
      email: 'me@vicrorege.com',
      telegram: 'https://t.me/vicrorege',
      telegramHandle: '@vicrorege',
      telegramLegacy: '@tim_ant32',
      telegramLegacyUrl: 'https://t.me/tim_ant32',
      github: 'https://github.com/Vicrorege',
      githubHandle: 'Vicrorege',
    },
    appearance: {
      defaultTheme: 'magenta',
      accentColor: '#FF2E8A',
      secondaryColor: '#FF6BB5',
      badgeClass: 'identity-current',
    },
    metadata: {
      ru: {
        title: 'vicrorege. — personal terminal',
        description: 'делаю ботов, сервисы и всякие свои штуки. linux · self-hosting · web',
      },
      en: {
        title: 'vicrorege. — personal terminal',
        description: 'building bots, services, and digital experiments. linux · self-hosting · web',
      },
    },
  },
  timant32: {
    id: 'timant32',
    role: 'legacy',
    brand: 'timant32',
    heroTitle: 'я тимант.',
    heroSubtitle: 'aka tim / vicrorege',
    domain: 'timant32.ru',
    altDomain: 'vicrorege.com',
    altBadgeText: {
      ru: 'current identity → vicrorege.com',
      en: 'current identity → vicrorege.com',
    },
    tagline: {
      ru: 'старый интернет-дом. боты, сервисы и самодельный софт.',
      en: 'old internet home. bots, services, and homemade tools.',
    },
    subtagline: {
      ru: 'linux · self-hosting · matrix · terminal',
      en: 'linux · self-hosting · matrix · terminal',
    },
    statusText: {
      ru: 'legacy node online',
      en: 'legacy node online',
    },
    links: {
      email: 'me@timant32.ru',
      telegram: 'https://t.me/tim_ant32',
      telegramHandle: '@tim_ant32',
      telegramCurrent: '@vicrorege',
      telegramCurrentUrl: 'https://t.me/vicrorege',
      github: 'https://github.com/Vicrorege',
      githubHandle: 'Vicrorege',
    },
    appearance: {
      defaultTheme: 'green',
      accentColor: '#00FF00',
      secondaryColor: '#00FF99',
      badgeClass: 'identity-legacy',
    },
    metadata: {
      ru: {
        title: 'я тимант. — старый дом',
        description: 'старый интернет-дом тиманта. боты, сервисы, linux, terminal.',
      },
      en: {
        title: "i'm timant32. — old home",
        description: 'old digital home of timant32. bots, services, linux, terminal.',
      },
    },
  },
};

/**
 * Resolves active identity based on hostname, query params, or session override.
 */
export function resolveIdentity(rawHostname) {
  // Query param override (?identity=vicrorege or ?identity=timant32)
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get('identity');
      if (queryId && IDENTITIES[queryId]) {
        return IDENTITIES[queryId];
      }
      const override = sessionStorage.getItem('timant32_identity_override');
      if (override && IDENTITIES[override]) {
        return IDENTITIES[override];
      }
    } catch {
      // ignore storage / URL errors
    }
  }

  let host = String(rawHostname || '').toLowerCase().trim();
  if (!host && typeof window !== 'undefined') {
    host = window.location.hostname.toLowerCase().trim();
  }

  // Strip protocol and port
  host = host.replace(/^https?:\/\//, '').split('/')[0].split(':')[0].replace(/\.$/, '');

  if (host.includes('vicrorege')) {
    return IDENTITIES.vicrorege;
  }
  if (host.includes('timant') || host.endsWith('.ru') || host.endsWith('.su')) {
    return IDENTITIES.timant32;
  }

  // On localhost, IP, or other ingress, default to vicrorege (current identity)
  return IDENTITIES.vicrorege;
}

/**
 * Sets session override for previewing the other identity in-browser.
 */
export function setIdentityOverride(identityId) {
  if (typeof window === 'undefined') return;
  if (!identityId || identityId === 'auto' || identityId === 'reset') {
    sessionStorage.removeItem('timant32_identity_override');
  } else if (IDENTITIES[identityId]) {
    sessionStorage.setItem('timant32_identity_override', identityId);
  }
}

/**
 * Updates DOM metadata (title, meta description, og tags, canonical, theme-color).
 */
export function applyIdentityMetadata(identity, language = 'ru') {
  if (typeof document === 'undefined') return;
  const langKey = language?.startsWith('ru') ? 'ru' : 'en';
  const meta = identity.metadata[langKey] || identity.metadata.ru;

  document.title = meta.title;

  const setMeta = (attrKey, attrVal, content) => {
    let el = document.querySelector(`meta[${attrKey}="${attrVal}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrKey, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('name', 'description', meta.description);
  setMeta('property', 'og:title', meta.title);
  setMeta('property', 'og:description', meta.description);
  setMeta('property', 'og:url', `https://${identity.domain}`);
  setMeta('property', 'og:site_name', identity.brand);
  setMeta('name', 'twitter:title', meta.title);
  setMeta('name', 'twitter:description', meta.description);
  setMeta('name', 'theme-color', identity.appearance.accentColor);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', `https://${identity.domain}`);
}
