// Chrome.jsx — Navbar, AnnouncementBar, Footer, AgeGate, Toasts, SearchModal
const { Icon } = window;

const AnnouncementBar = () => {
  const items = [
    "Free shipping on lab orders over $200",
    "Take 10% off — code RESEARCH10",
    "COA included with every vial",
    "Same-day processing before 2pm CT",
  ];
  // marquee, but slow & restrained
  return (
    <div className="pf-announcement-bar" style={{ background: "var(--pf-ink-3)", color: "var(--pf-dark-text)", borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", height: 32, display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 48, animation: "pf-marquee 38s linear infinite", whiteSpace: "nowrap", paddingLeft: "100%" }}>
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} style={{ fontFamily: "var(--pf-mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(231,236,247,0.7)" }}>
            <span style={{ color: "var(--pf-blue-soft)", marginRight: 8 }}>◆</span>{t}
          </span>
        ))}
      </div>
      <style>{`@keyframes pf-marquee { from { transform: translateX(0) } to { transform: translateX(-66%) } }`}</style>
    </div>
  );
};

const Wordmark = ({ color = "#fff", size = 18 }) => (
  <span style={{ fontFamily: "var(--pf-display)", fontWeight: 600, fontSize: size, letterSpacing: "-0.02em", color, display: "inline-flex", alignItems: "baseline" }}>
    peptides<span style={{ color: "var(--pf-blue-soft)" }}>farma</span>
  </span>
);

const PFMonogram = ({ size = 32, bg = "var(--pf-ink)" }) => (
  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, borderRadius: 8, background: bg, color: "#fff", fontFamily: "var(--pf-display)", fontWeight: 600, fontSize: size * 0.42, letterSpacing: "-0.02em" }}>
    pf
  </span>
);

const Navbar = ({ dark = true }) => {
  const app = useApp();
  const C = window.PF_CATALOG;
  const [scrolled, setScrolled] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState(null); // 'shop' | 'science' | null
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const closeTimer = React.useRef(null);

  // Close mobile drawer on route change
  React.useEffect(() => { setMobileOpen(false); }, [app.route.name, app.route.params]);
  // Lock body scroll when mobile drawer open
  React.useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileOpen]);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const open = (key) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(key);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };

  return (
    <header
      onMouseLeave={scheduleClose}
      style={{
        position: "sticky", top: 0, zIndex: 40,
        background: scrolled ? "rgba(8,18,42,0.92)" : "rgba(8,18,42,0.62)",
        backdropFilter: "saturate(160%) blur(18px)",
        WebkitBackdropFilter: "saturate(160%) blur(18px)",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(255,255,255,0.04)",
        color: "#fff",
        transition: "background 220ms ease, border-color 220ms ease",
      }}>
      <div className="pf-wrap pf-nav-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
        <a onClick={() => app.navigate("home")} style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 12 }}>
          <PFMonogram size={32} bg="var(--pf-blue)" />
          <Wordmark color="#fff" size={15} />
        </a>
        <nav className="pf-nav-desktop" style={{ display: "flex", gap: 4, alignItems: "center", whiteSpace: "nowrap" }}>
          <NavTrigger label="Catalog" active={openMenu === "shop"} onEnter={() => open("shop")} onClick={() => app.navigate("products")} />
          <NavTrigger label="Science" active={openMenu === "science"} onEnter={() => open("science")} onClick={() => app.navigate("about")} />
          <NavLink label="Journal" onEnter={scheduleClose} onClick={() => app.navigate("blog")} />
          <NavLink label="Contact" onEnter={scheduleClose} onClick={() => app.navigate("contact")} />
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button aria-label="Search" onClick={() => app.setSearchOpen(true)} style={navIconBtn} className="pf-nav-desktop"><Icon.search /></button>
          <button aria-label="Account" onClick={() => app.navigate(app.mockUser ? "account" : "login")} style={navIconBtn} className="pf-nav-desktop"><Icon.user /></button>
          <button aria-label="Cart" onClick={() => app.setDrawerOpen(true)} style={{ ...navIconBtn, position: "relative" }}>
            <Icon.bag />
            {app.cartCount > 0 && (
              <span style={{
                position: "absolute", top: 6, right: 6,
                minWidth: 18, height: 18, padding: "0 5px",
                background: "var(--pf-blue)", color: "#fff",
                borderRadius: 999, fontSize: 10, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontVariantNumeric: "tabular-nums",
              }}>{app.cartCount}</span>
            )}
          </button>
          <button aria-label="Menu" onClick={() => setMobileOpen(true)} className="pf-nav-mobile-toggle" style={{ ...navIconBtn, display: "none" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="17" y2="6" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="14" x2="17" y2="14" /></svg>
          </button>
        </div>
      </div>

      {/* MEGA MENU PANEL — desktop only */}
      {openMenu === "shop" && <MegaShopPanel onClose={() => setOpenMenu(null)} />}
      {openMenu === "science" && <MegaSciencePanel onClose={() => setOpenMenu(null)} />}

      {/* MOBILE DRAWER */}
      <MobileNavDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
};

// --------- Mobile drawer ---------
const MobileNavDrawer = ({ open, onClose }) => {
  const app = useApp();
  const [openSection, setOpenSection] = React.useState(null);
  const cats = [
    { id: "metabolic", label: "Metabolic" },
    { id: "longevity", label: "Longevity" },
    { id: "recovery", label: "Recovery & Repair" },
    { id: "cognitive", label: "Cognitive" },
    { id: "growth", label: "Growth & GH" },
    { id: "skin", label: "Skin & Pigment" },
    { id: "specialty", label: "Specialty" },
  ];
  const go = (route, params) => { app.navigate(route, params); onClose(); };
  return (
    <div className={`pf-nav-mobile-drawer${open ? " is-open" : ""}`} aria-hidden={!open}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <PFMonogram size={28} bg="var(--pf-blue)" />
          <Wordmark color="#fff" size={14} />
        </div>
        <button onClick={onClose} aria-label="Close menu" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "#fff", width: 36, height: 36, borderRadius: 999, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <window.Icon.close size={16} />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <button onClick={() => setOpenSection(openSection === "shop" ? null : "shop")} className="pf-nav-mobile-link">
          <span>Catalog</span>
          <span style={{ transform: openSection === "shop" ? "rotate(180deg)" : "none", transition: "transform 200ms" }}><window.Icon.chevDown size={14} /></span>
        </button>
        {openSection === "shop" && (
          <div>
            <button className="pf-nav-mobile-sublink" onClick={() => go("products")}>All compounds</button>
            {cats.map(c => (
              <button key={c.id} className="pf-nav-mobile-sublink" onClick={() => go("products", { category: c.id })}>{c.label}</button>
            ))}
          </div>
        )}
        <button onClick={() => go("about")} className="pf-nav-mobile-link"><span>Science</span><window.Icon.arrowRight size={16} /></button>
        <button onClick={() => go("blog")} className="pf-nav-mobile-link"><span>Journal</span><window.Icon.arrowRight size={16} /></button>
        <button onClick={() => go("contact")} className="pf-nav-mobile-link"><span>Contact</span><window.Icon.arrowRight size={16} /></button>
        <button onClick={() => { app.setSearchOpen(true); onClose(); }} className="pf-nav-mobile-link"><span>Search</span><window.Icon.search size={16} /></button>
        <button onClick={() => go(app.mockUser ? "account" : "login")} className="pf-nav-mobile-link"><span>{app.mockUser ? "Account" : "Log in"}</span><window.Icon.user size={16} /></button>
      </div>
      <div style={{ padding: 20, borderTop: "1px solid rgba(255,255,255,0.10)" }}>
        <button onClick={() => go("products")} className="pf-btn pf-btn--primary pf-btn--lg" style={{ width: "100%" }}>Shop the catalog →</button>
        <div style={{ marginTop: 14, fontSize: 11, color: "rgba(255,255,255,0.5)", textAlign: "center", fontFamily: "var(--pf-mono)", letterSpacing: "0.08em", textTransform: "uppercase" }}>For research use only</div>
      </div>
    </div>
  );
};

const NavTrigger = ({ label, active, onEnter, onClick }) => (
  <button
    onMouseEnter={onEnter}
    onClick={onClick}
    style={{
      height: 40, padding: "0 14px",
      background: active ? "rgba(255,255,255,0.08)" : "transparent",
      border: "none", color: "#fff",
      fontSize: 14, fontWeight: 500, fontFamily: "inherit",
      cursor: "pointer", borderRadius: 999,
      display: "inline-flex", alignItems: "center", gap: 6,
      transition: "background 160ms",
    }}>
    {label}
    <window.Icon.chevDown size={11} style={{ opacity: 0.55, transform: active ? "rotate(180deg)" : "none", transition: "transform 200ms" }} />
  </button>
);

const NavLink = ({ label, onClick, onEnter }) => (
  <button
    onMouseEnter={onEnter}
    onClick={onClick}
    style={{
      height: 40, padding: "0 14px",
      background: "transparent", border: "none", color: "#fff",
      fontSize: 14, fontWeight: 500, fontFamily: "inherit",
      cursor: "pointer", borderRadius: 999,
      transition: "background 160ms",
    }}
    onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
    onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
  >
    {label}
  </button>
);

const navIconBtn = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 40, height: 40, borderRadius: 999,
  background: "transparent", border: "none", color: "#fff",
  cursor: "pointer",
};

const MegaShopPanel = ({ onClose }) => {
  const app = useApp();
  const C = window.PF_CATALOG;
  const [hover, setHover] = React.useState(null);
  const featured = C.homepageBestSellers(4);
  const cats = [
    { id: "metabolic", label: "Metabolic", desc: "GLP-3, Tesamorelin family" },
    { id: "longevity", label: "Longevity", desc: "Epithalon, NAD+" },
    { id: "recovery", label: "Recovery & Repair", desc: "BPC-157, TB-500, Wolverine" },
    { id: "cognitive", label: "Cognitive", desc: "Selank, Semax, Cerebrolysin" },
    { id: "growth", label: "Growth & GH", desc: "CJC, Ipamorelin, MK-677" },
    { id: "skin", label: "Skin & Pigment", desc: "GHK-Cu, Melanotan" },
    { id: "specialty", label: "Specialty", desc: "Single-target compounds" },
  ];
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, top: "100%",
      background: "rgba(8,18,42,0.96)",
      backdropFilter: "saturate(160%) blur(20px)",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      color: "#fff",
      animation: "pf-mega-in 180ms ease",
    }}>
      <div className="pf-wrap" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 48, padding: "32px 24px 40px" }}>
        {/* Categories list */}
        <div>
          <div style={{ fontFamily: "var(--pf-mono)", fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 16 }}>Browse by goal</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 2 }}>
            {cats.map((c) => (
              <li key={c.id}>
                <button
                  onMouseEnter={() => setHover(c.id)}
                  onClick={() => { app.navigate("products", { category: c.id }); onClose(); }}
                  style={{
                    width: "100%", textAlign: "left", padding: "10px 12px",
                    background: hover === c.id ? "rgba(79,138,247,0.12)" : "transparent",
                    border: "none", color: "#fff", borderRadius: 8,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                    transition: "background 140ms",
                    fontFamily: "inherit",
                  }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{c.label}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{c.desc}</div>
                  </div>
                  <span style={{ opacity: hover === c.id ? 1 : 0.3, transition: "opacity 140ms" }}>→</span>
                </button>
              </li>
            ))}
            <li style={{ marginTop: 8, padding: "0 12px" }}>
              <button onClick={() => { app.navigate("products"); onClose(); }} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", padding: "8px 14px", borderRadius: 999, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                View all 27 compounds →
              </button>
            </li>
          </ul>
        </div>

        {/* Featured products */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ fontFamily: "var(--pf-mono)", fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Most ordered this quarter</div>
            <a onClick={() => { app.navigate("products"); onClose(); }} style={{ cursor: "pointer", fontSize: 12, color: "var(--pf-blue-soft)" }}>See all best sellers →</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {featured.map((p) => {
              const v = C.lowestInStockVariant(p);
              return (
                <button key={p.handle}
                  onClick={() => { app.navigate("product", { handle: p.handle }); onClose(); }}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12, padding: 14,
                    cursor: "pointer", textAlign: "left",
                    display: "flex", flexDirection: "column", gap: 10,
                    transition: "background 140ms, border-color 140ms, transform 140ms",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(79,138,247,0.10)"; e.currentTarget.style.borderColor = "rgba(79,138,247,0.45)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "none"; }}>
                  <div style={{ height: 130, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, rgba(79,138,247,0.18), transparent)", borderRadius: 8 }}>
                    <window.Vial name={p.title} dose={v.size} size="sm" bg="none" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{p.subtitle}</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <span style={{ fontSize: 11, fontFamily: "var(--pf-mono)", color: "rgba(255,255,255,0.5)" }}>{p.purity}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>${(C.fromPriceCents(p)/100).toFixed(0)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`@keyframes pf-mega-in { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: none } }`}</style>
    </div>
  );
};

const MegaSciencePanel = ({ onClose }) => {
  const app = useApp();
  const items = [
    { h: "Quality standards", s: "How we synthesize, purify and verify every lot", route: "about" },
    { h: "Lab reports", s: "Browse the COA library by lot or compound", route: "about" },
    { h: "Method notes", s: "Reconstitution, storage, handling guides", route: "blog" },
    { h: "Cold-chain shipping", s: "How vials reach your bench intact", route: "about" },
  ];
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, top: "100%",
      background: "rgba(8,18,42,0.96)",
      backdropFilter: "saturate(160%) blur(20px)",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      color: "#fff",
      animation: "pf-mega-in 180ms ease",
    }}>
      <div className="pf-wrap" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48, padding: "32px 24px 40px" }}>
        <div>
          <div style={{ fontFamily: "var(--pf-mono)", fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 16 }}>How we work</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {items.map((i) => (
              <button key={i.h} onClick={() => { app.navigate(i.route); onClose(); }} style={{
                background: "transparent", border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 10, padding: "16px 18px", textAlign: "left", cursor: "pointer",
                color: "#fff", fontFamily: "inherit",
                transition: "background 140ms, border-color 140ms",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(79,138,247,0.10)"; e.currentTarget.style.borderColor = "rgba(79,138,247,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{i.h}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{i.s}</div>
              </button>
            ))}
          </div>
        </div>
        <div style={{
          background: "linear-gradient(135deg, rgba(79,138,247,0.20), rgba(79,138,247,0.04))",
          border: "1px solid rgba(79,138,247,0.30)",
          borderRadius: 12, padding: 24,
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontFamily: "var(--pf-mono)", fontSize: 11, letterSpacing: "0.16em", color: "var(--pf-blue-soft)", textTransform: "uppercase", marginBottom: 12 }}>Featured note</div>
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>How to read a Certificate of Analysis</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.55 }}>Identity, potency, contaminants — what a good HPLC certificate actually shows.</div>
          </div>
          <button onClick={() => { app.navigate("blog"); onClose(); }} style={{
            alignSelf: "flex-start", marginTop: 16,
            background: "var(--pf-blue)", color: "#fff", border: "none",
            padding: "10px 18px", borderRadius: 999, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
          }}>Read the guide →</button>
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  const app = useApp();
  return (
    <footer className="pf-starfield" style={{ color: "var(--pf-dark-text)", paddingTop: 80, marginTop: 0 }}>
      <div className="pf-wrap">
        {/* Newsletter band */}
        <div className="pf-card--dark pf-news-band" style={{ padding: "40px 48px", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 40, alignItems: "center", marginBottom: 64, borderRadius: 16 }}>
          <div>
            <div className="pf-eyebrow pf-eyebrow--dark" style={{ marginBottom: 12 }}>The lab notebook</div>
            <h3 style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 8px", color: "#fff" }}>
              Method notes, COAs and new lots, in your inbox.
            </h3>
            <p style={{ color: "var(--pf-dark-text-2)", margin: 0, fontSize: 14, lineHeight: 1.6 }}>
              Once a fortnight. Lot drops, reconstitution references, lab handling tips. No marketing junk.
            </p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); app.addToast("Subscribed. Check your inbox.", "success"); }} style={{ display: "flex", gap: 8 }}>
            <input type="email" required placeholder="researcher@lab.org" style={{
              flex: 1, height: 52, padding: "0 18px",
              background: "rgba(255,255,255,0.06)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.16)", borderRadius: 999,
              fontSize: 14, fontFamily: "inherit", outline: "none",
            }} />
            <button type="submit" className="pf-btn pf-btn--primary pf-btn--lg">Subscribe</button>
          </form>
        </div>

        <div className="pf-footer-cols" style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(4, 1fr)", gap: 48, paddingBottom: 64 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <PFMonogram size={32} bg="var(--pf-blue)" />
              <Wordmark color="#fff" size={16} />
            </div>
            <p style={{ color: "var(--pf-dark-text-2)", fontSize: 13, lineHeight: 1.7, margin: 0, maxWidth: 320 }}>
              Pharmaceutical-grade research peptides. Independently HPLC verified, lot-traced and supplied for laboratory use only.
            </p>
            <div style={{ display: "flex", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
              <span className="pf-chip">SSL Secured</span>
              <span className="pf-chip">99%+ Purity</span>
              <span className="pf-chip">Same-Day Ship</span>
            </div>
          </div>
          {[
            { h: "Catalog", links: ["All products", "Best sellers", "New lots", "Lab support"] },
            { h: "Company", links: ["About", "Lab reports", "Press", "Contact"] },
            { h: "Support", links: ["FAQ", "Shipping & returns", "COA library", "Wholesale"] },
            { h: "Legal", links: ["Research disclaimer", "Terms", "Privacy", "Cookie policy"] },
          ].map((col) => (
            <div key={col.h}>
              <div style={{ fontFamily: "var(--pf-mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pf-dark-text-2)", marginBottom: 16 }}>{col.h}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map(l => <li key={l}><a style={{ color: "#fff", fontSize: 13, opacity: 0.8, cursor: "pointer", textDecoration: "none" }}>{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="pf-rule pf-rule--dark"></div>
        <div className="pf-footer-bottom" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0 40px", flexWrap: "wrap", gap: 16 }}>
          <div style={{ fontSize: 12, color: "var(--pf-dark-text-2)" }}>
            © 2026 Peptidesfarma · For research purposes only. Not for human consumption.
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "var(--pf-dark-text-2)" }}>
            <span>VISA</span><span>MC</span><span>AMEX</span><span>Apple Pay</span><span>Google Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const AgeGate = () => {
  const app = useApp();
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const ok = localStorage.getItem("pf_age_ok");
    if (!ok) setOpen(true);
  }, []);
  if (!open) return null;
  const accept = () => {
    localStorage.setItem("pf_age_ok", "1");
    app.setAgePassed(true);
    setOpen(false);
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(8,18,42,0.78)", backdropFilter: "blur(8px)" }}>
      <div className="pf-card" style={{ width: "min(520px, 92vw)", padding: 36, borderRadius: 16, background: "#fff" }}>
        <div className="pf-eyebrow" style={{ marginBottom: 12 }}>Verify before entering</div>
        <h2 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.01em", margin: "0 0 12px" }}>This site is for research professionals.</h2>
        <p style={{ fontSize: 14, color: "var(--pf-text-2)", lineHeight: 1.6, margin: "0 0 20px" }}>
          By continuing you confirm you are 21 or older and intend to use these compounds for laboratory research only. These products are not for human consumption.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={accept} className="pf-btn pf-btn--primary" style={{ flex: 1 }}>I confirm, enter site</button>
          <a href="https://www.google.com" className="pf-btn pf-btn--ghost">Leave</a>
        </div>
      </div>
    </div>
  );
};

const Toasts = () => {
  const app = useApp();
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 90, display: "flex", flexDirection: "column", gap: 8 }}>
      {app.toasts.map(t => (
        <div key={t.id} style={{
          minWidth: 240, padding: "12px 16px", borderRadius: 12,
          background: "var(--pf-ink)", color: "#fff",
          boxShadow: "var(--pf-shadow-lg)",
          display: "flex", alignItems: "center", gap: 10,
          animation: "pf-toast-in 220ms ease",
        }}>
          {t.kind === "success" && <Icon.check color="var(--pf-blue-soft)" />}
          {t.kind === "error" && <Icon.alertTri color="#FFB199" />}
          {t.kind === "info" && <Icon.info />}
          <span style={{ fontSize: 13 }}>{t.msg}</span>
        </div>
      ))}
      <style>{`@keyframes pf-toast-in { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }`}</style>
    </div>
  );
};

const SearchModal = () => {
  const app = useApp();
  const [q, setQ] = React.useState("");
  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); app.setSearchOpen(true); }
      if (e.key === "Escape") app.setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  if (!app.searchOpen) return null;
  const results = q.trim()
    ? window.PF_CATALOG.visibleCatalog().filter(p =>
        (p.title + " " + p.subtitle + " " + p.category).toLowerCase().includes(q.toLowerCase())
      ).slice(0, 8)
    : window.PF_CATALOG.homepageBestSellers(6);
  return (
    <div onClick={() => app.setSearchOpen(false)} className="pf-search-modal" style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(8,18,42,0.5)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 100 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(680px, 92vw)", background: "#fff", borderRadius: 16, boxShadow: "var(--pf-shadow-lg)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--pf-line)" }}>
          <Icon.search color="var(--pf-text-3)" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search peptides, lots, methods..." style={{ flex: 1, fontSize: 16, border: "none", outline: "none", fontFamily: "inherit" }} />
          <kbd style={{ fontFamily: "var(--pf-mono)", fontSize: 11, padding: "2px 6px", border: "1px solid var(--pf-line)", borderRadius: 4, color: "var(--pf-text-3)" }}>esc</kbd>
        </div>
        <div style={{ padding: 8, maxHeight: 480, overflowY: "auto" }}>
          <div style={{ padding: "8px 12px", fontFamily: "var(--pf-mono)", fontSize: 11, letterSpacing: "0.1em", color: "var(--pf-text-3)", textTransform: "uppercase" }}>{q.trim() ? "Results" : "Suggested"}</div>
          {results.map(p => (
            <button key={p.handle} onClick={() => { app.navigate("product", { handle: p.handle }); }} style={{
              display: "flex", width: "100%", alignItems: "center", gap: 12,
              padding: "10px 12px", border: "none", background: "transparent",
              textAlign: "left", cursor: "pointer", borderRadius: 8,
            }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--pf-paper)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: 40, height: 40, background: "var(--pf-ink)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>PF</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: "var(--pf-text-3)" }}>{p.subtitle}</div>
              </div>
              <div style={{ fontFamily: "var(--pf-mono)", fontSize: 12, color: "var(--pf-text-2)" }}>From {window.PF_CATALOG.formatPrice(window.PF_CATALOG.fromPriceCents(p))}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

window.AnnouncementBar = AnnouncementBar;
window.Navbar = Navbar;
window.Footer = Footer;
window.AgeGate = AgeGate;
window.Toasts = Toasts;
window.SearchModal = SearchModal;
window.Wordmark = Wordmark;
window.PFMonogram = PFMonogram;
