import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const GITHUB_USERNAME = 'Vicrorege';
const GH_STORAGE_KEY = 'timant32_gh_now_v2';

function formatTimeAgo(isoString) {
  if (!isoString) return '';
  const now = Date.now();
  const past = new Date(isoString).getTime();
  if (isNaN(past)) return '';
  const diffMs = Math.max(0, now - past);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 30) return `${diffDays}d`;
  return `${Math.floor(diffDays / 30)}mo`;
}

const NowActivity = ({ onOpenServerDetails }) => {
  const { t } = useTranslation();

  // 1. Last.fm track state
  const [musicState, setMusicState] = useState({
    isPlaying: false,
    track: null,
    artist: null,
    url: null,
  });

  // 2. Git activity state
  const [gitState, setGitState] = useState(() => {
    try {
      const cached = localStorage.getItem(GH_STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}
    return {
      repo: 'timant32.ru',
      repoUrl: 'https://github.com/Vicrorege/timant32.ru',
      timeAgo: 'recently',
      branch: 'master',
    };
  });

  // 3. Servers status state
  const [serverState, setServerState] = useState({
    web: 'online',
    mail: 'checking',
    mc: 'checking',
    onlineCount: 3,
    totalCount: 3,
  });

  // Poll Last.fm
  useEffect(() => {
    let cancelled = false;

    const fetchMusic = async () => {
      try {
        const res = await fetch('/api/lastfm');
        if (res.status === 204) {
          if (!cancelled) setMusicState({ isPlaying: false, track: null, artist: null, url: null });
          return;
        }
        if (!res.ok) return;

        const data = await res.json();
        const raw = data?.recenttracks?.track;
        if (!raw) return;

        const current = Array.isArray(raw) ? raw[0] : raw;
        const isPlaying = current?.['@attr']?.nowplaying === 'true';

        if (!cancelled && current?.name) {
          setMusicState({
            isPlaying,
            track: current.name,
            artist: current.artist?.['#text'] || current.artist?.name || 'Unknown',
            url: current.url || null,
          });
        }
      } catch {
        // gracefully silent
      }
    };

    fetchMusic();
    const interval = setInterval(fetchMusic, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Poll GitHub latest activity
  useEffect(() => {
    let cancelled = false;

    const fetchGit = async () => {
      try {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=8`);
        if (!res.ok) return;
        const events = await res.json();
        if (!Array.isArray(events)) return;

        const pushEvent = events.find((e) => e.type === 'PushEvent') || events[0];
        if (pushEvent?.repo?.name) {
          const repoName = pushEvent.repo.name.replace(`${GITHUB_USERNAME}/`, '');
          const next = {
            repo: repoName,
            repoUrl: `https://github.com/${pushEvent.repo.name}`,
            timeAgo: formatTimeAgo(pushEvent.created_at) || 'recently',
            branch: pushEvent.payload?.ref ? pushEvent.payload.ref.replace('refs/heads/', '') : 'master',
          };
          if (!cancelled) {
            setGitState(next);
            try {
              localStorage.setItem(GH_STORAGE_KEY, JSON.stringify(next));
            } catch {}
          }
        }
      } catch {
        // gracefully use cached
      }
    };

    fetchGit();
    const interval = setInterval(fetchGit, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Probe server nodes
  useEffect(() => {
    let cancelled = false;

    const probeServers = async () => {
      let web = 'offline';
      let mail = 'offline';
      let mc = 'offline';

      try {
        const res = await fetch('/api/status/site', { cache: 'no-store' });
        web = res.ok ? 'online' : 'offline';
      } catch {
        web = 'online'; // local server serving this very bundle
      }

      try {
        const res = await fetch('/api/status/mail', { cache: 'no-store' });
        mail = res.status > 0 && res.status < 500 ? 'online' : 'offline';
      } catch {
        mail = 'online';
      }

      try {
        const res = await fetch('/api/status/mc', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          mc = data.online ? 'online' : 'offline';
        }
      } catch {
        mc = 'online';
      }

      const list = [web, mail, mc];
      const onlineCount = list.filter((s) => s === 'online').length;

      if (!cancelled) {
        setServerState({
          web,
          mail,
          mc,
          onlineCount,
          totalCount: 3,
        });
      }
    };

    probeServers();
    const interval = setInterval(probeServers, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <section id="now" className="section-block now-section">
      <div className="section-header">
        <h2 className="section-title">{t('section_now', '02 / now')}</h2>
      </div>

      <div className="now-feed">
        {/* Line 1: Music */}
        <div className="now-feed-row">
          <span className="now-feed-label">
            <span className={`now-feed-indicator ${musicState.isPlaying ? 'pulse' : 'dim'}`}>♫</span>
          </span>
          <div className="now-feed-content">
            {musicState.isPlaying ? (
              <span className="now-music-active">
                {musicState.url ? (
                  <a
                    href={musicState.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="now-link"
                  >
                    {musicState.track}
                  </a>
                ) : (
                  <span>{musicState.track}</span>
                )}
                <span className="now-subtext"> — {musicState.artist}</span>
                <span className="now-live-tag">now playing</span>
              </span>
            ) : musicState.track ? (
              <span className="now-music-idle">
                <span>{musicState.track} — {musicState.artist}</span>
                <span className="now-subtext"> (last heard)</span>
              </span>
            ) : (
              <span className="now-music-offline">{t('now_music_idle', '♫ idle · lastfm')}</span>
            )}
          </div>
        </div>

        {/* Line 2: Git push */}
        <div className="now-feed-row">
          <span className="now-feed-label">
            <span className="now-feed-prefix">git</span>
          </span>
          <div className="now-feed-content">
            {gitState ? (
              <span>
                pushed to{' '}
                <a
                  href={gitState.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="now-link"
                >
                  {gitState.repo}
                </a>
                <span className="now-subtext"> ({gitState.branch}) · {gitState.timeAgo}</span>
              </span>
            ) : (
              <span className="now-subtext">{t('now_git_idle', 'git 0 commits today')}</span>
            )}
          </div>
        </div>

        {/* Line 3: Servers */}
        <div className="now-feed-row">
          <span className="now-feed-label">
            <span className="now-feed-prefix">srv</span>
          </span>
          <div className="now-feed-content">
            <span
              className="now-srv-status"
              onClick={onOpenServerDetails}
              role={onOpenServerDetails ? 'button' : undefined}
              title="Click to view nodes in /dev/random"
              style={{ cursor: onOpenServerDetails ? 'pointer' : 'default' }}
            >
              {serverState.onlineCount}/{serverState.totalCount} online
              <span className="now-subtext"> [timant32, mail, mc]</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NowActivity;
