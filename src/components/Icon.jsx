const paths = {
  bag: <><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  reset: <><path d="M4 9a8 8 0 1 1 0 6M4 3v6h6"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></>,
  moon: <path d="M20 15a8.5 8.5 0 0 1-11-11A8.5 8.5 0 1 0 20 15Z"/>,
  code: <><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/></>,
  close: <path d="m6 6 12 12M6 18 18 6"/>,
  plus: <path d="M5 12h14M12 5v14"/>,
  minus: <path d="M5 12h14"/>,
  check: <path d="m5 12 4 4L19 6"/>,
};

export function Icon({ name, size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">{paths[name]}</svg>;
}
