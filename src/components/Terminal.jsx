import React, { useState, useRef, useEffect } from 'react';
import { resolveIngress, applyCustomTheme, NAMED_THEMES } from '../tldTheme';

const ALL_COMMANDS = [
  'help',
  'fastfetch',
  'neofetch',
  'theme',
  'github',
  'gh',
  'stats',
  'whoami',
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
  'nslookup',
  'echo',
  'history',
  'clear',
  'show',
  'reboot',
  'ascii',
  'sudo',
];

const VIRTUAL_FS = {
  'about.txt': 'timant32 (Tim)\npython + React developer & robot enthusiast.\nBased in Bryansk, Russian Federation.',
  'skills.md': '# Core Tech Stack\n- Languages: Python, C++, JavaScript/TypeScript, Go, SQL\n- Frontend: React 19, Vite, Tailwind/CSS, i18next\n- Backend & Infra: Linux (Arch/Debian), Docker, Nginx, Systemd, Redis, FastAPI, aiogram',
  'contact.txt': 'Email: me@timant32.ru\nTelegram: https://t.me/tim_ant32\nGitHub: https://github.com/Vicrorege',
  'projects.txt': '- timant32.ru — Terminal dashboard (React + Vite)\n- schedule2cal — Timetable to .ics sync (Python)\n- ha-vicro — Home Assistant companion daemon (Go)\n- maxbridge — Bridge & bot tooling (Python)\n- rgb-btw — Lighting sync utility (Python)',
  '.env': 'NICE_TRY=1\nCALENDAR_ICS_URL=[REDACTED]\nLASTFM_API_KEY=[REDACTED]\nSECRET_FLAG=hermes{h4ck_th3_pl4n3t}',
};

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

const Terminal = ({ onCommand, hostLabel = 'timant32' }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const tempInputRef = useRef('');
  const inputRef = useRef(null);
  const ingress = resolveIngress();

  const prompt = (
    <>
      <span style={{ color: '#ff3333' }}>root@{hostLabel}</span>
      <span style={{ color: '#5555ff' }}>~</span>$
    </>
  );

  useEffect(() => {
    // Reset history index when input changes manually
    if (historyIndex !== -1 && input !== cmdHistory[cmdHistory.length - 1 - historyIndex]) {
      setHistoryIndex(-1);
    }
  }, [input, historyIndex, cmdHistory]);

  const executeCommand = (rawInput) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    // Save to command history
    setCmdHistory((prev) => (prev[prev.length - 1] === trimmed ? prev : [...prev, trimmed]));
    setHistoryIndex(-1);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    const rawArgs = trimmed.slice(cmd.length).trim();

    let output = '';

    if (cmd === 'help') {
      output = [
        'Available terminal commands:',
        '  System:      fastfetch, neofetch, whoami, skills, about, contact, uptime, date, uname, pwd, hostname',
        '  Navigation:  ls, cat <file>, echo <text>, dig, ping, history',
        '  Customizer:  theme <name|auto>, matrix, ascii <w> <h>, clear, show, reboot',
        '  Developer:   github, gh, stats',
        '  Tab: auto-completes commands  |  Up/Down: command history navigation',
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
      const now = new Date();
      const currentTheme = localStorage.getItem('timant32_custom_theme') || ingress.tierLabel || 'matrix green';
      const infoLines = [
        `root@${ingress.short}`,
        `--------------------`,
        `OS: Arch Linux x86_64`,
        `Host: ${ingress.host} (Nginx / Vite PWA)`,
        `Kernel: 6.8.0-zen (custom)`,
        `Uptime: 142 days, 7 hours, 23 mins`,
        `WM: Hyprland (Wayland)`,
        `Terminal: React-WebTerm v2.4`,
        `Shell: zsh 5.9 (x86_64-pc-linux-gnu)`,
        `Theme: ${currentTheme}`,
        `Stack: Python, React, Go, C++, Linux`,
      ];
      const maxLines = Math.max(archLogo.length, infoLines.length);
      const combined = [];
      for (let i = 0; i < maxLines; i++) {
        const logo = (archLogo[i] || '').padEnd(18, ' ');
        const info = infoLines[i] || '';
        combined.push(`${logo} ${info}`);
      }
      output = combined.join('\n');
    } else if (cmd === 'theme') {
      if (!args.length) {
        const available = Object.keys(NAMED_THEMES).join(', ');
        const current = localStorage.getItem('timant32_custom_theme') || 'auto (' + ingress.tierLabel + ')';
        output = [
          `Current theme: ${current}`,
          `Available palettes: ${available}, auto/default`,
          `Usage: theme <name> (e.g. "theme cyan", "theme amber", "theme matrix", "theme auto")`,
        ].join('\n');
      } else {
        const target = args[0].toLowerCase();
        const res = applyCustomTheme(target);
        if (res?.success) {
          output = `[theme] palette switched to: ${res.themeName}`;
          onCommand(`theme ${res.themeName}`);
        } else {
          output = `[theme] unknown theme "${target}". Available: ${Object.keys(NAMED_THEMES).join(', ')}, auto`;
        }
      }
    } else if (cmd === 'matrix' || cmd === 'cmatrix') {
      output = 'Entering the Matrix...';
      onCommand('matrix');
    } else if (cmd === 'ping') {
      const target = args[0] || '127.0.0.1';
      output = [
        `PING ${target} (${target}) 56(84) bytes of data.`,
        `64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.042 ms`,
        `64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.038 ms`,
        `--- ${target} ping statistics ---`,
        `2 packets transmitted, 2 received, 0% packet loss, time 1001ms`,
      ].join('\n');
    } else if (cmd === 'github' || cmd === 'gh' || cmd === 'stats') {
      output = [
        'GitHub Profile: https://github.com/Vicrorege',
        'User: Vicrorege (timant32)',
        'Repos: 7 | Followers: 4 | 2026 Yearly Contribs: 340+',
        'Latest push: schedule2cal (Python)',
        'Stack: Python, React/JS, Go, C++, Arch Linux',
      ].join('\n');
    } else if (cmd === 'whoami') {
      output = `tim (timant32)\nrole: python+React developer & bot enthusiast\nsession: ${ingress.host} (ingress: ${ingress.tierLabel})`;
    } else if (cmd === 'skills') {
      output = VIRTUAL_FS['skills.md'];
    } else if (cmd === 'about' || cmd === 'bio') {
      output = VIRTUAL_FS['about.txt'];
    } else if (cmd === 'contact') {
      output = VIRTUAL_FS['contact.txt'];
    } else if (cmd === 'hostname' || cmd === 'host') {
      output = ingress.host;
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
      output = Object.keys(VIRTUAL_FS).join('   ');
    } else if (cmd === 'cat') {
      if (!args.length) {
        output = 'usage: cat <filename> (e.g. "cat about.txt", "cat skills.md")';
      } else {
        const filename = args[0];
        if (VIRTUAL_FS[filename]) {
          output = VIRTUAL_FS[filename];
        } else {
          output = `cat: ${filename}: No such file or directory`;
        }
      }
    } else if (cmd === 'pwd') {
      output = '/home/timant32';
    } else if (cmd === 'uname') {
      if (rawArgs.includes('-a')) {
        output = `Linux ${ingress.short} 6.8.0-zen1-1-zen #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux`;
      } else {
        output = 'Linux';
      }
    } else if (cmd === 'echo') {
      output = rawArgs;
    } else if (cmd === 'history') {
      output = cmdHistory.map((c, idx) => `  ${idx + 1}  ${c}`).join('\n') || '  (empty)';
    } else if (cmd === 'dig' || cmd === 'nslookup') {
      output = [
        `; <<>> Dig simulated <<>> ${ingress.host}`,
        `;; QUESTION SECTION:`,
        `;${ingress.host}.\t\tIN\tA`,
        `;; ANSWER SECTION:`,
        `${ingress.host}.\t60\tIN\tTXT\t"tier=${ingress.tierLabel}; tld=.${ingress.tld}"`,
        `;; Query time: 1 msec`,
        `;; SERVER: 127.0.0.1#53`,
        `;; MSG SIZE  rcvd: 64`,
      ].join('\n');
    } else if (cmd === 'clear') {
      setHistory([]);
      setInput('');
      onCommand('clear');
      return;
    } else if (cmd === 'show') {
      output = 'widgets restored.';
      onCommand('show');
    } else if (cmd === 'reboot') {
      output = 'rebooting system...';
      onCommand('reboot');
    } else if (cmd === 'sudo') {
      output = 'timant is not in the sudoers file. This incident will be reported.';
      onCommand('sudo');
    } else if (cmd.startsWith('ascii')) {
      if (args.length === 2) {
        const w = parseInt(args[0], 10);
        const h = parseInt(args[1], 10);
        if (isNaN(w) || isNaN(h) || w < 2 || w > 14 || h < 2 || h > 25) {
          output = 'error: limits are width 2-14, height 2-25';
        } else {
          output = `ascii grid resized to ${w}x${h}`;
          onCommand(trimmed);
        }
      } else if (args[0] === 'auto') {
        output = 'ascii grid set to auto sizing';
        onCommand('ascii auto');
      } else {
        output = 'usage: ascii <width> <height> (or "ascii auto")';
      }
    } else {
      output = `bash: ${cmd}: command not found. Type 'help' for available commands.`;
    }

    setHistory((prev) => [...prev, { cmd: trimmed, output }]);
    onCommand(trimmed);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!cmdHistory.length) return;

      const nextIdx = historyIndex + 1;
      if (nextIdx < cmdHistory.length) {
        if (historyIndex === -1) {
          tempInputRef.current = input;
        }
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

      // Autocomplete cat with virtual files if typing "cat ..."
      if (current.startsWith('cat ')) {
        const filePrefix = current.slice(4).trim();
        const fileMatches = Object.keys(VIRTUAL_FS).filter((f) => f.startsWith(filePrefix));
        if (fileMatches.length === 1) {
          setInput(`cat ${fileMatches[0]}`);
        } else if (fileMatches.length > 1) {
          const common = getCommonPrefix(fileMatches);
          if (common.length > filePrefix.length) {
            setInput(`cat ${common}`);
          }
          setHistory((prev) => [
            ...prev,
            { cmd: input, output: fileMatches.join('   ') },
          ]);
        }
        return;
      }

      // Autocomplete theme names if typing "theme ..."
      if (current.startsWith('theme ')) {
        const themePrefix = current.slice(6).trim();
        const themeOptions = [...Object.keys(NAMED_THEMES), 'auto'];
        const themeMatches = themeOptions.filter((t) => t.startsWith(themePrefix));
        if (themeMatches.length === 1) {
          setInput(`theme ${themeMatches[0]}`);
        } else if (themeMatches.length > 1) {
          setHistory((prev) => [
            ...prev,
            { cmd: input, output: themeMatches.join('   ') },
          ]);
        }
        return;
      }

      // Autocomplete root commands
      const matches = ALL_COMMANDS.filter((c) => c.startsWith(current));
      if (matches.length === 1) {
        setInput(matches[0] + ' ');
      } else if (matches.length > 1) {
        const common = getCommonPrefix(matches);
        if (common.length > current.length) {
          setInput(common);
        }
        setHistory((prev) => [
          ...prev,
          { cmd: input, output: matches.join('   ') },
        ]);
      }
    }
  };

  return (
    <div
      className="hide-on-mobile"
      style={{
        width: '800px',
        maxWidth: '90vw',
        marginTop: '30px',
        marginBottom: '30px',
        textAlign: 'left',
        fontFamily: 'var(--font-main)',
        fontSize: '0.9rem',
      }}
      onClick={() => inputRef.current && inputRef.current.focus()}
    >
      {history.map((item, i) => (
        <div key={i}>
          <div>
            {prompt} {item.cmd}
          </div>
          {item.output && (
            <div style={{ color: 'var(--color-text)', whiteSpace: 'pre-wrap', marginBottom: '10px' }}>
              {item.output}
            </div>
          )}
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {prompt}&nbsp;
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--color-primary)',
            fontFamily: 'var(--font-main)',
            fontSize: '0.9rem',
            flexGrow: 1,
            caretColor: 'var(--color-primary)',
          }}
          spellCheck="false"
          autoComplete="off"
          autoCapitalize="off"
        />
      </div>
    </div>
  );
};

export default Terminal;
