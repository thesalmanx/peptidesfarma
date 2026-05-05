// Icons.jsx — minimal stroke icon set, sized via fontSize parent or width prop
const _i = (children, vb = "0 0 24 24") => ({ size = 20, color = "currentColor", style, ...rest }) => (
  <svg viewBox={vb} width={size} height={size} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={style} {...rest} aria-hidden="true">
    {children}
  </svg>
);

const Icon = {
  search: _i(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
  user: _i(<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>),
  bag: _i(<><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" /></>),
  heart: _i(<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />),
  close: _i(<><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>),
  chevDown: _i(<path d="m6 9 6 6 6-6" />),
  chevRight: _i(<path d="m9 6 6 6-6 6" />),
  chevLeft: _i(<path d="m15 6-6 6 6 6" />),
  plus: _i(<><path d="M12 5v14" /><path d="M5 12h14" /></>),
  minus: _i(<path d="M5 12h14" />),
  check: _i(<path d="m5 12 5 5L20 7" />),
  truck: _i(<><rect x="2" y="7" width="12" height="10" rx="1" /><path d="M14 10h4l3 3v4h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>),
  shield: _i(<><path d="M12 3 4 6v6c0 5 4 8 8 9 4-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>),
  flask: _i(<><path d="M9 3h6" /><path d="M10 3v5L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-11V3" /><path d="M7 14h10" /></>),
  doc: _i(<><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="M14 3v5h5" /><path d="M9 13h6" /><path d="M9 17h6" /></>),
  star: _i(<path d="m12 3 2.6 6 6.4.5-4.9 4.2 1.5 6.3L12 17l-5.6 3 1.5-6.3L3 9.5l6.4-.5L12 3Z" />),
  lock: _i(<><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>),
  arrowRight: _i(<><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>),
  arrowDown: _i(<><path d="M12 5v14" /><path d="m6 13 6 6 6-6" /></>),
  filter: _i(<><path d="M3 5h18" /><path d="M6 12h12" /><path d="M10 19h4" /></>),
  grid: _i(<><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>),
  rows: _i(<><rect x="3" y="4" width="18" height="5" rx="1" /><rect x="3" y="13" width="18" height="5" rx="1" /></>),
  trash: _i(<><path d="M4 7h16" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M6 7v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" /></>),
  package: _i(<><path d="m3 8 9-5 9 5-9 5-9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></>),
  alertTri: _i(<><path d="M12 4 2 21h20L12 4Z" /><path d="M12 10v5" /><circle cx="12" cy="18" r="0.8" fill="currentColor" /></>),
  info: _i(<><circle cx="12" cy="12" r="9" /><path d="M12 8v0.5" /><path d="M12 11v6" /></>),
  external: _i(<><path d="M14 4h6v6" /><path d="m20 4-9 9" /><path d="M9 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /></>),
  apple: _i(<path d="M16 13c0-3 2.4-4.4 2.5-4.5C17 6 14.5 6 13.7 6 11.7 5.8 10 7 9 7c-1 0-2.6-1.1-4-1-2 0-4 1.2-5 3-2.1 3.7-.6 9.2 1.5 12.2 1 1.5 2.3 3.1 3.9 3 1.6 0 2.2-1 4.1-1s2.4 1 4 1c1.7 0 2.7-1.5 3.7-3 .8-1.1 1.4-2.3 1.8-3.5-3.5-1.3-3.5-5.5 0-6.7Z" />),
  google: _i(<><path d="M21 12c0-.7-.1-1.4-.2-2H12v4h5.1c-.2 1.2-.9 2.3-1.9 3v2.5h3c1.8-1.6 2.8-4 2.8-7.5Z" /><path d="M12 21c2.5 0 4.6-.8 6.2-2.2l-3-2.5c-.8.6-1.9.9-3.2.9-2.4 0-4.5-1.6-5.2-3.9H3.7v2.5C5.3 19 8.4 21 12 21Z" /><path d="M6.8 13.3a5.4 5.4 0 0 1 0-3.6V7.2H3.7a9 9 0 0 0 0 9.7l3.1-2.4Z" /><path d="M12 6.6c1.4 0 2.6.5 3.5 1.4l2.6-2.6C16.6 4 14.5 3 12 3 8.4 3 5.3 5 3.7 7.7l3.1 2.4C7.5 8.2 9.6 6.6 12 6.6Z" /></>),
  // Category & trust icons (Lucide-style)
  activity: _i(<path d="M22 12h-4l-3 9L9 3l-3 9H2" />),
  clock: _i(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  sparkles: _i(<><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></>),
  brain: _i(<path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-3 3 3 3 0 0 0 1 2.2A3 3 0 0 0 4 13a3 3 0 0 0 2 2.8V18a3 3 0 0 0 6 0V5a3 3 0 0 0-3-2zM15 3a3 3 0 0 1 3 3 3 3 0 0 1 3 3 3 3 0 0 1-1 2.2A3 3 0 0 1 20 13a3 3 0 0 1-2 2.8V18a3 3 0 0 1-6 0V5a3 3 0 0 1 3-2z" />),
  trending: _i(<><path d="m3 17 6-6 4 4 8-8" /><path d="M21 7v6h-6" /></>),
  droplet: _i(<path d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12Z" />),
  zap: _i(<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />),
  award: _i(<><circle cx="12" cy="9" r="6" /><path d="m9 14-2 8 5-3 5 3-2-8" /></>),
  beaker: _i(<><path d="M9 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-10V3" /><path d="M9 3h6" /><path d="M7 14h10" /></>),
  microscope: _i(<><path d="M9 3h4v6h-4z" /><path d="M11 9v4" /><path d="M7 13h10v3a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4z" /><path d="M5 21h14" /></>),
  badge: _i(<><circle cx="12" cy="9" r="6" /><path d="M9 14v7l3-2 3 2v-7" /></>),
  rotate: _i(<><path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.7 1 6.4 2.6L21 8" /><path d="M21 3v5h-5" /></>),
  mail: _i(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>),
  phone: _i(<path d="M22 16.9V20a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1A19.5 19.5 0 0 1 5 13.4 19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1l-1.3 1.3a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6A2 2 0 0 1 22 16.9Z" />),
  pin: _i(<><path d="M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></>),
};

window.Icon = Icon;
