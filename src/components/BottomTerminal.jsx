import React, { useState, useRef, useEffect } from 'react';
import { resolveIngress, applyCustomTheme, NAMED_THEMES } from '../tldTheme';
import { CURATED_PROJECTS } from './ProjectsWidget';

const ALL_COMMANDS = [
  'help',
  'whoami',
  'legacy',
  'projects',
  'status',
  'music',
  'fastfetch',
  'neofetch',
  'theme',
  'github',
  'gh',
  'telegram',
  'skills',
  'about',
  'contact',
  'matrix',
  'uptime',
  'date',
  'cat',
  'ls',
  'pwd',
  'uname',
  'ping',
  'hostname',
  'dig',
  'echo',
  'history',
  'clear',
  'reboot',
  'sudo',
  'collapse',
  'exit',
  'quit',
];

function getCommonPrefix(words) {
  if (!words.length) return '';
  let prefix = words[0];
  for (let i = 1; i < words.length; i++) {
    while (!words[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return '';
    }
  }
  return prefix;
}

const BottomTerminal = ({
  identity,
  isExpanded = false,
  onToggleExpand,
  onCommand,
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    {
      cmd: '',
      output: `Connected to ${identity?.domain || 'terminal'}. Type 'help' for commands. (Press ESC or 'exit' to collapse)`,
    },
  ]);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const tempInputRef = useRef('');
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const bottomScrollRef = useRef(null);
  const ingress = resolveIngress();

  const activeIdentity = identity || ingress.identity;
  const hostLabel = activeIdentity?.displayName?.replace(/[^\w.-]/g, '') || activeIdentity?.id || 'vicrorege';

  const prompt = (
    <span className="bottom-term-prompt">
      <span style={{ color: '#ff3b4e' }}>root@{hostLabel}</span>
      <span style={{ color: '#5588ff' }}>~</span>$&nbsp;
    </span>
  );

  const virtualFs = {
    'about.txt': `${activeIdentity.brand} (Tim)\nDeveloper & robot enthusiast.\nSelf-hosted servers, Linux, bots, tools.`,
    'skills.md': '# Core Tech Stack\n- Languages: Python, C++, React 19, JavaScript/TypeScript, Go, SQL\n- Infra: Linux (Arch / Ubuntu), Docker, Nginx, Systemd, Redis, Mailcow\n- Tooling: Git, Vite, FastAPI, aiogram',
    'contact.txt': `Email: ${activeIdentity.links.email}\nTelegram: ${activeIdentity.links.telegram}\nGitHub: ${activeIdentity.links.github}`,
    'projects.txt': CURATED_PROJECTS.map((p) => `- ${p.name}: ${p.desc.ru} (${p.stack})`).join('\n'),
    'identity.json': JSON.stringify(
      {
        id: activeIdentity.id,
        role: activeIdentity.role,
        brand: activeIdentity.brand,
        domain: activeIdentity.domain,
        altDomain: activeIdentity.altDomain,
      },
      null,
      2
    ),
  };

  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => {
        inputRef.current?.focus();
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (isExpanded) {
      bottomScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isExpanded]);

  useEffect(() => {
    if (historyIndex !== -1 && input !== cmdHistory[cmdHistory.length - 1 - historyIndex]) {
      setHistoryIndex(-1);
    }
  }, [input, historyIndex, cmdHistory]);

  const executeCommand = async (rawInput) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    setCmdHistory((prev) => (prev[prev.length - 1] === trimmed ? prev : [...prev, trimmed]));
    setHistoryIndex(-1);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    const rawArgs = trimmed.slice(cmd.length).trim();

    let output = '';

    if (cmd === 'exit' || cmd === 'quit' || cmd === 'collapse') {
      onToggleExpand?.(false);
      setInput('');
      return;
    }

    if (cmd === 'help') {
      output = [
        'Available terminal commands:',
        '  Identity:    whoami [--all], legacy, contact, github, telegram',
        '  System:      fastfetch, neofetch, skills, about, projects, status, music, uptime, date, uname, hostname',
        '  Navigation:  ls, cat <file>, echo <text>, dig, ping, history',
        '  Theme/UI:    theme <name|auto>, matrix, clear, reboot',
        '  Session:     collapse / exit (or press ESC)',
        '  Shortcuts:   Tab: autocompletion | Up/Down: history navigation',
      ].join('\n');
    } else if (cmd === 'whoami') {
      if (rawArgs.includes('--all') || rawArgs.includes('-a')) {
        if (activeIdentity.id === 'vicrorege') {
          output = [
            'vicrorege',
            'aka tim',
            'legacy: timant32',
            `domain: ${activeIdentity.domain}`,
            `role: current primary identity`,
          ].join('\n');
        } else {
          output = [
            'timant32',
            'aka tim',
            'current: vicrorege',
            `domain: ${activeIdentity.domain}`,
            `role: legacy internet home`,
          ].join('\n');
        }
      } else {
        output = activeIdentity.id === 'vicrorege' ? 'vicrorege' : 'timant32';
      }
    } else if (cmd === 'legacy') {
      output = [
        '--- Dual Identity Architecture ---',
        '  vicrorege.com  → current public / dev identity (magenta / clean)',
        '  timant32.ru    → legacy digital home (matrix green / terminal)',
        '  Both belong to the same developer (Tim). Shared infrastructure,',
        '  shared servers, two distinct gateways into the same space.',
      ].join('\n');
    } else if (cmd === 'fastfetch' || cmd === 'neofetch') {
      const archLogo = [
        '       /\\        ',
        '      /  \\       ',
        '     /\\   \\      ',
        '    /      \\     ',
        '   /   ,,   \\    ',
        '  /   |  |  -\\   ',
        ' /_-\'\'    \'\'-_\\  ',
      ];
      const currentTheme = localStorage.getItem('timant32_custom_theme') || ingress.tierLabel || 'palette';
      const infoLines = [
        `root@${hostLabel}`,
        `--------------------`,
        `OS: Arch Linux x86_64`,
        `Identity: ${activeIdentity.brand} (${activeIdentity.role})`,
        `Host: ${activeIdentity.domain} (Nginx / Vite SPA)`,
        `Kernel: 6.8.0-zen (custom)`,
        `Uptime: 142 days, 7 hours, 23 mins`,
        `Shell: zsh 5.9 (x86_64-pc-linux-gnu)`,
        `Theme: ${currentTheme}`,
        `Stack: Python, React 19, Go, C++, Linux`,
      ];
      const maxLines = Math.max(archLogo.length, infoLines.length);
      const combined = [];
      for (let i = 0; i < maxLines; i++) {
        const logo = (archLogo[i] || '').padEnd(18, ' ');
        const info = infoLines[i] || '';
        combined.push(`${logo} ${info}`);
      }
      output = combined.join('\n');
    } else if (cmd === 'projects') {
      output = CURATED_PROJECTS.map(
        (p) => `* ${p.name.padEnd(18)} [${p.tag}]\n  ${p.desc.ru}\n  stack: ${p.stack}`
      ).join('\n\n');
    } else if (cmd === 'status') {
      output = [
        '--- Infrastructure Node Probes ---',
        '● timant32.ru      [ONLINE] 200 OK',
        '● mail.timant32.su [ONLINE] 200 OK (Mailcow)',
        '● mc.timant32.ru   [ONLINE] 200 OK (Minecraft/Crafty)',
        'All 3/3 nodes operational.',
      ].join('\n');
    } else if (cmd === 'music') {
      try {
        const res = await fetch('/api/lastfm');
        if (res.ok && res.status !== 204) {
          const data = await res.json();
          const raw = data?.recenttracks?.track;
          const current = Array.isArray(raw) ? raw[0] : raw;
          if (current?.name) {
            output = `♫ ${current.name} — ${current.artist?.['#text'] || 'Unknown'}\nLast.fm: https://www.last.fm/user/${data?.recenttracks?.['@attr']?.user || 'tinant32'}`;
          } else {
            output = '♫ No active track streaming on Last.fm right now.';
          }
        } else {
          output = '♫ No active track streaming on Last.fm right now.';
        }
      } catch {
        output = '♫ Could not query Last.fm upstream.';
      }
    } else if (cmd === 'theme') {
      if (!args.length) {
        const available = Object.keys(NAMED_THEMES).join(', ');
        const current = localStorage.getItem('timant32_custom_theme') || `auto (${ingress.tierLabel})`;
        output = [
          `Current palette: ${current}`,
          `Available: ${available}, auto/default`,
          `Usage: theme <name> (e.g. "theme magenta", "theme green", "theme cyan", "theme auto")`,
        ].join('\n');
      } else {
        const target = args[0].toLowerCase();
        const res = applyCustomTheme(target);
        if (res?.success) {
          output = `[theme] palette switched to: ${res.themeName}`;
          onCommand?.(`theme ${res.themeName}`);
        } else {
          output = `[theme] unknown theme "${target}". Available: ${Object.keys(NAMED_THEMES).join(', ')}, auto`;
        }
      }
    } else if (cmd === 'matrix' || cmd === 'cmatrix') {
      output = 'Entering the Matrix...';
      onCommand?.('matrix');
    } else if (cmd === 'github' || cmd === 'gh') {
      output = `GitHub: ${activeIdentity.links.github}\nUser: ${activeIdentity.links.githubHandle}\nRepos: 7+ | Main: schedule2cal, axioma-board, timant32.ru`;
    } else if (cmd === 'telegram' || cmd === 'tg') {
      output = `Telegram: ${activeIdentity.links.telegram} (${activeIdentity.links.telegramHandle})\nSecondary: ${activeIdentity.links.telegramLegacy || activeIdentity.links.telegramCurrent}`;
    } else if (cmd === 'contact') {
      output = virtualFs['contact.txt'];
    } else if (cmd === 'about' || cmd === 'bio') {
      output = virtualFs['about.txt'];
    } else if (cmd === 'skills') {
      output = virtualFs['skills.md'];
    } else if (cmd === 'ping') {
      const target = args[0] || '127.0.0.1';
      output = [
        `PING ${target} (${target}) 56(84) bytes of data.`,
        `64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.038 ms`,
        `64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.041 ms`,
        `--- ${target} ping statistics ---`,
        `2 packets transmitted, 2 received, 0% packet loss, time 1002ms`,
      ].join('\n');
    } else if (cmd === 'hostname' || cmd === 'host') {
      output = activeIdentity.domain;
    } else if (cmd === 'uptime') {
      output = ' 18:42:00 up 142 days, 7:23, 1 user, load average: 0.08, 0.04, 0.01';
    } else if (cmd === 'date') {
      output = new Date().toLocaleString('en-US', {
        timeZone: 'Europe/Moscow',
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        year: 'numeric',
        timeZoneName: 'short',
      });
    } else if (cmd === 'ls' || cmd === 'dir') {
      output = Object.keys(virtualFs).join('   ');
    } else if (cmd === 'cat') {
      if (!args.length) {
        output = 'usage: cat <filename> (e.g. "cat about.txt", "cat skills.md", "cat identity.json")';
      } else {
        const filename = args[0];
        if (virtualFs[filename]) {
          output = virtualFs[filename];
        } else {
          output = `cat: ${filename}: No such file or directory`;
        }
      }
    } else if (cmd === 'pwd') {
      output = `/home/${activeIdentity.id}`;
    } else if (cmd === 'uname') {
      output = rawArgs.includes('-a')
        ? `Linux ${hostLabel} 6.8.0-zen1-1-zen #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux`
        : 'Linux';
    } else if (cmd === 'echo') {
      output = rawArgs;
    } else if (cmd === 'history') {
      output = cmdHistory.map((c, idx) => `  ${idx + 1}  ${c}`).join('\n') || '  (empty)';
    } else if (cmd === 'dig') {
      output = [
        `; <<>> Simulated DNS query <<>> ${activeIdentity.domain}`,
        `;; QUESTION SECTION:`,
        `;${activeIdentity.domain}.\t\tIN\tA`,
        `;; ANSWER SECTION:`,
        `${activeIdentity.domain}.\t60\tIN\tTXT\t"identity=${activeIdentity.id}; role=${activeIdentity.role}"`,
        `;; SERVER: 127.0.0.1#53`,
      ].join('\n');
    } else if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (cmd === 'reboot') {
      output = 'rebooting system...';
      onCommand?.('reboot');
    } else if (cmd === 'sudo') {
      output = `${activeIdentity.id} is not in the sudoers file. This incident will be reported.`;
      onCommand?.('sudo');
    } else {
      output = `bash: ${cmd}: command not found. Type 'help' for available commands.`;
    }

    setHistory((prev) => [...prev, { cmd: trimmed, output }]);
    onCommand?.(trimmed);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onToggleExpand?.(false);
      return;
    }

    if (e.key === 'Enter') {
      executeCommand(input);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!cmdHistory.length) return;

      const nextIdx = historyIndex + 1;
      if (nextIdx < cmdHistory.length) {
        if (historyIndex === -1) tempInputRef.current = input;
        setHistoryIndex(nextIdx);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIdx]);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput(tempInputRef.current);
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const current = input.trim().toLowerCase();
      if (!current) return;

      if (current.startsWith('cat ')) {
        const filePrefix = current.slice(4).trim();
        const matches = Object.keys(virtualFs).filter((f) => f.startsWith(filePrefix));
        if (matches.length === 1) {
          setInput(`cat ${matches[0]}`);
        } else if (matches.length > 1) {
          const common = getCommonPrefix(matches);
          if (common.length > filePrefix.length) setInput(`cat ${common}`);
          setHistory((prev) => [...prev, { cmd: input, output: matches.join('   ') }]);
        }
        return;
      }

      if (current.startsWith('theme ')) {
        const prefix = current.slice(6).trim();
        const opts = [...Object.keys(NAMED_THEMES), 'auto'];
        const matches = opts.filter((t) => t.startsWith(prefix));
        if (matches.length === 1) {
          setInput(`theme ${matches[0]}`);
        } else if (matches.length > 1) {
          setHistory((prev) => [...prev, { cmd: input, output: matches.join('   ') }]);
        }
        return;
      }

      const matches = ALL_COMMANDS.filter((c) => c.startsWith(current));
      if (matches.length === 1) {
        setInput(matches[0] + ' ');
      } else if (matches.length > 1) {
        const common = getCommonPrefix(matches);
        if (common.length > current.length) setInput(common);
        setHistory((prev) => [...prev, { cmd: input, output: matches.join('   ') }]);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`BottomTerminalContainer ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
    >
      {!isExpanded ? (
        /* Collapsed Bar: an inviting shell prompt at the bottom of the page */
        <div
          className="bottom-terminal-collapsed-bar"
          onClick={() => onToggleExpand?.(true)}
          title="Click to expand interactive shell (or press ~)"
        >
          <div className="bottom-terminal-collapsed-left">
            {prompt}
            <span className="bottom-terminal-collapsed-cursor">_</span>
          </div>
          <div className="bottom-terminal-collapsed-hint">
            there's a shell down here &gt; [click or press ~]
          </div>
        </div>
      ) : (
        /* Expanded Interactive Terminal Window */
        <div className="bottom-terminal-window">
          <div className="bottom-terminal-titlebar">
            <div className="bottom-terminal-titlebar-left">
              <span className="dot red" onClick={() => onToggleExpand?.(false)} title="Close (ESC)" />
              <span className="dot yellow" />
              <span className="dot green" />
              <span className="bottom-terminal-title">
                root@{hostLabel}: ~ ({activeIdentity.domain} shell)
              </span>
            </div>
            <button
              type="button"
              className="bottom-terminal-collapse-btn"
              onClick={() => onToggleExpand?.(false)}
              title="Collapse shell (ESC)"
            >
              [ collapse — ]
            </button>
          </div>

          <div
            className="bottom-terminal-body"
            onClick={() => inputRef.current?.focus()}
          >
            {history.map((item, i) => (
              <div key={i} className="term-line-block">
                {item.cmd && (
                  <div className="term-cmd-row">
                    {prompt}
                    <span className="term-typed-text">{item.cmd}</span>
                  </div>
                )}
                {item.output && <div className="term-output-text">{item.output}</div>}
              </div>
            ))}

            <div className="term-input-row">
              {prompt}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="term-cli-input"
                spellCheck="false"
                autoComplete="off"
                autoCapitalize="off"
              />
            </div>
            <div ref={bottomScrollRef} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BottomTerminal;
