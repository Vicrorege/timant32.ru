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
    stack: 'React · TS · Canvas / SVG',
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
    stack: 'Python · iCalendar · Regex',
    github: 'https://github.com/Vicrorege/schedule2cal',
  },
  {
    id: 'tab-constructor',
    name: 'tab-constructor',
    desc: {
      ru: 'Конструктор динамических дашбордов и интерактивных плиточных виджетов.',
      en: 'Dynamic dashboard and modular tile widget constructor system.',
    },
    stack: 'React · Django · Celery · PG',
    url: 'https://tab-constructor.ru',
  },
  {
    id: 'ha-vicro',
    name: 'ha-vicro',
    desc: {
      ru: 'Фоновый сервис-компаньон для домашней автоматизации и Home Assistant.',
      en: 'Background companion daemon for Home Assistant & self-hosted nodes.',
    },
    stack: 'Go · Python · MQTT · Linux',
    github: 'https://github.com/Vicrorege/ha-vicro',
  },
];

const ProjectsWidget = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith('ru') ? 'ru' : 'en';

  return (
    <div
      id="projects-widget"
      className="WidgetContainer ProjectsWidget"
      style={{ flexDirection: 'column', alignItems: 'stretch' }}
    >
      <div className="projects-widget-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="projects-widget-badge">📁</span>
          <span className="projects-widget-title">
            {t('section_projects', '01 / projects')}
          </span>
        </div>
        <span className="projects-widget-sublabel">~/projects</span>
      </div>

      {/* Terminal file listing style (no cards within card) */}
      <div className="projects-listing-body">
        {CURATED_PROJECTS.map((proj) => {
          const desc = proj.desc[lang] || proj.desc.ru;
          return (
            <div key={proj.id} className="project-listing-entry">
              <div className="project-entry-header">
                <span className="project-entry-name">
                  {proj.url ? (
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-entry-link"
                    >
                      {proj.name}
                    </a>
                  ) : (
                    <span>{proj.name}</span>
                  )}
                </span>
                <div className="project-entry-actions">
                  {proj.github && (
                    <a
                      href={proj.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-action-link"
                    >
                      [gh]
                    </a>
                  )}
                  {proj.url && (
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-action-link"
                    >
                      [→]
                    </a>
                  )}
                </div>
              </div>

              <div className="project-entry-desc">{desc}</div>
              <div className="project-entry-stack">{proj.stack}</div>
            </div>
          );
        })}
      </div>

      <div className="projects-widget-footer">
        <a
          href="https://github.com/Vicrorege"
          target="_blank"
          rel="noopener noreferrer"
          className="projects-gh-all"
        >
          {t('all_projects_gh', '→ all repositories on github')}
        </a>
      </div>
    </div>
  );
};

export default ProjectsWidget;
