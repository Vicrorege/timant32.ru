import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import GameOfLifeWidget from './GameOfLifeWidget';
import AsciiVisualizerWidget from './AsciiVisualizerWidget';
import CowsayWidget from './CowsayWidget';
import StatusWidget from './StatusWidget';
import CalendarWidget from './CalendarWidget';
import CountdownWidget from './CountdownWidget';
import TelegramWidget from './TelegramWidget';
import GithubWidget from './GithubWidget';

const DevRandom = ({
  onOpenTerminal,
  onTriggerMatrix,
  activeExperimentProp = null,
}) => {
  const { t, i18n } = useTranslation();
  const [activeExp, setActiveExp] = useState(activeExperimentProp);

  const toggleExperiment = (name) => {
    setActiveExp((prev) => (prev === name ? null : name));
  };

  const handleClose = () => {
    setActiveExp(null);
  };

  return (
    <section id="devrandom" className="section-block devrandom-section">
      <div className="section-header">
        <h2 className="section-title">{t('section_devrandom', '04 / /dev/random')}</h2>
        <p className="section-subtitle">
          {t('devrandom_subtitle', 'there is more here than necessary.')}
        </p>
      </div>

      {/* Interactive Command Launchers */}
      <div className="devrandom-buttons" role="group" aria-label="Playground experiments">
        <button
          type="button"
          className="devrandom-btn devrandom-terminal-btn"
          onClick={onOpenTerminal}
        >
          &gt; open terminal
        </button>

        <button
          type="button"
          className={`devrandom-btn ${activeExp === 'life' ? 'active' : ''}`}
          onClick={() => toggleExperiment('life')}
        >
          {activeExp === 'life' ? '[-] game of life' : '[+] game of life'}
        </button>

        <button
          type="button"
          className={`devrandom-btn ${activeExp === 'bfs' ? 'active' : ''}`}
          onClick={() => toggleExperiment('bfs')}
        >
          {activeExp === 'bfs' ? '[-] pathfinding bfs' : '[+] pathfinding bfs'}
        </button>

        <button
          type="button"
          className={`devrandom-btn ${activeExp === 'cowsay' ? 'active' : ''}`}
          onClick={() => toggleExperiment('cowsay')}
        >
          {activeExp === 'cowsay' ? '[-] cowsay tux' : '[+] cowsay tux'}
        </button>

        <button
          type="button"
          className={`devrandom-btn ${activeExp === 'servers' ? 'active' : ''}`}
          onClick={() => toggleExperiment('servers')}
        >
          {activeExp === 'servers' ? '[-] server nodes' : '[+] server nodes'}
        </button>

        <button
          type="button"
          className={`devrandom-btn ${activeExp === 'calendar' ? 'active' : ''}`}
          onClick={() => toggleExperiment('calendar')}
        >
          {activeExp === 'calendar' ? '[-] calendar' : '[+] calendar'}
        </button>

        <button
          type="button"
          className={`devrandom-btn ${activeExp === 'countdown' ? 'active' : ''}`}
          onClick={() => toggleExperiment('countdown')}
        >
          {activeExp === 'countdown' ? '[-] countdown' : '[+] countdown'}
        </button>

        <button
          type="button"
          className={`devrandom-btn ${activeExp === 'telegram' ? 'active' : ''}`}
          onClick={() => toggleExperiment('telegram')}
        >
          {activeExp === 'telegram' ? '[-] telegram relay' : '[+] telegram relay'}
        </button>

        <button
          type="button"
          className={`devrandom-btn ${activeExp === 'github' ? 'active' : ''}`}
          onClick={() => toggleExperiment('github')}
        >
          {activeExp === 'github' ? '[-] github heatmap' : '[+] github heatmap'}
        </button>

        <button
          type="button"
          className="devrandom-btn devrandom-matrix-btn"
          onClick={onTriggerMatrix}
        >
          &gt; enter the matrix
        </button>
      </div>

      {/* Active Sandbox Output Area */}
      {activeExp && (
        <div className="devrandom-sandbox">
          <div className="devrandom-sandbox-bar">
            <span className="devrandom-sandbox-label">
              /dev/random/{activeExp}
            </span>
            <button
              type="button"
              className="devrandom-close-btn"
              onClick={handleClose}
              title="Close experiment"
            >
              [ {t('lab_close', 'close')} ✕ ]
            </button>
          </div>

          <div className="devrandom-sandbox-body">
            {activeExp === 'life' && <GameOfLifeWidget />}
            {activeExp === 'bfs' && <AsciiVisualizerWidget />}
            {activeExp === 'cowsay' && <CowsayWidget />}
            {activeExp === 'servers' && <StatusWidget />}
            {activeExp === 'calendar' && <CalendarWidget />}
            {activeExp === 'countdown' && <CountdownWidget />}
            {activeExp === 'telegram' && (
              <TelegramWidget
                key={i18n.language}
                channel={t('telegram_channel')}
                postId={t('telegram_post_id')}
              />
            )}
            {activeExp === 'github' && <GithubWidget />}
          </div>
        </div>
      )}
    </section>
  );
};

export default DevRandom;
