import React, { useEffect, useState } from 'react';

const mediaUrl = (src) => `/api/telegram/media?u=${encodeURIComponent(src)}`;

const TelegramWidget = ({ channel, postId }) => {
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/telegram/post?channel=${encodeURIComponent(channel)}&id=${encodeURIComponent(postId)}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setPost(data);
      } catch (err) {
        console.warn('[telegram] proxy fetch failed', err);
        if (!cancelled) {
          setPost(null);
          setError('link down');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [channel, postId]);

  if (loading) {
    return (
      <div className="telegram-widget-inner telegram-proxy-card">
        <div className="telegram-proxy-meta">t.me/{channel}/{postId}</div>
        <div className="telegram-proxy-text" style={{ opacity: 0.6 }}>fetching via local relay...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="telegram-widget-inner telegram-proxy-card">
        <div className="telegram-proxy-meta">t.me/{channel}/{postId}</div>
        <div className="telegram-proxy-text">{error || 'empty'}</div>
        <a
          className="telegram-proxy-link"
          href={`https://t.me/${channel}/${postId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          open in telegram →
        </a>
      </div>
    );
  }

  const when = post.date
    ? new Date(post.date).toLocaleString(undefined, {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="telegram-widget-inner telegram-proxy-card">
      <div className="telegram-proxy-head">
        <span className="telegram-proxy-author">@{post.author || channel}</span>
        {when ? <span className="telegram-proxy-date">{when}</span> : null}
      </div>

      {post.photos?.[0] ? (
        <img
          className="telegram-proxy-photo"
          src={mediaUrl(post.photos[0])}
          alt=""
          loading="lazy"
        />
      ) : null}

      {post.text ? <div className="telegram-proxy-text">{post.text}</div> : null}

      <div className="telegram-proxy-foot">
        {post.views ? <span className="telegram-proxy-views">{post.views} views</span> : <span />}
        <a
          className="telegram-proxy-link"
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          t.me/{channel}/{postId}
        </a>
      </div>
    </div>
  );
};

export default TelegramWidget;
