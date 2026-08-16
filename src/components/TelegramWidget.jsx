import React, { useEffect, useState } from 'react';

const mediaUrl = (src) => {
  if (!src) return '';
  if (src.startsWith('/')) return src;
  return `/api/telegram/media?u=${encodeURIComponent(src)}`;
};

async function loadPost(channel, postId) {
  const res = await fetch(
    `/api/telegram/post?channel=${encodeURIComponent(channel)}&id=${encodeURIComponent(postId)}`,
    { cache: 'no-store' }
  );
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${body.slice(0, 120)}`);
  }
  return res.json();
}

const TelegramWidget = ({ channel, postId }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await loadPost(channel, postId);
        if (!cancelled) setPost(data);
      } catch (err) {
        console.warn('[telegram]', err);
        try {
          const cached = await fetch(`/telegram-cache/${channel}-${postId}.json`, { cache: 'no-store' });
          if (cached.ok) {
            const data = await cached.json();
            if (data?.source !== 'placeholder' && !cancelled) {
              setPost(data);
              return;
            }
          }
        } catch {
          // ignore
        }
        if (!cancelled) {
          setPost(null);
          setError(err.message || 'proxy failed');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [channel, postId]);

  if (loading) {
    return (
      <div className="telegram-widget-inner telegram-proxy-card">
        <div className="telegram-proxy-text" style={{ opacity: 0.45 }}>
          loading…
        </div>
      </div>
    );
  }

  const hasBody = Boolean(post?.html || post?.text || post?.photos?.length);
  if (!post || !hasBody) {
    if (error) {
      return (
        <div className="telegram-widget-inner telegram-proxy-card">
          <div className="telegram-proxy-meta">t.me/{channel}/{postId}</div>
          <div className="telegram-proxy-text" style={{ opacity: 0.7 }}>
            relay offline — check host nginx proxies to :8067 and container health
          </div>
        </div>
      );
    }
    return null;
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
        <img className="telegram-proxy-photo" src={mediaUrl(post.photos[0])} alt="" loading="lazy" />
      ) : null}

      {post.html ? (
        <div className="telegram-proxy-text" dangerouslySetInnerHTML={{ __html: post.html }} />
      ) : post.text ? (
        <div className="telegram-proxy-text">{post.text}</div>
      ) : null}

      <div className="telegram-proxy-foot">
        {post.views ? <span className="telegram-proxy-views">{post.views} views</span> : <span />}
        <a
          className="telegram-proxy-link"
          href={post.link || `https://t.me/${channel}/${postId}`}
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
