import { Icon } from '../../components/Icon.jsx';
const extra = {
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 3C7 2 2 8 5 15s14 7 15-12Z" />
      <path d="M4 21 15 10" />
    </>
  ),
  truck: (
    <>
      <path d="M2 5h12v12H2zM14 9h4l4 4v4h-8" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </>
  ),
  chevron: <path d="m9 5 7 7-7 7" />,
  trash: (
    <>
      <path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="13" rx="2" />
      <path d="M15 4H5a2 2 0 0 0-2 2v10" />
    </>
  ),
  qr: (
    <>
      <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h3v3h3v3h-6zM21 12h-9v9M12 3v6" />
    </>
  ),
};
export function StoreIcon({ name, size = 20 }) {
  return extra[name] ? (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {extra[name]}
    </svg>
  ) : (
    <Icon name={name} size={size} />
  );
}
