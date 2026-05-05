// ProductDetailPage.jsx — gallery, variant picker, dosing, COA, related products
const ProductDetailPage = () => {
  const app = useApp();
  const C = window.PF_CATALOG;
  const { Icon } = window;
  const handle = app.route.params.handle || "glp-3-rt";
  const product = C.productByHandle(handle);
  const initialVariant = C.lowestInStockVariant(product);
  const [variant, setVariant] = React.useState(initialVariant);
  const [qty, setQty] = React.useState(1);
  const [tab, setTab] = React.useState("description");

  React.useEffect(() => { setVariant(C.lowestInStockVariant(product)); }, [handle]);

  const related = C.visibleCatalog().filter(p => p.handle !== handle && p.category === product.category).slice(0, 4);

  return (
    <div>
      {/* HERO with vial */}
      <section className="pf-starfield" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div className="pf-wrap" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--pf-dark-text-2)", marginBottom: 16, fontFamily: "var(--pf-mono)", letterSpacing: "0.08em" }}>
              <a onClick={() => app.navigate("home")} style={{ cursor: "pointer", opacity: 0.7 }}>HOME</a>
              <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>
              <a onClick={() => app.navigate("products")} style={{ cursor: "pointer", opacity: 0.7 }}>PRODUCTS</a>
              <span style={{ margin: "0 8px", opacity: 0.5 }}>/</span>
              <span style={{ color: "#fff" }}>{product.title.toUpperCase()}</span>
            </div>
            <h1 style={{ fontSize: 64, fontWeight: 600, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 12px", lineHeight: 1 }}>{product.title}</h1>
            <div style={{ color: "var(--pf-dark-text-2)", fontSize: 16, marginBottom: 20 }}>{product.subtitle}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
              <span className="pf-chip"><Icon.check size={12} color="var(--pf-blue-soft)" /> {product.purity} purity</span>
              <span className="pf-chip">Lot {product.lot}</span>
              <span className="pf-chip">HPLC verified</span>
            </div>
            <dl className="pf-spec" style={{ color: "var(--pf-dark-text)", marginBottom: 24 }}>
              <dt style={{ color: "var(--pf-dark-text-2)" }}>Sequence/MW</dt><dd style={{ color: "#fff" }}>{product.sequenceMass}</dd>
              <dt style={{ color: "var(--pf-dark-text-2)" }}>Form</dt><dd style={{ color: "#fff" }}>Lyophilized powder</dd>
              <dt style={{ color: "var(--pf-dark-text-2)" }}>Storage</dt><dd style={{ color: "#fff" }}>-20 C, dark</dd>
              <dt style={{ color: "var(--pf-dark-text-2)" }}>Tested</dt><dd style={{ color: "#fff" }}>Freedom Diagnostics, 3rd party</dd>
            </dl>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", inset: "10% 10%", background: "radial-gradient(circle, rgba(79,138,247,0.30), transparent 60%)" }}></div>
            <window.Vial name={product.title} dose={variant.size} size="xl" />
          </div>
        </div>
      </section>

      {/* BUY BAR */}
      <section style={{ background: "var(--pf-paper)", borderTop: "1px solid var(--pf-line)", borderBottom: "1px solid var(--pf-line)" }}>
        <div className="pf-wrap" style={{ padding: "32px 0", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 40, alignItems: "center" }}>
          <div>
            <div className="pf-eyebrow" style={{ marginBottom: 8 }}>Select size</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {product.variants.map(v => {
                const oos = v.stock <= 0;
                const active = variant.size === v.size;
                return (
                  <button key={v.size} disabled={oos} onClick={() => setVariant(v)} style={{
                    padding: "12px 20px", borderRadius: 999,
                    border: `1px solid ${active ? "var(--pf-ink)" : "var(--pf-line-2)"}`,
                    background: active ? "var(--pf-ink)" : "#fff",
                    color: oos ? "var(--pf-text-3)" : (active ? "#fff" : "var(--pf-text)"),
                    cursor: oos ? "not-allowed" : "pointer", fontFamily: "inherit",
                    textDecoration: oos ? "line-through" : "none",
                    display: "flex", flexDirection: "column", alignItems: "center", minWidth: 80,
                  }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{v.size}</span>
                    <span className="pf-mono" style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{C.formatPrice(v.priceCents)}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: variant.stock <= 0 ? "var(--pf-err)" : variant.stock < 10 ? "var(--pf-warn)" : "var(--pf-ok)", fontFamily: "var(--pf-mono)", letterSpacing: 0.6, textTransform: "uppercase" }}>
              {variant.stock <= 0 ? "Out of stock" : variant.stock < 10 ? `Only ${variant.stock} in stock` : "In stock, ships today"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "flex-end" }}>
            <div style={{ textAlign: "right" }}>
              <div className="pf-eyebrow">Price</div>
              <div className="pf-mono" style={{ fontSize: 32, fontWeight: 600 }}>{C.formatPrice(variant.priceCents * qty)}</div>
            </div>
            <window.QtyStepper value={qty} onChange={setQty} />
            <button disabled={variant.stock <= 0} onClick={() => app.addToCart(product.handle, variant.size, qty)} className="pf-btn pf-btn--primary pf-btn--lg">
              <Icon.bag size={16} /> Add to cart
            </button>
          </div>
        </div>
      </section>

      {/* DETAILS TABS */}
      <section style={{ padding: "60px 0" }}>
        <div className="pf-wrap" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 60 }}>
          <div>
            <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--pf-line)", marginBottom: 24 }}>
              {[["description", "Description"], ["dosing", "Dosing & handling"], ["coa", "Certificate of Analysis"], ["notes", "Important notes"]].map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)} style={{
                  padding: "12px 20px", background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit",
                  fontSize: 14, fontWeight: 600,
                  color: tab === k ? "var(--pf-text)" : "var(--pf-text-3)",
                  borderBottom: tab === k ? "2px solid var(--pf-blue)" : "2px solid transparent",
                  marginBottom: -1,
                }}>{l}</button>
              ))}
            </div>
            {tab === "description" && (
              <div>
                <p style={{ fontSize: 16, color: "var(--pf-text-2)", lineHeight: 1.7 }}>{product.long}</p>
                <p style={{ fontSize: 14, color: "var(--pf-text-3)", marginTop: 16 }}>{product.short}</p>
              </div>
            )}
            {tab === "dosing" && (
              <div>
                <p style={{ fontSize: 14, color: "var(--pf-text-2)", lineHeight: 1.7 }}>{product.dosing}</p>
                <p style={{ marginTop: 16, fontSize: 13, color: "var(--pf-text-3)" }}>For laboratory dilution and protocol guidance only. Consult your lab safety officer for handling.</p>
              </div>
            )}
            {tab === "coa" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                  {[
                    { lot: product.lot, purity: product.purity, date: "Feb 2026", latest: true },
                    { lot: "B0041", purity: "99.1%", date: "Dec 2025", latest: false },
                  ].map((c, i) => (
                    <div key={i} className="pf-card" style={{ padding: 20 }}>
                      {c.latest && <span className="pf-chip pf-chip--light" style={{ marginBottom: 12 }}>Latest</span>}
                      <div className="pf-mono" style={{ fontSize: 32, color: "var(--pf-blue)", fontWeight: 600 }}>{c.purity}</div>
                      <div className="pf-eyebrow" style={{ marginBottom: 12 }}>Purity</div>
                      <dl className="pf-spec">
                        <dt>Variant</dt><dd>{variant.size}</dd>
                        <dt>Lot #</dt><dd className="pf-mono">{c.lot}</dd>
                        <dt>Tested</dt><dd>{c.date}</dd>
                      </dl>
                      <a href={product.coa} className="pf-btn pf-btn--ghost pf-btn--sm" style={{ width: "100%", marginTop: 16 }}><Icon.doc size={14} /> View COA PDF</a>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab === "notes" && (
              <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {product.notes.map((n, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, fontSize: 14, color: "var(--pf-text-2)", lineHeight: 1.6 }}>
                    <Icon.check size={16} color="var(--pf-blue)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <aside>
            <div className="pf-card" style={{ padding: 20, marginBottom: 16 }}>
              <div className="pf-eyebrow" style={{ marginBottom: 12 }}>Order details</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Trust icon={<Icon.truck size={18} color="var(--pf-blue)" />} h="Same-day shipping" s="Orders before 2pm CT" />
                <Trust icon={<Icon.shield size={18} color="var(--pf-blue)" />} h="Lot COA included" s="HPLC, third party tested" />
                <Trust icon={<Icon.flask size={18} color="var(--pf-blue)" />} h={`${product.purity} purity`} s="Pharmaceutical grade" />
              </div>
            </div>
            <div className="pf-card" style={{ padding: 20, background: "var(--pf-blue-tint)", borderColor: "transparent" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <Icon.alertTri size={18} color="var(--pf-ink)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--pf-ink)", marginBottom: 4 }}>For laboratory research only</div>
                  <div style={{ fontSize: 12, color: "var(--pf-text-2)", lineHeight: 1.6 }}>This product is supplied for research use. Not for human or veterinary consumption. Handle by qualified personnel only.</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section style={{ padding: "80px 0", background: "var(--pf-paper-2)" }}>
          <div className="pf-wrap">
            <h3 style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 24px" }}>Related compounds</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
              {related.map(p => <window.ProductCard key={p.handle} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const Trust = ({ icon, h, s }) => (
  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
    <div style={{ flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontWeight: 600, fontSize: 13 }}>{h}</div>
      <div style={{ fontSize: 12, color: "var(--pf-text-3)" }}>{s}</div>
    </div>
  </div>
);

window.ProductDetailPage = ProductDetailPage;
