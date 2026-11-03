export function ProductArt({ id, small = false }) {
  return <div className={`product-art art-${id}${small ? ' small-art' : ''}`} aria-hidden="true">
    <svg viewBox="0 0 220 160" fill="none">
      {id === 'P01' ? <>
        <ellipse cx="110" cy="145" rx="45" ry="5" fill="#cad8c9"/>
        <path d="M88 40V24h44v16l12 13v79a11 11 0 0 1-11 11H87a11 11 0 0 1-11-11V53Z" fill="#99b49c" stroke="#526b55" strokeWidth="2"/>
        <path d="M89 26h42v-9a5 5 0 0 0-5-5H94a5 5 0 0 0-5 5Z" fill="#4d6553"/>
        <path d="M91 21h38M88 41h44" stroke="#cbd7ca" strokeWidth="2"/>
        <rect x="77" y="67" width="66" height="44" fill="#eef0df"/>
        <path d="M98 91c3-15 19-15 23-17-1 16-12 25-23 17Z" fill="#758f6a"/>
        <path d="m99 94 15-13" stroke="#eef0df" strokeWidth="2"/>
        <path d="M84 55v73" stroke="#c8d9c5" strokeWidth="3" strokeLinecap="round"/>
      </> : id === 'P02' ? <>
        <ellipse cx="108" cy="145" rx="46" ry="5" fill="#ead9c8"/>
        <path d="m77 40 10 97a8 8 0 0 0 8 7h33a8 8 0 0 0 8-7l10-97Z" fill="#edc293" stroke="#9f7856" strokeWidth="2"/>
        <path d="m82 72 7 63a6 6 0 0 0 6 6h33a6 6 0 0 0 6-6l7-63Z" fill="#d9a05e"/>
        <path d="M75 38h73v10H75Z" fill="#fcf7eb" stroke="#bca38b" strokeWidth="2"/>
        <path d="m121 43 10-33h5l-9 33" fill="#78684f"/>
        <rect x="87" y="59" width="18" height="18" rx="4" transform="rotate(-12 87 59)" fill="#f5ddbb"/>
        <rect x="113" y="68" width="17" height="18" rx="4" transform="rotate(13 113 68)" fill="#f5ddbb"/>
        <circle cx="111" cy="111" r="18" fill="#f5d9b4"/>
        <path d="M111 99c-10-9-24 8-11 20 6 7 16 7 22-1 9-12-2-26-11-19Z" fill="#d88c66"/>
        <path d="M112 100c-1-9 5-14 12-12-1 7-5 11-12 12Z" fill="#7e9463"/>
      </> : <>
        <ellipse cx="110" cy="145" rx="42" ry="5" fill="#d2dce1"/>
        <path d="M93 33V22h34v11l10 13v84c0 8-6 13-13 13H96c-7 0-13-5-13-13V46Z" fill="#d4e5e7" stroke="#7a969f" strokeWidth="2"/>
        <rect x="91" y="12" width="38" height="13" rx="3" fill="#677f8a"/>
        <path d="M94 17h32M90 49h40M87 59h46M87 127h46" stroke="#abc4c9" strokeWidth="2"/>
        <path d="M84 74h52v42H84Z" fill="#f6f5eb"/>
        <path d="M94 93c6-8 12 8 18 0s12 8 17 0" stroke="#6a97a8" strokeWidth="3" strokeLinecap="round"/>
        <path d="M91 44v24M91 122v10" stroke="#f4faf7" strokeWidth="3" strokeLinecap="round"/>
      </>}
    </svg>
  </div>;
}
