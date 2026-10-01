import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      // Legacy phrases (retained for typewriter easter egg / compatibility)
      phrase1: 'я тимант.',
      phrase2: 'я делаю ботов в тг на заказ.',
      phrase3: 'я бездельник.',
      phrase4: 'я люблю <a href="https://t.me/Vaaaalerix">@Vaaaalerix</a>.',
      phrase5: 'а ещё, криво верстаю сайты на React.',
      phrase6: 'милый ублюдок.',

      // Navigation & Identity
      switch_identity_to: 'перейти на {{name}}',
      switch_preview: 'превью {{name}}',
      legacy_badge: 'старый интернет-дом',
      current_badge: 'актуальный вход',

      // Sections
      section_projects: '01 / projects',
      section_now: '02 / now',
      section_contact: '03 / contact',
      section_devrandom: '04 / dev/random',
      devrandom_subtitle: 'there is more here than necessary.',

      // Projects
      all_projects_gh: '→ все репозитории на github',
      project_code: 'код',
      project_demo: 'демо',

      // Now / Activity
      now_music_playing: '♫ {{track}} — {{artist}}',
      now_music_idle: '♫ тишина · lastfm',
      now_git_pushed: 'git pushed to {{repo}} · {{time}}',
      now_git_idle: 'git 0 коммитов сегодня',
      now_srv_summary: 'srv {{online}}/{{total}} онлайн',
      now_srv_nominal: 'все системы в норме',

      // Contacts
      contact: 'Telegram:',
      contacts: 'Контакты',
      telegram_primary: 'Telegram (основной)',
      telegram_legacy: 'Telegram (legacy)',
      email_label: 'Почта',
      github_label: 'GitHub',

      // dev/random launchers
      lab_terminal: 'open terminal',
      lab_game_of_life: 'game of life',
      lab_bfs: 'pathfinding bfs',
      lab_cowsay: 'cowsay tux',
      lab_servers: 'server nodes',
      lab_calendar: 'calendar',
      lab_countdown: 'countdown',
      lab_telegram_relay: 'telegram relay',
      lab_matrix: 'enter the matrix',
      lab_close: 'закрыть',

      // Widgets legacy compatibility
      telegram_channel: 'timant32info',
      telegram_post_id: '4',
      servers: 'Серверы',
      online: 'В сети',
      calendar: 'Календарь',
      calendar_week_hint: 'Клик — неделя',
      github: 'GitHub',
      github_repos: 'Репозитории',
      github_contribs: 'Коммиты',
      github_followers: 'Фолловеры',
      github_latest: 'Свежий пуш',
      github_in_last_year: 'вкладов за год',
      github_contrib_count: 'вкладов',
      github_less: 'меньше',
      github_more: 'больше',
      github_just_now: 'только что',
      github_yesterday: 'вчера',
    },
  },
  en: {
    translation: {
      phrase1: "I'm timant32.",
      phrase2: 'I create Telegram bots on order.',
      phrase3: "I'm a loafer.",
      phrase4: 'I love <a href="https://t.me/Vaaaalerix">@Vaaaalerix</a>.',
      phrase5: 'I also do some wonky React site layouts.',
      phrase6: 'cute bastard.',

      // Navigation & Identity
      switch_identity_to: 'switch to {{name}}',
      switch_preview: 'preview {{name}}',
      legacy_badge: 'legacy digital home',
      current_badge: 'current identity',

      // Sections
      section_projects: '01 / projects',
      section_now: '02 / now',
      section_contact: '03 / contact',
      section_devrandom: '04 / dev/random',
      devrandom_subtitle: 'there is more here than necessary.',

      // Projects
      all_projects_gh: '→ all repositories on github',
      project_code: 'code',
      project_demo: 'demo',

      // Now / Activity
      now_music_playing: '♫ {{track}} — {{artist}}',
      now_music_idle: '♫ idle · lastfm',
      now_git_pushed: 'git pushed to {{repo}} · {{time}}',
      now_git_idle: 'git 0 commits today',
      now_srv_summary: 'srv {{online}}/{{total}} online',
      now_srv_nominal: 'systems nominal',

      // Contacts
      contact: 'Telegram:',
      contacts: 'Contact',
      telegram_primary: 'Telegram (main)',
      telegram_legacy: 'Telegram (legacy)',
      email_label: 'Email',
      github_label: 'GitHub',

      // dev/random launchers
      lab_terminal: 'open terminal',
      lab_game_of_life: 'game of life',
      lab_bfs: 'pathfinding bfs',
      lab_cowsay: 'cowsay tux',
      lab_servers: 'server nodes',
      lab_calendar: 'calendar',
      lab_countdown: 'countdown',
      lab_telegram_relay: 'telegram relay',
      lab_matrix: 'enter the matrix',
      lab_close: 'close',

      // Widgets legacy compatibility
      telegram_channel: 'timant32info',
      telegram_post_id: '7',
      servers: 'Servers',
      online: 'Online',
      calendar: 'Calendar',
      calendar_week_hint: 'Click for week view',
      github: 'GitHub',
      github_repos: 'Repositories',
      github_contribs: 'Commits',
      github_followers: 'Followers',
      github_latest: 'Latest push',
      github_in_last_year: 'contribs in past year',
      github_contrib_count: 'contribs',
      github_less: 'less',
      github_more: 'more',
      github_just_now: 'just now',
      github_yesterday: 'yesterday',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
