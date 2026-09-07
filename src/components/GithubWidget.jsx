import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const GITHUB_USERNAME = 'Vicrorege';
const STORAGE_KEY = 'timant32_gh_cache_v1';
const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const DEFAULT_STATS = {
  username: GITHUB_USERNAME,
  publicRepos: 7,
  followers: 4,
  yearContributions: 340,
  latestRepo: 'schedule2cal',
  latestRepoUrl: 'https://github.com/Vicrorege/schedule2cal',
  latestPushTime: '2026-09-07T17:45:32Z',
  contributions: [],
};

function formatTimeAgo(isoString, t) {
  if (!isoString) return '';
  const now = Date.now();
  const past = new Date(isoString).getTime();
  if (isNaN(past)) return '';
  const diffMs = Math.max(0, now - past);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return t('github_just_now', 'just now');
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return t('github_yesterday', 'yesterday');
  if (diffDays < 30) return `${diffDays}d`;
  return `${Math.floor(diffDays / 30)}mo`;
}

const GithubWidget = () => {
  const { t } = useTranslation();

  const [stats, setStats] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_STATS, ...parsed };
        }
      }
    } catch {
      // ignore localStorage errors
    }
    return DEFAULT_STATS;
  });

  useEffect(() => {
    let cancelled = false;

    const fetchGitHubData = async () => {
      try {
        const [userRes, eventsRes, contribRes] = await Promise.allSettled([
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}`).then((r) => {
            if (!r.ok) throw new Error(`User HTTP ${r.status}`);
            return r.json();
          }),
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=10`).then((r) => {
            if (!r.ok) throw new Error(`Events HTTP ${r.status}`);
            return r.json();
          }),
          fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`).then((r) => {
            if (!r.ok) throw new Error(`Contrib HTTP ${r.status}`);
            return r.json();
          }),
        ]);

        const next = { ...stats };

        if (userRes.status === 'fulfilled' && userRes.value) {
          const u = userRes.value;
          if (typeof u.public_repos === 'number') next.publicRepos = u.public_repos;
          if (typeof u.followers === 'number') next.followers = u.followers;
        }

        if (eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value)) {
          const pushEvent = eventsRes.value.find((e) => e.type === 'PushEvent') || eventsRes.value[0];
          if (pushEvent?.repo?.name) {
            next.latestRepo = pushEvent.repo.name;
            next.latestRepoUrl = `https://github.com/${pushEvent.repo.name}`;
            next.latestPushTime = pushEvent.created_at || null;
          }
        }

        if (contribRes.status === 'fulfilled' && contribRes.value) {
          const c = contribRes.value;
          if (typeof c.total?.lastYear === 'number') {
            next.yearContributions = c.total.lastYear;
          }
          if (Array.isArray(c.contributions)) {
            next.contributions = c.contributions;
          }
        }

        if (!cancelled) {
          setStats(next);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.warn('[github] fetch failed', err);
      }
    };

    fetchGitHubData();
    const interval = setInterval(fetchGitHubData, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Prepare recent 16 weeks (112 days) of contributions for the mini heatmap
  const recentDays = useMemo(() => {
    const WEEKS = 16;
    const targetCount = WEEKS * 7;
    const all = stats.contributions || [];
    if (all.length >= targetCount) {
      return all.slice(-targetCount);
    }
    // If not loaded yet, generate subtle placeholders
    const placeholder = [];
    const now = new Date();
    for (let i = targetCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      placeholder.push({
        date: d.toISOString().slice(0, 10),
        count: 0,
        level: 0,
      });
    }
    return placeholder;
  }, [stats.contributions]);

  const shortRepoName = useMemo(() => {
    if (!stats.latestRepo) return 'schedule2cal';
    const parts = stats.latestRepo.split('/');
    return parts[parts.length - 1];
  }, [stats.latestRepo]);

  const timeAgoText = useMemo(() => {
    return formatTimeAgo(stats.latestPushTime, t);
  }, [stats.latestPushTime, t]);

  return (
    <div className="WidgetContainer GithubWidget" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div className="gh-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="gh-badge">🐙</span>
          <span className="gh-title">{t('github', 'GITHUB')}</span>
        </div>
        <a
          href={`https://github.com/${GITHUB_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="gh-user-link"
          title={`github.com/${GITHUB_USERNAME}`}
        >
          @{GITHUB_USERNAME}
          <span className="gh-arrow">↗</span>
        </a>
      </div>

      <div className="WidgetContent" style={{ width: '100%' }}>
        {/* Metric summary boxes */}
        <div className="gh-metrics-grid">
          <div className="gh-metric-card">
            <span className="gh-metric-label">{t('github_repos', 'REPOS')}</span>
            <span className="gh-metric-value">{stats.publicRepos}</span>
          </div>
          <div className="gh-metric-card">
            <span className="gh-metric-label">{t('github_contribs', 'COMMITS')}</span>
            <span className="gh-metric-value">{stats.yearContributions}</span>
          </div>
          <div className="gh-metric-card">
            <span className="gh-metric-label">{t('github_followers', 'FOLLOWERS')}</span>
            <span className="gh-metric-value">{stats.followers}</span>
          </div>
        </div>

        {/* Latest active repo row */}
        {shortRepoName && (
          <div className="gh-latest-row">
            <span className="gh-latest-label">{t('github_latest', 'LATEST')}:</span>
            <a
              href={stats.latestRepoUrl || `https://github.com/${GITHUB_USERNAME}/${shortRepoName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="gh-latest-link"
              title={stats.latestRepo}
            >
              {shortRepoName}
            </a>
            {timeAgoText && <span className="gh-latest-time">({timeAgoText})</span>}
          </div>
        )}

        {/* Contribution mini heatmap */}
        <div className="gh-heatmap-wrapper">
          <div className="gh-heatmap-grid">
            {recentDays.map((day, idx) => (
              <div
                key={day.date || idx}
                className={`gh-cell gh-level-${day.level || 0}`}
                title={`${day.date}: ${day.count} ${t('github_contrib_count', 'contribs')}`}
              />
            ))}
          </div>

          <div className="gh-heatmap-footer">
            <span className="gh-footer-text">
              {stats.yearContributions} {t('github_in_last_year', 'contribs in last year')}
            </span>
            <div className="gh-legend">
              <span className="gh-legend-label">{t('github_less', 'less')}</span>
              <span className="gh-cell gh-level-0 gh-legend-cell" />
              <span className="gh-cell gh-level-1 gh-legend-cell" />
              <span className="gh-cell gh-level-2 gh-legend-cell" />
              <span className="gh-cell gh-level-3 gh-legend-cell" />
              <span className="gh-cell gh-level-4 gh-legend-cell" />
              <span className="gh-legend-label">{t('github_more', 'more')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GithubWidget;
