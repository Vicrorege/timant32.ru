import React, { useState, useEffect } from 'react';

const CowsayWidget = () => {
  const [output, setOutput] = useState('');

  useEffect(() => {
    const phrases = [
      "sudo pacman -Syu",
      "There is no place like ~",
      "Чем дальше в лес\nШкибиди доп доп доп ес ес...",
      "Чем больше женщину мы любим, тем больше лучше мы чем чем...",
      "Мир так желток...",
      "Я никому не ужин...",
      "Завтрак не настанет...",
      "Мир уже не торт...",
      "Я всегда виноград",
      "Любви все возрасты попкорны",
      "Любим... Помним... Пломбир...",
      "Отец хотел сыра",
      "It compiles! Ship it!",
      "Hyprland goes brrrr",
      "O(N log N) > O(N^2)"
    ];

    const tux = `
   \\
    \\
        .--.
       |o_o |
       |:_/ |
      //   \\ \\
     (|     | )
    /'\\_   _/'\\
    \\___)=(___/
    `;

    const wrapText = (text, maxWidth) => {
      let result = [];
      text.split('\n').forEach(line => {
        let currentLine = '';
        line.split(' ').forEach(word => {
          if ((currentLine + word).length > maxWidth) {
            if (currentLine) result.push(currentLine.trim());
            currentLine = word + ' ';
          } else {
            currentLine += word + ' ';
          }
        });
        if (currentLine) result.push(currentLine.trim());
      });
      return result;
    };

    const updateCowsay = () => {
      const text = phrases[Math.floor(Math.random() * phrases.length)];
      const lines = wrapText(text, 22);
      const maxLength = Math.max(...lines.map(l => l.length));
      
      const top = ' ' + '_'.repeat(maxLength + 2);
      const bottom = ' ' + '-'.repeat(maxLength + 2);
      let middle = '';
      
      if (lines.length === 1) {
         middle = `< ${lines[0].padEnd(maxLength, ' ')} >\n`;
      } else {
         lines.forEach((line, i) => {
           const pad = line.padEnd(maxLength, ' ');
           if (i === 0) middle += `/ ${pad} \\\n`;
           else if (i === lines.length - 1) middle += `\\ ${pad} /\n`;
           else middle += `| ${pad} |\n`;
         });
      }
      setOutput(top + '\n' + middle + bottom + tux);
    };

    updateCowsay();
    const interval = setInterval(updateCowsay, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="WidgetContainer hide-on-mobile" style={{ marginBottom: '20px', flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0, 255, 0, 0.3)', paddingBottom: '8px', marginBottom: '12px' }}>
        <span style={{ backgroundColor: 'var(--color-primary)', color: '#000', padding: '2px 6px', borderRadius: '3px', marginRight: '10px', fontSize: '0.9rem', textShadow: 'none' }}>🐧</span>
        <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>cowsay -f tux</span>
      </div>
      <div className="WidgetContent" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '15px', borderRadius: '8px', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <pre style={{ color: 'var(--color-text)', fontSize: '0.8rem', lineHeight: '1.2', margin: 0 }}>
            {output}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CowsayWidget;