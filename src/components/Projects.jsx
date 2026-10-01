import React from 'react';
import { useTranslation } from 'react-i18next';

export const CURATED_PROJECTS = [
  {
    id: 'axioma-board',
    name: 'AxiomaBoard',
    desc: {
      ru: 'Интерактивная координатная прямая и канвас-доска для математики и графики.',
      en: 'Interactive coordinate number line & visual math board canvas.',
    },
    stack: 'React · TypeScript · Canvas / SVG · Vite',
    tag: 'canvas / webapp',
    url: 'https://axioma.vicrorege.com',
    github: 'https://github.com/Vicrorege/axioma-board',
  },
  {
    id: 'schedule2cal',
    name: 'schedule2cal',
    desc: {
      ru: 'Парсер вузовского расписания и автоматическая синхронизация с .ics календарями.',
      en: 'University schedule parser & automated RFC-5545 .ics calendar synchronization.',
    },
    stack: 'Python · iCalendar · Regex · Automation',
    tag: 'automation / cli',
    github: 'https://github.com/Vicrorege/schedule2cal',
  },
  {
    id: 'tab-constructor',
    name: 'tab-constructor',
    desc: {
      ru: 'Конструктор динамических дашбордов и интерактивных плиточных виджетов.',
      en: 'Dynamic dashboard and modular tile widget constructor system.',
    },
    stack: 'React · Django · Celery · PostgreSQL',
    tag: 'fullstack / dashboard',
    url: 'https://tab-constructor.ru',
  },
  {
    id: 'ha-vicro',
    name: 'ha-vicro',
    desc: {
      ru: 'Фоновый сервис-компаньон для домашней автоматизации и Home Assistant.',
      en: 'Background companion daemon for Home Assistant & self-hosted nodes.',
    },
    stack: 'Go · Python · MQTT / REST · Linux',
    tag: 'daemon / iot',
    github: 'https://github.com/Vicrorege/ha-vicro',
  },
  {
    id: 'mail-tg-forwarder',
    name: 'mail-tg-forwarder',
    desc: {
      ru: 'Сервис пересылки и фильтрации почты Mailcow в Telegram с защитой от спама.',
      en: 'Mailcow email-to-Telegram relay daemon with rule-based filtering.',
    },
    stack: 'Python · Telegram Bot API · IMAP · Docker',
    tag: 'service / telegram',
    github: 'https://github.com/Vicrorege/mail-tg-forwarder',
  },
  {
    id: 'timant32-web',
    name: 'vicrorege.com / timant32.ru',
    desc: {
      ru: 'Двухдоменная цифровая среда, персональный терминал и self-hosted сервисы.',
      en: 'Dual-identity digital environment, web terminal, and personal hub.',
    },
    stack: 'React 19 · Vite · Nginx · Docker · i18n',
    tag: 'terminal / web',
    github: 'https://github.com/Vicrorege/timant32.ru',
  },
];

const Projects = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en';

  return (
    <section id="projects" className="section-block projects-section">
      <div className="section-header">
        <h2 className="section-title">{t('section_projects', '01 / projects')}</h2>
      </div>

      <div className="projects-grid">
        {CURATED_PROJECTS.map((proj) => {
          const description = proj.desc[lang] || proj.desc.ru;
          return (
            <article key={proj.id} className="project-item">
              <div className="project-item-header">
                <h3 className="project-name">
                  {proj.url ? (
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link"
                    >
                      {proj.name}
                    </a>
                  ) : (
                    <span>{proj.name}</span>
                  )}
                </h3>
                <span className="project-tag">{proj.tag}</span>
              </div>

              <p className="project-desc">{description}</p>

              <div className="project-footer">
                <span className="project-stack">{proj.stack}</span>
                <div className="project-actions">
                  {proj.github && (
                    <a
                      href={proj.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-sublink"
                    >
                      [ github ]
                    </a>
                  )}
                  {proj.url && (
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-sublink"
                    >
                      [ web ]
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="projects-all-link">
        <a
          href="https://github.com/Vicrorege"
          target="_blank"
          rel="noopener noreferrer"
          className="all-gh-link"
        >
          {t('all_projects_gh', '→ all repositories on github')}
        </a>
      </div>
    </section>
  );
};

export default Projects;
