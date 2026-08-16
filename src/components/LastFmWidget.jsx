import React, { useState, useEffect } from 'react';

const LastFmWidget = () => {
  const [track, setTrack] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchTrack = async () => {
      try {
        const response = await fetch('/api/lastfm');
        if (response.status === 204) {
          if (!cancelled) setTrack(null);
          return;
        }
        if (!response.ok) {
          console.warn('[lastfm] upstream HTTP', response.status);
          return;
        }

        const data = await response.json();
        if (data?.error) {
          console.warn('[lastfm]', data.message || data.error);
          return;
        }

        const raw = data?.recenttracks?.track;
        if (!raw) return;

        const currentTrack = Array.isArray(raw) ? raw[0] : raw;
        const isPlaying = currentTrack?.['@attr']?.nowplaying === 'true';

        if (!cancelled) {
          setTrack(isPlaying ? currentTrack : null);
        }
      } catch (error) {
        console.warn('[lastfm] fetch failed', error);
      }
    };

    fetchTrack();
    const interval = setInterval(fetchTrack, 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!track) return null;

  const cover =
    track.image?.find?.((img) => img.size === 'large')?.['#text'] ||
    track.image?.[3]?.['#text'] ||
    track.image?.[2]?.['#text'];

  return (
    <div className="WidgetContainer MusicWidget">
      <div className="WidgetIcon MusicIcon">♫</div>
      <div className="WidgetContent">
        <div className="WidgetTitle">{track.name}</div>
        <div className="WidgetSubtitle">{track.artist?.['#text']}</div>
      </div>
      {cover ? <img src={cover} alt="" className="MusicCover" /> : null}
    </div>
  );
};

export default LastFmWidget;
