// Vial.jsx — branded vial: photo placeholder by default, SVG illustration when image={false}
// Props: name, dose, accent (brand blue), size ('xs'|'sm'|'md'|'lg'|'xl'), tilt (deg), bg ('plinth'|'none'), image (bool)

const Vial = ({ name = "BPC-157", dose = "5 mg", accent = "#4F8AF7", size = "md", tilt = 0, bg = "plinth", purity = "99%", image = true }) => {
  const widths = { xs: 64, sm: 96, md: 180, lg: 260, xl: 360 };
  const w = widths[size] || widths.md;
  const h = w * 1.85;

  // Photo placeholder branch — keeps the same outer box so layouts don't shift,
  // image is `contain`-fit so it never squishes regardless of source aspect.
  if (image) {
    return (
      <div style={{ position: "relative", width: w, height: h, transform: `rotate(${tilt}deg)`, transformOrigin: "center 70%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img
          src="assets/vial-placeholder.jpeg"
          alt={`${name} ${dose} vial`}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            display: "block",
            mixBlendMode: "multiply",
            filter: "drop-shadow(0 18px 28px rgba(8,18,42,0.28))",
          }}
        />
      </div>
    );
  }

  // unique ids per render to avoid svg id collisions
  const uid = React.useId().replace(/:/g, "_");
  const id = (s) => `${uid}-${s}`;

  return (
    <div style={{ position: "relative", width: w, height: h, transform: `rotate(${tilt}deg)`, transformOrigin: "center 70%" }}>
      <svg viewBox="0 0 200 370" width={w} height={h} style={{ overflow: "visible", display: "block" }}>
        <defs>
          {/* glass gradient */}
          <linearGradient id={id("glass")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9FBEE8" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#C7DBF2" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#5C7FA8" stopOpacity="0.85" />
          </linearGradient>
          {/* label gradient — deep navy */}
          <linearGradient id={id("label")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#13234A" />
            <stop offset="100%" stopColor="#08122A" />
          </linearGradient>
          {/* cap gradient */}
          <linearGradient id={id("cap")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2D4174" />
            <stop offset="100%" stopColor="#13234A" />
          </linearGradient>
          {/* aluminum collar */}
          <linearGradient id={id("collar")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7C8CA8" />
            <stop offset="20%" stopColor="#D6DDE9" />
            <stop offset="50%" stopColor="#A4B0C5" />
            <stop offset="80%" stopColor="#D6DDE9" />
            <stop offset="100%" stopColor="#7C8CA8" />
          </linearGradient>
          {/* liquid */}
          <linearGradient id={id("liquid")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B8D2EE" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#7AA2D8" stopOpacity="0.35" />
          </linearGradient>
          {/* plinth shadow */}
          <radialGradient id={id("shadow")} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(8,18,42,0.55)" />
            <stop offset="100%" stopColor="rgba(8,18,42,0)" />
          </radialGradient>
        </defs>

        {bg === "plinth" && (
          <ellipse cx="100" cy="350" rx="80" ry="10" fill={`url(#${id("shadow")})`} />
        )}

        {/* CAP TOP */}
        <rect x="68" y="6" width="64" height="22" rx="3" fill={`url(#${id("cap")})`} />
        <rect x="68" y="6" width="64" height="6" rx="3" fill="#0A132A" opacity="0.4" />
        {/* CAP CRIMP / collar */}
        <rect x="62" y="26" width="76" height="18" rx="2" fill={`url(#${id("collar")})`} />
        <rect x="62" y="26" width="76" height="2" fill="rgba(0,0,0,0.25)" />
        <rect x="62" y="42" width="76" height="2" fill="rgba(0,0,0,0.25)" />

        {/* GLASS BODY */}
        <path
          d="M62 44 L62 50 Q62 56 68 56 L132 56 Q138 56 138 50 L138 44 L138 320 Q138 340 118 340 L82 340 Q62 340 62 320 Z"
          fill={`url(#${id("glass")})`}
          opacity="0.55"
        />
        {/* glass outline */}
        <path
          d="M62 44 L62 320 Q62 340 82 340 L118 340 Q138 340 138 320 L138 44"
          fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1"
        />
        {/* liquid inside */}
        <path
          d="M64 200 L64 318 Q64 338 84 338 L116 338 Q136 338 136 318 L136 200 Z"
          fill={`url(#${id("liquid")})`}
        />
        {/* meniscus */}
        <ellipse cx="100" cy="200" rx="36" ry="3" fill="rgba(255,255,255,0.4)" />

        {/* LABEL — wraps around front */}
        <rect x="68" y="118" width="64" height="190" rx="4" fill={`url(#${id("label")})`} />
        {/* label inner gloss */}
        <rect x="68" y="118" width="64" height="8" fill="rgba(255,255,255,0.06)" />

        {/* Product name on label, vertical-stacked at top */}
        <text
          x="100" y="148"
          textAnchor="middle"
          fill="#fff"
          fontFamily="Inter Tight, Inter, system-ui, sans-serif"
          fontSize="13"
          fontWeight="700"
          letterSpacing="0.5"
        >
          {name.length > 9 ? name.slice(0, 9) : name}
        </text>

        {/* dose pill on label */}
        <rect x="80" y="158" width="40" height="14" rx="7" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
        <text
          x="100" y="168"
          textAnchor="middle"
          fill="#E7ECF7"
          fontFamily="JetBrains Mono, ui-monospace, monospace"
          fontSize="9"
          letterSpacing="0.5"
        >
          {dose}
        </text>

        {/* PF monogram running vertically on right side of label */}
        <text
          transform="translate(124, 290) rotate(-90)"
          fill="#fff"
          fontFamily="Inter Tight, Inter, system-ui, sans-serif"
          fontSize="14"
          fontWeight="600"
          letterSpacing="3"
        >
          PEPTIDESFARMA
        </text>

        {/* Purity chip near bottom */}
        <rect x="78" y="270" width="44" height="14" rx="2" fill="rgba(79,138,247,0.20)" stroke="rgba(79,138,247,0.45)" strokeWidth="0.5" />
        <text
          x="100" y="280"
          textAnchor="middle"
          fill={accent}
          fontFamily="JetBrains Mono, ui-monospace, monospace"
          fontSize="8"
          letterSpacing="0.6"
        >
          {purity} PURITY
        </text>

        {/* research-only footer line */}
        <text
          x="100" y="298"
          textAnchor="middle"
          fill="rgba(255,255,255,0.55)"
          fontFamily="Inter Tight, Inter, system-ui, sans-serif"
          fontSize="6"
          letterSpacing="0.4"
        >
          RESEARCH USE ONLY
        </text>

        {/* glass highlight on left edge */}
        <path
          d="M70 60 L70 320 Q70 332 80 334"
          fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4"
        />
        {/* small specular */}
        <ellipse cx="80" cy="85" rx="3" ry="14" fill="rgba(255,255,255,0.5)" />

        {/* base ring */}
        <ellipse cx="100" cy="338" rx="36" ry="4" fill="rgba(0,0,0,0.30)" />
      </svg>
    </div>
  );
};

window.Vial = Vial;
