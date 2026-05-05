// HomePage.jsx — DTC pharma hero, mega-nav era. Cleaner, more confident, less editorial.

// useReveal — IntersectionObserver-based scroll reveal. Returns ref to attach.
const useReveal = (opts = {}) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { el.classList.add("is-in"); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { el.classList.add("is-in"); io.unobserve(el); } });
    }, { threshold: opts.threshold ?? 0.15, rootMargin: opts.rootMargin ?? "0px 0px -60px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
};
window.useReveal = useReveal;

// Reveal — wraps children in a div with reveal class
const Reveal = ({ as: Tag = "div", variant = "pf-reveal", style, children, ...rest }) => {
  const ref = useReveal();
  return <Tag ref={ref} className={variant} style={style} {...rest}>{children}</Tag>;
};
window.Reveal = Reveal;

const HomePage = () => {
  const app = useApp();
  const C = window.PF_CATALOG;
  const { Icon } = window;
  const bestSellers = C.homepageBestSellers(8);
  const featured = bestSellers[0];

  return (
    <div>
      {/* HERO — dark glass with vial cluster */}
      <Hero />

      {/* LOT DROP TICKER — strip between hero and trust */}
      <LotTicker />

      {/* TRUST STRIP — sits on dark, bridges hero into next section */}
      <TrustStrip />

      {/* CATEGORY GRID */}
      <CategoryGrid />

      {/* BEST SELLERS */}
      <BestSellers products={bestSellers.slice(0, 8)} />

      {/* WHY US — comparison table */}
      <WhyUs />

      {/* FEATURED COMPOUND — full-bleed editorial spread */}
      <FeaturedCompound product={featured} />

      {/* SCIENCE / PROCESS */}
      <ProcessSection />

      {/* TESTIMONIALS */}
      <Testimonials />

      {/* FAQ — accordion */}
      <FAQ />

      {/* JOURNAL */}
      <JournalTeaser />

      {/* CTA */}
      <ClosingCTA />
    </div>
  );
};

// =================== HERO ===================
const Hero = () => {
  const app = useApp();
  const C = window.PF_CATALOG;
  const { Icon } = window;
  const heroVials = C.homepageBestSellers(3);
  return (
    <section style={{ position: "relative", overflow: "hidden", marginTop: -1, background: "linear-gradient(180deg, #08122A 0%, #0E1A33 50%, #13234A 100%)", color: "#fff" }}>
      <div className="pf-starfield" style={{ position: "absolute", inset: 0, opacity: 0.7 }}></div>
      {/* Big radial glow */}
      <div style={{ position: "absolute", right: "-10%", top: "10%", width: 720, height: 720, background: "radial-gradient(circle, rgba(79,138,247,0.35), transparent 60%)", filter: "blur(20px)", pointerEvents: "none" }}></div>
      <div style={{ position: "absolute", left: "-10%", bottom: "-10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(122,162,255,0.18), transparent 60%)", pointerEvents: "none" }}></div>

      <div className="pf-wrap" style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", minHeight: 720, paddingBlock: "80px 96px" }}>
        {/* LEFT — Headline */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 16px 6px 6px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 999, marginBottom: 28, backdropFilter: "blur(8px)" }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, background: "var(--pf-blue)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon.check size={12} color="#fff" />
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.82)", letterSpacing: "0.01em" }}>Third-party HPLC · 99.2% avg purity</span>
          </div>
          <h1 style={{
            fontFamily: "var(--pf-display)", fontWeight: 600,
            fontSize: "clamp(44px, 5.6vw, 78px)",
            lineHeight: 1.02, letterSpacing: "-0.032em",
            margin: "0 0 24px", color: "#fff",
          }}>
            Research-grade peptides.<br/>
            <span style={{ fontFamily: "var(--pf-serif)", fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.015em", background: "linear-gradient(135deg, #B8D2EE 0%, #7AA2FF 60%, #4F8AF7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Verified before they ship.
            </span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "rgba(255,255,255,0.72)", maxWidth: 520, margin: "0 0 36px" }}>
            Pharmaceutical-grade compounds for laboratory research. Lyophilized, sealed under nitrogen, lot-traced and shipped with a third-party Certificate of Analysis on every order.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
            <button onClick={() => app.navigate("products")} className="pf-btn pf-btn--primary pf-btn--lg" style={{ padding: "0 28px" }}>
              Shop the catalog
              <Icon.arrowRight size={14} style={{ marginLeft: 4 }} />
            </button>
            <button onClick={() => app.navigate("about")} className="pf-btn pf-btn--ghost-dark pf-btn--lg">View lab reports</button>
          </div>
          {/* Trust pills */}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.10)" }}>
            {[
              { v: "99.2%", l: "Avg purity" },
              { v: "27", l: "Compounds" },
              { v: "48hr", l: "Median ship" },
              { v: "3rd-party", l: "HPLC tested" },
            ].map((t) => (
              <div key={t.l}>
                <div style={{ fontSize: 24, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>{t.v}</div>
                <div style={{ fontSize: 11, fontFamily: "var(--pf-mono)", color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>{t.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Vial cluster */}
        <div style={{ position: "relative", height: 620, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* radial halo behind vials */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(79,138,247,0.4), transparent 55%)", filter: "blur(40px)" }}></div>
          {/* floor reflection */}
          <div style={{ position: "absolute", left: "12%", right: "12%", bottom: 80, height: 40, background: "radial-gradient(ellipse, rgba(79,138,247,0.30), transparent 70%)", filter: "blur(20px)" }}></div>
          {/* center vial — biggest, slight forward */}
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", animation: "pf-float-a 8s ease-in-out infinite", zIndex: 3 }}>
            <window.Vial name={heroVials[0]?.title || "GLP-3 RT"} dose="20 mg" size="md" bg="none" image={false} />
          </div>
          {/* left vial — tilted back */}
          <div style={{ position: "absolute", left: "-2%", top: "58%", transform: "translateY(-50%) rotate(-12deg)", animation: "pf-float-b 9s ease-in-out infinite", zIndex: 1 }}>
            <window.Vial name={heroVials[1]?.title || "NAD+"} dose="500 mg" size="xs" bg="none" tilt={0} image={false} />
          </div>
          {/* right vial — tilted forward */}
          <div style={{ position: "absolute", right: "-4%", top: "60%", transform: "translateY(-50%) rotate(14deg)", animation: "pf-float-c 10s ease-in-out infinite", zIndex: 2 }}>
            <window.Vial name={heroVials[2]?.title || "ARA-290"} dose="10 mg" size="xs" bg="none" tilt={0} image={false} />
          </div>
          {/* tiny label tag, top-right — above the cluster */}
          <div style={{ position: "absolute", right: 0, top: 0, padding: "10px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, backdropFilter: "blur(8px)", animation: "pf-fade-in 1s ease 0.3s both", whiteSpace: "nowrap" }}>
            <div style={{ fontFamily: "var(--pf-mono)", fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", marginBottom: 2 }}>Latest lot</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>B-0042 · 02.2026</div>
          </div>
          {/* tiny label tag, bottom-left */}
          <div style={{ position: "absolute", left: 0, bottom: 0, padding: "10px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, backdropFilter: "blur(8px)", animation: "pf-fade-in 1s ease 0.5s both", whiteSpace: "nowrap" }}>
            <div style={{ fontFamily: "var(--pf-mono)", fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", marginBottom: 2 }}>HPLC verified</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Freedom Diagnostics</div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pf-float-a { 0%,100% { transform: translate(-50%, -50%) translateY(0); } 50% { transform: translate(-50%, -50%) translateY(-14px); } }
        @keyframes pf-float-b { 0%,100% { transform: translateY(-50%) translateY(0px) rotate(-12deg); } 50% { transform: translateY(-50%) translateY(-12px) rotate(-12deg); } }
        @keyframes pf-float-c { 0%,100% { transform: translateY(-50%) translateY(0px) rotate(14deg); } 50% { transform: translateY(-50%) translateY(-16px) rotate(14deg); } }
        @keyframes pf-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </section>
  );
};

// =================== TRUST STRIP ===================
const TrustStrip = () => {
  const items = [
    { i: "🚚", h: "Fast shipping", s: "Same-day before 2pm CT" },
    { i: "🔬", h: "Third-party tested", s: "Every lot HPLC verified" },
    { i: "🧪", h: "99%+ purity", s: "Pharmaceutical grade" },
    { i: "🛡️", h: "Lot-traced", s: "COA on every order" },
  ];
  return (
    <section style={{ background: "#0E1A33", color: "#fff", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="pf-wrap pf-reveal-stagger" ref={useReveal()} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, padding: "32px 24px" }}>
        {items.map((t, i) => (
          <div key={t.h} style={{
            display: "flex", alignItems: "center", gap: 16,
            paddingInline: 24,
            borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none",
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(79,138,247,0.12)", border: "1px solid rgba(79,138,247,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <TrustIcon name={t.h} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t.h}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{t.s}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const TrustIcon = ({ name }) => {
  const { Icon } = window;
  const c = "#7AA2FF";
  if (name.includes("ship")) return <Icon.truck size={20} color={c} />;
  if (name.includes("Third")) return <Icon.beaker size={20} color={c} />;
  if (name.includes("purity")) return <Icon.badge size={20} color={c} />;
  return <Icon.shield size={20} color={c} />;
};

// =================== CATEGORY GRID ===================
const CategoryGrid = () => {
  const app = useApp();
  const cats = [
    { id: "metabolic", h: "Metabolic", s: "GLP family, weight & insulin research", count: 5 },
    { id: "longevity", h: "Longevity", s: "Epithalon, NAD+ pathway studies", count: 4 },
    { id: "recovery", h: "Recovery & Repair", s: "BPC-157, TB-500, tissue repair", count: 6 },
    { id: "cognitive", h: "Cognitive", s: "Selank, Semax nootropic peptides", count: 4 },
    { id: "growth", h: "Growth & GH", s: "CJC, Ipamorelin secretagogues", count: 5 },
    { id: "skin", h: "Skin & Pigment", s: "GHK-Cu, melanocyte research", count: 3 },
  ];
  return (
    <section style={{ padding: "96px 0 64px", background: "var(--pf-paper)" }}>
      <div className="pf-wrap">
        <Reveal style={{ display: "flex", alignItems: "end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="pf-eyebrow" style={{ marginBottom: 12 }}>Browse by goal</div>
            <h2 style={{ fontSize: "clamp(34px, 4.2vw, 52px)", fontFamily: "var(--pf-display)", fontWeight: 600, letterSpacing: "-0.028em", margin: 0, lineHeight: 1.04 }}>Compound categories</h2>
          </div>
          <button onClick={() => app.navigate("products")} className="pf-btn pf-btn--ghost pf-btn--sm">View all 27 →</button>
        </Reveal>
        <div className="pf-reveal-stagger" ref={useReveal()} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {cats.map((c, i) => (
            <button key={c.id}
              onClick={() => app.navigate("products", { category: c.id })}
              style={{
                background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 14,
                padding: "32px 28px 28px", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                display: "flex", flexDirection: "column", gap: 18, position: "relative", overflow: "hidden",
                transition: "border-color 200ms, transform 200ms, box-shadow 200ms",
                minHeight: 200,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--pf-blue)"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 14px 32px rgba(14,26,51,0.10)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--pf-line)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg, rgba(79,138,247,0.12), rgba(79,138,247,0.04))", border: "1px solid rgba(79,138,247,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CategoryIcon id={c.id} />
                </div>
                <span className="pf-mono" style={{ fontSize: 11, color: "var(--pf-text-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{c.count} compounds</span>
              </div>
              <div style={{ marginTop: "auto" }}>
                <div style={{ fontSize: 19, fontWeight: 600, color: "var(--pf-ink)", letterSpacing: "-0.01em", marginBottom: 6 }}>{c.h}</div>
                <div style={{ fontSize: 14, color: "var(--pf-text-2)", lineHeight: 1.5 }}>{c.s}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

const CategoryIcon = ({ id }) => {
  const { Icon } = window;
  const c = "var(--pf-blue)";
  switch (id) {
    case "metabolic": return <Icon.activity size={22} color={c} />;
    case "longevity": return <Icon.clock size={22} color={c} />;
    case "recovery": return <Icon.heart size={22} color={c} />;
    case "cognitive": return <Icon.brain size={22} color={c} />;
    case "growth": return <Icon.trending size={22} color={c} />;
    case "skin": return <Icon.droplet size={22} color={c} />;
    default: return <Icon.sparkles size={22} color={c} />;
  }
};

// =================== BEST SELLERS ===================
const BestSellers = ({ products }) => {
  const app = useApp();
  const C = window.PF_CATALOG;
  return (
    <section style={{ padding: "64px 0 96px", background: "var(--pf-paper)" }}>
      <div className="pf-wrap">
        <Reveal style={{ display: "flex", alignItems: "end", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="pf-eyebrow" style={{ marginBottom: 12 }}>Most ordered</div>
            <h2 style={{ fontSize: "clamp(34px, 4.2vw, 52px)", fontFamily: "var(--pf-display)", fontWeight: 600, letterSpacing: "-0.028em", margin: 0, lineHeight: 1.04 }}>The catalog, well represented</h2>
            <p style={{ fontSize: 16, color: "var(--pf-text-2)", margin: "14px 0 0", maxWidth: 540, lineHeight: 1.55 }}>Eight compounds shipping in volume this quarter. Each lot HPLC-verified before release.</p>
          </div>
        </Reveal>
        <div className="pf-reveal-stagger" ref={useReveal()} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {products.map((p) => <PremiumCard key={p.handle} product={p} />)}
        </div>
        <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
          <button onClick={() => app.navigate("products")} className="pf-btn pf-btn--primary pf-btn--lg">See all products →</button>
        </div>
      </div>
    </section>
  );
};

const PremiumCard = ({ product }) => {
  const app = useApp();
  const C = window.PF_CATALOG;
  const v = C.lowestInStockVariant(product);
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={() => app.navigate("product", { handle: product.handle })}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        cursor: "pointer", display: "flex", flexDirection: "column",
        background: "linear-gradient(180deg, #0E1A33 0%, #14213D 100%)",
        borderRadius: 14, overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        transition: "transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
        transform: hover ? "translateY(-4px)" : "none",
        boxShadow: hover ? "0 20px 40px rgba(8,18,42,0.30)" : "none",
        borderColor: hover ? "rgba(79,138,247,0.45)" : "rgba(255,255,255,0.08)",
      }}>
      <div style={{ position: "relative", aspectRatio: "1 / 1", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div className="pf-starfield" style={{ position: "absolute", inset: 0, opacity: 0.45 }}></div>
        <div style={{ position: "absolute", inset: "10% 10%", background: "radial-gradient(circle, rgba(79,138,247,0.25), transparent 60%)", filter: "blur(20px)" }}></div>
        <div style={{ position: "absolute", left: 12, top: 12, padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", fontFamily: "var(--pf-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>{product.purity}</div>
        <button aria-label="Add to wishlist" onClick={(e) => { e.stopPropagation(); }} style={{ position: "absolute", right: 12, top: 12, width: 32, height: 32, borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <window.Icon.heart size={14} />
        </button>
        <div style={{ position: "relative", transform: hover ? "translateY(-4px) scale(1.02)" : "none", transition: "transform 240ms ease" }}>
          <window.Vial name={product.title} dose={v.size} size="sm" bg="none" />
        </div>
      </div>
      <div style={{ padding: "18px 18px 18px", color: "#fff", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.005em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.title}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.subtitle}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontFamily: "var(--pf-mono)", fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: "0.04em" }}>From <span style={{ color: "#fff", fontWeight: 600, fontFamily: "var(--pf-sans)", fontSize: 16, letterSpacing: "-0.01em", marginLeft: 4 }}>${(C.fromPriceCents(product)/100).toFixed(0)}</span></span>
          <button onClick={(e) => { e.stopPropagation(); app.pickAndAddToCart(product.handle, 1); }} aria-label="Add to cart" style={{
            width: 36, height: 36, borderRadius: 999,
            background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)",
            color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 160ms, transform 160ms",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--pf-blue)"; e.currentTarget.style.transform = "scale(1.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.10)"; e.currentTarget.style.transform = "none"; }}>
            <window.Icon.bag size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// =================== FEATURED COMPOUND ===================
const FeaturedCompound = ({ product }) => {
  const app = useApp();
  const C = window.PF_CATALOG;
  if (!product) return null;
  const v = C.lowestInStockVariant(product);
  return (
    <section style={{ background: "linear-gradient(180deg, #08122A 0%, #13234A 100%)", color: "#fff", position: "relative", overflow: "hidden" }}>
      <div className="pf-starfield" style={{ position: "absolute", inset: 0, opacity: 0.55 }}></div>
      <div style={{ position: "absolute", left: "30%", top: "20%", width: 600, height: 600, background: "radial-gradient(circle, rgba(79,138,247,0.25), transparent 60%)", filter: "blur(40px)", pointerEvents: "none" }}></div>
      <div className="pf-wrap" style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", paddingBlock: 120 }}>
        <Reveal variant="pf-reveal-x">
          <div className="pf-eyebrow pf-eyebrow--dark" style={{ marginBottom: 16 }}>Featured compound</div>
          <h2 style={{ fontFamily: "var(--pf-display)", fontWeight: 600, fontSize: "clamp(40px, 5vw, 68px)", lineHeight: 1.02, letterSpacing: "-0.03em", margin: "0 0 20px", color: "#fff" }}>
            {product.title}
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "rgba(255,255,255,0.75)", margin: "0 0 32px", maxWidth: 520 }}>
            {product.long}
          </p>
          <dl style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "10px 24px", fontSize: 13, marginBottom: 32, paddingBlock: 24, borderTop: "1px solid rgba(255,255,255,0.10)", borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
            <dt style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--pf-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Sequence</dt>
            <dd style={{ margin: 0, color: "#fff", fontFamily: "var(--pf-mono)" }}>{product.sequenceMass}</dd>
            <dt style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--pf-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Purity</dt>
            <dd style={{ margin: 0, color: "var(--pf-blue-soft)", fontWeight: 600 }}>{product.purity}</dd>
            <dt style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--pf-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Form</dt>
            <dd style={{ margin: 0 }}>Lyophilized powder</dd>
            <dt style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--pf-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Lot</dt>
            <dd style={{ margin: 0, fontFamily: "var(--pf-mono)" }}>#{product.lot} · 02.2026</dd>
          </dl>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => app.navigate("product", { handle: product.handle })} className="pf-btn pf-btn--primary pf-btn--lg">View product →</button>
            <button onClick={() => app.pickAndAddToCart(product.handle, 1)} className="pf-btn pf-btn--ghost-dark pf-btn--lg">Add to cart · from {C.formatPrice(C.fromPriceCents(product))}</button>
          </div>
        </Reveal>
        <Reveal variant="pf-reveal-scale" style={{ position: "relative", height: 580, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(79,138,247,0.45), transparent 60%)", filter: "blur(40px)" }}></div>
          <div style={{ animation: "pf-float-y 7s ease-in-out infinite", transform: "scale(0.9)" }}>
            <window.Vial name={product.title} dose={v.size} size="xl" bg="none" image={false} />
          </div>
        </Reveal>
      </div>
      <style>{`@keyframes pf-float-y { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }`}</style>
    </section>
  );
};

// =================== PROCESS ===================
const ProcessSection = () => {
  const steps = [
    { n: "01", h: "Synthesis", s: "Solid-phase synthesis under cleanroom conditions" },
    { n: "02", h: "Purification", s: "Reverse-phase HPLC with multi-step gradient" },
    { n: "03", h: "Verification", s: "Independent third-party identity & potency assay" },
    { n: "04", h: "Lyophilization", s: "Freeze-dried into amber vials, sealed under nitrogen" },
    { n: "05", h: "Release", s: "Lot COA generated, retention sample stored" },
  ];
  return (
    <section style={{ padding: "120px 0", background: "var(--pf-paper)" }}>
      <div className="pf-wrap">
        <Reveal style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 64px" }}>
          <div className="pf-eyebrow" style={{ marginBottom: 12 }}>How we work</div>
          <h2 style={{ fontFamily: "var(--pf-display)", fontWeight: 600, fontSize: "clamp(34px, 4.2vw, 52px)", lineHeight: 1.04, letterSpacing: "-0.028em", margin: "0 0 16px" }}>From synthesis to your bench</h2>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: "var(--pf-text-2)", margin: 0 }}>Five steps. We retain reference samples for every lot and document each step on the COA.</p>
        </Reveal>
        <div className="pf-reveal-stagger" ref={useReveal()} style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {steps.map((step, i) => (
            <div key={step.n} style={{ position: "relative", padding: "28px 24px", background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 12 }}>
              <div style={{ fontFamily: "var(--pf-mono)", fontSize: 12, letterSpacing: "0.12em", color: "var(--pf-blue)", marginBottom: 18 }}>{step.n}</div>
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--pf-ink)", marginBottom: 6 }}>{step.h}</div>
              <div style={{ fontSize: 13, color: "var(--pf-text-2)", lineHeight: 1.55 }}>{step.s}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// =================== TESTIMONIALS ===================
const Testimonials = () => {
  const t = [
    { q: "Consistent purity across lots and the COA arrives with the order. Easiest supplier I've worked with in five years.", a: "Dr. M. Thornton", role: "Independent Lab · Boulder CO", stars: 5 },
    { q: "Properly cold-chained, sealed correctly. Reconstitution behaves as expected, every time.", a: "@toddxp", role: "Verified buyer", stars: 5 },
    { q: "Asked a lot of detailed questions before the first order. Their team answered every one of them, no fluff.", a: "Lisa P.", role: "Research Coordinator", stars: 5 },
    { q: "Fast shipping, great packaging. The vials arrived intact and the QR-linked COA was a nice touch.", a: "@johnf", role: "Verified buyer", stars: 5 },
  ];
  return (
    <section style={{ padding: "120px 0", background: "linear-gradient(180deg, #13234A 0%, #0E1A33 100%)", color: "#fff", position: "relative", overflow: "hidden" }}>
      <div className="pf-starfield" style={{ position: "absolute", inset: 0, opacity: 0.5 }}></div>
      <div className="pf-wrap" style={{ position: "relative" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="pf-eyebrow pf-eyebrow--dark" style={{ marginBottom: 12 }}>What researchers say</div>
          <h2 style={{ fontFamily: "var(--pf-display)", fontWeight: 600, fontSize: "clamp(34px, 4.2vw, 52px)", lineHeight: 1.04, letterSpacing: "-0.028em", margin: 0, color: "#fff" }}>Trusted by labs across the US</h2>
        </Reveal>
        <div className="pf-reveal-stagger" ref={useReveal()} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {t.map((x, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 2, color: "var(--pf-blue-soft)" }}>
                {Array.from({ length: x.stars }).map((_, k) => <span key={k}>★</span>)}
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,0.85)" }}>"{x.q}"</p>
              <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{x.a}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{x.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// =================== JOURNAL ===================
const JournalTeaser = () => {
  const app = useApp();
  const posts = [
    { tag: "Method", title: "Reconstituting lyophilized peptides", date: "Apr 12, 2026", read: "6 min", excerpt: "A practical guide to bacteriostatic water ratios, vial handling and storage." },
    { tag: "Quality", title: "How we read a Certificate of Analysis", date: "Mar 28, 2026", read: "8 min", excerpt: "Identity, potency, contaminants — what a good HPLC certificate actually shows." },
    { tag: "Storage", title: "Cold-chain handling and transit", date: "Mar 14, 2026", read: "5 min", excerpt: "Temperature ranges, transit windows, and what to do when shipments delay." },
  ];
  return (
    <section style={{ padding: "120px 0", background: "#fff" }}>
      <div className="pf-wrap">
        <Reveal style={{ display: "flex", alignItems: "end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="pf-eyebrow" style={{ marginBottom: 12 }}>From the journal</div>
            <h2 style={{ fontFamily: "var(--pf-display)", fontWeight: 600, fontSize: "clamp(34px, 4.2vw, 52px)", lineHeight: 1.04, letterSpacing: "-0.028em", margin: 0 }}>Method notes & guides</h2>
          </div>
          <button onClick={() => app.navigate("blog")} className="pf-btn pf-btn--ghost pf-btn--sm">All entries →</button>
        </Reveal>
        <div className="pf-reveal-stagger" ref={useReveal()} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {posts.map((p, i) => (
            <article key={i} onClick={() => app.navigate("post", { slug: i })} style={{ cursor: "pointer", background: "var(--pf-paper)", borderRadius: 14, overflow: "hidden", border: "1px solid var(--pf-line)", transition: "transform 200ms, border-color 200ms, box-shadow 200ms" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--pf-blue)"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(14,26,51,0.10)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--pf-line)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ height: 220, position: "relative", background: `linear-gradient(135deg, hsl(${220 + i*8}, 55%, 22%) 0%, hsl(${230 + i*8}, 55%, 14%) 100%)`, overflow: "hidden" }}>
                <div className="pf-starfield" style={{ position: "absolute", inset: 0, opacity: 0.5 }}></div>
                <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 70% 50%, rgba(79,138,247,0.30), transparent 60%)" }}></div>
                <div style={{ position: "absolute", left: 20, top: 20, padding: "5px 12px", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", fontFamily: "var(--pf-mono)", fontSize: 10, letterSpacing: "0.12em", color: "#fff", textTransform: "uppercase" }}>{p.tag}</div>
                <div style={{ position: "absolute", left: 20, bottom: 20, color: "rgba(255,255,255,0.55)", fontFamily: "var(--pf-mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>{String(i+1).padStart(2,"0")} · {p.read}</div>
              </div>
              <div style={{ padding: 24 }}>
                <h3 style={{ fontSize: 20, fontFamily: "var(--pf-display)", fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.015em", margin: "0 0 10px" }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: "var(--pf-text-2)", lineHeight: 1.55, margin: "0 0 16px" }}>{p.excerpt}</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--pf-text-3)", fontFamily: "var(--pf-mono)" }}>
                  <span>{p.date}</span><span>{p.read} read</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

// =================== CTA ===================
const ClosingCTA = () => {
  const app = useApp();
  return (
    <section style={{ padding: "96px 0 120px", background: "var(--pf-paper)" }}>
      <div className="pf-wrap">
        <div style={{
          background: "linear-gradient(135deg, #08122A 0%, #14213D 50%, #1B2D5C 100%)",
          borderRadius: 24, padding: "80px 64px",
          color: "#fff", position: "relative", overflow: "hidden",
          textAlign: "center",
        }}>
          <div className="pf-starfield" style={{ position: "absolute", inset: 0, opacity: 0.5 }}></div>
          <div style={{ position: "absolute", top: "-40%", left: "-10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(79,138,247,0.30), transparent 60%)", filter: "blur(40px)" }}></div>
          <div style={{ position: "absolute", bottom: "-40%", right: "-10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(122,162,255,0.25), transparent 60%)", filter: "blur(40px)" }}></div>
          <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
            <div className="pf-eyebrow pf-eyebrow--dark" style={{ marginBottom: 16 }}>Open the catalog</div>
            <h2 style={{ fontFamily: "var(--pf-display)", fontWeight: 600, fontSize: "clamp(40px, 5.5vw, 68px)", lineHeight: 1.02, letterSpacing: "-0.032em", margin: "0 0 20px", color: "#fff" }}>
              The catalog opens here.<br/>
              <span style={{ fontFamily: "var(--pf-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--pf-blue-soft)" }}>Documented, traced, shipped today.</span>
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.72)", lineHeight: 1.55, margin: "0 0 36px" }}>
              Free shipping on orders over $200. Every vial documented, lot-traced, and HPLC verified.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => app.navigate("products")} className="pf-btn pf-btn--primary pf-btn--lg">Shop the catalog →</button>
              <button onClick={() => app.navigate("contact")} className="pf-btn pf-btn--ghost-dark pf-btn--lg">Talk to the lab</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

window.HomePage = HomePage;

// =================== LOT TICKER ===================
const LotTicker = () => {
  const items = [
    { lot: "B-0042", c: "GLP-3 RT", d: "02.2026", purity: "99.4%" },
    { lot: "B-0041", c: "ARA-290", d: "02.2026", purity: "99.1%" },
    { lot: "B-0040", c: "Wolverine 10", d: "01.2026", purity: "98.9%" },
    { lot: "B-0039", c: "NAD+ 500", d: "01.2026", purity: "99.6%" },
    { lot: "B-0038", c: "Tesamorelin", d: "01.2026", purity: "99.2%" },
    { lot: "B-0037", c: "BPC-157", d: "12.2025", purity: "99.5%" },
  ];
  const row = [...items, ...items];
  return (
    <div style={{ background: "#08122A", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", padding: "14px 0" }}>
      <div style={{ display: "flex", gap: 48, animation: "pf-marquee 50s linear infinite", whiteSpace: "nowrap" }}>
        {row.map((it, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.7)", fontFamily: "var(--pf-mono)", fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--pf-blue)", boxShadow: "0 0 10px var(--pf-blue)" }}></span>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>NEW LOT</span>
            <span style={{ color: "#fff", fontWeight: 600 }}>{it.lot}</span>
            <span>·</span>
            <span style={{ color: "#fff" }}>{it.c}</span>
            <span>·</span>
            <span>{it.purity}</span>
            <span>·</span>
            <span>{it.d}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes pf-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
};

// =================== WHY US (comparison) ===================
const WhyUs = () => {
  const rows = [
    { label: "Independent third-party HPLC testing", us: true, them: "Sometimes" },
    { label: "Per-lot Certificate of Analysis", us: true, them: "Per-product only" },
    { label: "Same-day shipping (before 2pm CT)", us: true, them: "3–5 day handling" },
    { label: "Cold-chain insulated packaging", us: true, them: "Standard envelope" },
    { label: "Mass-spec verified identity", us: true, them: "Not disclosed" },
    { label: "USA-based founder & lab", us: true, them: "Drop-shipped" },
  ];
  return (
    <section style={{ padding: "120px 0", background: "var(--pf-paper)" }}>
      <div className="pf-wrap">
        <Reveal style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
          <div style={{ position: "sticky", top: 100 }}>
            <div className="pf-eyebrow" style={{ marginBottom: 18 }}>Why peptidesfarma</div>
            <h2 style={{ fontFamily: "var(--pf-display)", fontWeight: 600, fontSize: "clamp(38px, 4.4vw, 60px)", lineHeight: 1.03, letterSpacing: "-0.03em", margin: "0 0 24px", color: "var(--pf-ink)" }}>
              Pharmaceutical standards.<br/>
              <span style={{ fontFamily: "var(--pf-serif)", fontStyle: "italic", fontWeight: 400, color: "var(--pf-blue)" }}>Without the markup.</span>
            </h2>
            <p style={{ fontSize: 17, color: "var(--pf-ink-2)", lineHeight: 1.6, marginBottom: 32, maxWidth: 460 }}>
              Most peptide vendors operate as resellers — repackaging bulk material with no documentation. We synthesize, test, and ship from a single facility. Every claim on this site is auditable.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => window.useApp().navigate("about")} className="pf-btn pf-btn--primary">Read the standard →</button>
            </div>
          </div>
          <div className="pf-reveal-stagger" ref={useReveal()} style={{ background: "#fff", border: "1px solid var(--pf-line)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 110px", padding: "16px 24px", borderBottom: "1px solid var(--pf-line)", background: "var(--pf-paper-2)", fontFamily: "var(--pf-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--pf-ink-3)" }}>
              <div>Standard</div>
              <div style={{ textAlign: "center", color: "var(--pf-blue)" }}>Us</div>
              <div style={{ textAlign: "center" }}>Most</div>
            </div>
            {rows.map((r, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 110px 110px", padding: "20px 24px", borderBottom: i < rows.length - 1 ? "1px solid var(--pf-line)" : "none", alignItems: "center", fontSize: 14 }}>
                <div style={{ color: "var(--pf-ink)", fontWeight: 500 }}>{r.label}</div>
                <div style={{ textAlign: "center" }}>
                  <span style={{ display: "inline-flex", width: 28, height: 28, borderRadius: 999, background: "rgba(79,138,247,0.12)", color: "var(--pf-blue)", alignItems: "center", justifyContent: "center" }}>
                    <window.Icon.check size={14} />
                  </span>
                </div>
                <div style={{ textAlign: "center", color: "var(--pf-ink-3)", fontSize: 12 }}>{r.them}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// =================== FAQ ACCORDION ===================
const FAQ = () => {
  const items = [
    { q: "Are these products for human consumption?", a: "No. All compounds sold by peptidesfarma are intended for laboratory and research use only. They are not approved by the FDA for human consumption, treatment, or diagnostic use. By placing an order you confirm your understanding of this." },
    { q: "What documentation comes with my order?", a: "Every shipment includes a per-lot Certificate of Analysis showing HPLC purity, mass-spec identity confirmation, endotoxin testing, and the date the lot was tested. COAs are also available for download from your account before purchase." },
    { q: "Where do you synthesize and test?", a: "Synthesis is performed at our partner cleanroom facility under solid-phase peptide synthesis protocols. Independent verification is conducted by Freedom Diagnostics (HPLC + LC-MS) on every lot before release." },
    { q: "How is the product shipped?", a: "Orders before 2pm CT ship same-day from Texas via USPS Priority or UPS Ground (your choice at checkout). All shipments include cold packs in insulated mailers; orders over $200 ship free." },
    { q: "What is your reshipment policy?", a: "If a vial arrives damaged, contaminated, or mis-labeled, we'll reship same-day at no charge. Photograph the issue within 48 hours of delivery and email support@peptidesfarma.com with your order number." },
    { q: "Do you ship internationally?", a: "Currently we ship to the United States, Canada, UK, Australia, and most EU countries. Customs holds remain the responsibility of the buyer. International orders ship within 1–2 business days of receipt." },
  ];
  const [open, setOpen] = React.useState(0);
  return (
    <section style={{ padding: "120px 0", background: "#fff", borderTop: "1px solid var(--pf-line)" }}>
      <div className="pf-wrap" style={{ maxWidth: 960 }}>
        <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="pf-eyebrow" style={{ marginBottom: 16 }}>Common questions</div>
          <h2 style={{ fontFamily: "var(--pf-display)", fontWeight: 600, fontSize: "clamp(38px, 4.4vw, 60px)", lineHeight: 1.03, letterSpacing: "-0.03em", margin: 0, color: "var(--pf-ink)" }}>
            Answers, not asterisks.
          </h2>
        </Reveal>
        <div ref={useReveal()} className="pf-reveal-stagger" style={{ display: "flex", flexDirection: "column", gap: 0, borderTop: "1px solid var(--pf-line)" }}>
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{ borderBottom: "1px solid var(--pf-line)" }}>
                <button onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{ width: "100%", textAlign: "left", padding: "28px 8px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, fontFamily: "inherit" }}>
                  <span style={{ fontFamily: "var(--pf-display)", fontSize: 22, fontWeight: 600, color: "var(--pf-ink)", letterSpacing: "-0.015em" }}>{it.q}</span>
                  <span style={{
                    flexShrink: 0, width: 36, height: 36, borderRadius: 999,
                    background: isOpen ? "var(--pf-ink)" : "var(--pf-paper-2)",
                    color: isOpen ? "#fff" : "var(--pf-ink)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 200ms ease", transform: isOpen ? "rotate(45deg)" : "none",
                  }}>
                    <window.Icon.plus size={14} />
                  </span>
                </button>
                <div style={{
                  maxHeight: isOpen ? 200 : 0,
                  overflow: "hidden",
                  transition: "max-height 360ms cubic-bezier(0.22, 1, 0.36, 1), padding 200ms ease",
                  paddingBottom: isOpen ? 28 : 0,
                  paddingLeft: 8, paddingRight: 64,
                }}>
                  <p style={{ fontSize: 16, color: "var(--pf-ink-2)", lineHeight: 1.7, margin: 0 }}>{it.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
