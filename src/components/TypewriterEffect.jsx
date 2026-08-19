import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const TypewriterEffect = () => {
  const { t, i18n } = useTranslation();

  const typingSpeedMs = 70;
  const deletingSpeedMs = 35;
  const pauseAfterAllMs = 500;
  const cursorChar = '▌';

  const LINK_TAG_RE = useMemo(
    () =>
      /<a\s+href=(\"|')([^\"']+)\1\s*>([^<]*)<\/a>/gi,
    []
  );

  const parseTokens = (s) => {
    if (!s) return [{ type: 'text', text: '' }];
    const str = String(s);
    const tokens = [];
    let lastIndex = 0;

    const re = new RegExp(LINK_TAG_RE.source, LINK_TAG_RE.flags);
    let match;
    while ((match = re.exec(str)) !== null) {
      const before = str.slice(lastIndex, match.index);
      if (before) tokens.push({ type: 'text', text: before });

      const href = match[2];
      const linkText = match[3] ?? '';
      tokens.push({ type: 'link', href, text: linkText });

      lastIndex = re.lastIndex;
    }

    const after = str.slice(lastIndex);
    if (after) tokens.push({ type: 'text', text: after });
    if (!tokens.length) tokens.push({ type: 'text', text: '' });
    return tokens;
  };

  const phrases = useMemo(() => {
    return [
      { raw: t('phrase1'), holdMs: 1500 },
      { raw: t('phrase2'), holdMs: 1500 },
      { raw: t('phrase3'), holdMs: 1500 },
      { raw: t('phrase4'), holdMs: 1500 },
      { raw: t('phrase5'), holdMs: 1500 },
      { raw: t('phrase6'), holdMs: 50 },
    ];
  }, [t, i18n.language]);

  const phraseTokens = useMemo(() => phrases.map((p) => parseTokens(p.raw)), [phrases]);
  const phraseFullText = useMemo(
    () => phraseTokens.map((tokens) => tokens.map((tok) => tok.text).join('')),
    [phraseTokens]
  );

  const [phraseIdx, setPhraseIdx] = useState(0);
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState('typing'); // typing | holding | deleting | pause

  useEffect(() => {
    setPhraseIdx(0);
    setTyped(0);
    setPhase('typing');
  }, [i18n.language]);

  useEffect(() => {
    const fullLen = phraseFullText[phraseIdx]?.length ?? 0;

    let timer = null;
    if (phase === 'typing') {
      if (typed < fullLen) {
        timer = setTimeout(() => setTyped((v) => v + 1), typingSpeedMs);
      } else {
        timer = setTimeout(() => setPhase('holding'), 0);
      }
    } else if (phase === 'holding') {
      timer = setTimeout(() => setPhase('deleting'), phrases[phraseIdx]?.holdMs ?? 1500);
    } else if (phase === 'deleting') {
      if (typed > 0) {
        timer = setTimeout(() => setTyped((v) => v - 1), deletingSpeedMs);
      } else {
        timer = setTimeout(() => {
          if (phraseIdx < phrases.length - 1) {
            setPhraseIdx((i) => i + 1);
            setPhase('typing');
          } else {
            setPhase('pause');
          }
        }, 0);
      }
    } else if (phase === 'pause') {
      timer = setTimeout(() => {
        setPhraseIdx(0);
        setTyped(0);
        setPhase('typing');
      }, pauseAfterAllMs);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [
    phase,
    typed,
    phraseIdx,
    phrases,
    phraseFullText,
    typingSpeedMs,
    deletingSpeedMs,
    pauseAfterAllMs,
  ]);

  const tokens = phraseTokens[phraseIdx] ?? [];

  const renderTyped = () => {
    let remaining = typed;
    const parts = [];

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      const len = tok.text.length;
      const take = Math.max(0, Math.min(len, remaining));
      if (take > 0) {
        const piece = tok.text.slice(0, take);
        if (tok.type === 'link') {
          parts.push(
            <a
              key={`link-${phraseIdx}-${i}`}
              href={tok.href}
              target="_blank"
              rel="noreferrer"
              style={{
                color: 'var(--color-primary)',
                textDecoration: 'none',
              }}
            >
              {piece}
            </a>
          );
        } else {
          parts.push(<React.Fragment key={`t-${phraseIdx}-${i}`}>{piece}</React.Fragment>);
        }
      }
      remaining -= take;
      if (remaining <= 0) break;
    }

    return parts;
  };

  return (
    <div className="typewriter-container">
      <span className="typing-text">{renderTyped()}</span>
      <span className="TypeAnimation_cursor">{cursorChar}</span>
    </div>
  );
};

export default TypewriterEffect;