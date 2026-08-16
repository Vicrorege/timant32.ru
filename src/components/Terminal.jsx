import React, { useState, useRef } from 'react';
import { resolveIngress } from '../tldTheme';

const Terminal = ({ onCommand, hostLabel = 'timant32' }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);
  const ingress = resolveIngress();

  const prompt = (
    <>
      <span style={{ color: '#ff3333' }}>root@{hostLabel}</span>
      <span style={{ color: '#5555ff' }}>~</span>$
    </>
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const cmd = input.trim().toLowerCase();
      let output = '';

      if (cmd === 'help') {
        output = 'commands: help, clear, show, ping, whoami, hostname, dig, reboot, ascii <w> <h>';
      } else if (cmd === 'ping') {
        output = 'pong';
      } else if (cmd === 'whoami') {
        output = `tim\nskills: Python, C++, React, Arch Linux, DevOps\nsession: ${ingress.host}`;
      } else if (cmd === 'hostname' || cmd === 'host') {
        output = ingress.host;
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
      } else if (cmd.startsWith('ascii')) {
        const parts = cmd.split(' ');
        if (parts.length === 3) {
          const w = parseInt(parts[1], 10);
          const h = parseInt(parts[2], 10);
          if (isNaN(w) || isNaN(h) || w < 2 || w > 14 || h < 2 || h > 25) {
            output = 'error: limits are width 2-14, height 2-25';
          } else {
            output = `ascii grid resized to ${w}x${h}`;
            onCommand(cmd);
          }
        } else {
          output = 'usage: ascii <width> <height>';
        }
      } else if (cmd !== '') {
        output = `bash: ${cmd}: command not found`;
      }

      if (cmd !== '') {
        setHistory((prev) => [...prev, { cmd, output }]);
        onCommand(cmd);
      }
      setInput('');
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
        fontFamily: 'Consolas, monospace',
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
      <div style={{ display: 'flex' }}>
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
            fontFamily: 'Consolas, monospace',
            fontSize: '0.9rem',
            flexGrow: 1,
          }}
          spellCheck="false"
          autoComplete="off"
        />
      </div>
    </div>
  );
};

export default Terminal;
