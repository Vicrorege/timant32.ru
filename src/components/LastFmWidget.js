import React, { useState, useEffect } from 'react';

const LastFmWidget = () => {
  const [track, setTrack] = useState(null);
  
  const apiKey = 'e0c7141b21d00e44144ccc0f01318efd';
  const user = 'tinant32';

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const response = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${user}&api_key=${apiKey}&format=json&limit=1`
        );
        const data = await response.json();
        
        if (!data?.recenttracks?.track) return;

        const currentTrack = data.recenttracks.track[0];
        
        // Проверяем атрибут nowplaying. Если его нет — значит трек не играет прямо сейчас.
        const isPlaying = currentTrack['@attr'] && currentTrack['@attr'].nowplaying === 'true';

        if (isPlaying) {
          setTrack(currentTrack);
        } else {
          setTrack(null);
        }
      } catch (error) {
        console.error("LastFM Error:", error);
      }
    };

    fetchTrack();
    const interval = setInterval(fetchTrack, 10000); // Обновление раз в 10 сек

    return () => clearInterval(interval);
  }, [apiKey, user]);

  if (!track) return null;

  return (
    <div className="WidgetContainer MusicWidget">
        <div className="WidgetIcon MusicIcon">♫</div>
        <div className="WidgetContent">
            <div className="WidgetTitle">{track.name}</div>
            <div className="WidgetSubtitle">{track.artist['#text']}</div>
        </div>
        {track.image[2]['#text'] && (
            <img src={track.image[2]['#text']} alt="Cover" className="MusicCover" />
        )}
    </div>
  );
};

export default LastFmWidget;