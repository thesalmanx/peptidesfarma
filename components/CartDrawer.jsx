// CartDrawer.jsx — slide-in cart drawer with line items, qty stepper, upsell, summary
const CartDrawer = () => {
  const app = useApp();
  const C = window.PF_CATALOG;
  const { Icon } = window;
  const upsell = C.upsellProduct();
  const hasPeptide = app.cart.some(l => l.handle !== "bac-water");
  const hasUpsell = app.cart.some(l => l.handle === "bac-water");
  const showUpsell = hasPeptide && !hasUpsell;
  const freeShipThreshold = 20000;
  const freeShipRemaining = Math.max(0, freeShipThreshold - app.subtotalCents);
  const pct = Math.min(100, (app.subtotalCents / freeShipThreshold) * 100);

  return (
    <>
      {app.drawerOpen && (
        <div onClick={() => app.setDrawerOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(8,18,42,0.5)", zIndex: 60, backdropFilter: "blur(4px)", animation: "pf-fade 280ms ease both" }} />
      )}
      <aside style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "min(440px, 100vw)",
        background: "#fff", zIndex: 61,
        transform: app.drawerOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 460ms cubic-bezier(.22,1,.36,1)",
        display: "flex", flexDirection: "column",
        boxShadow: "var(--pf-shadow-lg)",
      }}>
        {/* header */}
        <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--pf-line)" }}>
          <div>
            <div className="pf-eyebrow">Cart</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>Your order ({app.cartCount})</div>
          </div>
          <button onClick={() => app.setDrawerOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }} aria-label="Close cart"><Icon.close /></button>
        </div>

        {/* free ship progress */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--pf-line)", background: "var(--pf-paper)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--pf-text-2)", marginBottom: 8 }}>
            <span>{freeShipRemaining > 0 ? `Add ${C.formatPrice(freeShipRemaining)} for free shipping` : "Free shipping unlocked"}</span>
            <span className="pf-mono">{Math.round(pct)}%</span>
          </div>
          <div style={{ height: 4, background: "var(--pf-line)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "var(--pf-blue)", transition: "width 300ms ease" }} />
          </div>
        </div>

        {/* lines */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {app.cartLineDetails.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--pf-text-3)" }}>
              <div style={{ width: 64, height: 64, margin: "0 auto 16px", borderRadius: 32, background: "var(--pf-paper-2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.bag size={28} /></div>
              <div style={{ fontWeight: 600, color: "var(--pf-text)", marginBottom: 4 }}>Cart is empty</div>
              <div style={{ fontSize: 13 }}>Browse the catalog to start an order.</div>
              <button onClick={() => { app.setDrawerOpen(false); app.navigate("products"); }} className="pf-btn pf-btn--ink" style={{ marginTop: 16 }}>Shop catalog</button>
            </div>
          ) : (
            app.cartLineDetails.map(line => (
              <div key={line.handle + line.variantSize} style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 72, height: 88, background: "var(--pf-ink)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <window.Vial name={line.product?.title} dose={line.variantSize} size="xs" bg="none" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{line.product?.title}</div>
                    <div className="pf-mono" style={{ fontSize: 13, fontWeight: 600 }}>{C.formatPrice(line.lineTotalCents)}</div>
                  </div>
                  <div style={{ marginTop: 4, marginBottom: 8 }}>
                    <span className="pf-chip pf-chip--light">{line.variantSize}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <QtyStepper value={line.qty} onChange={(q) => app.updateQty(line.handle, line.variantSize, q)} />
                    <button onClick={() => app.removeLine(line.handle, line.variantSize)} style={{ background: "none", border: "none", color: "var(--pf-text-3)", cursor: "pointer", fontSize: 12, textDecoration: "underline", padding: 0 }}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* upsell */}
          {showUpsell && upsell && (
            <div style={{ marginTop: 8, border: "1px dashed var(--pf-blue-line)", borderRadius: 12, padding: 16, background: "var(--pf-blue-tint)" }}>
              <div className="pf-eyebrow" style={{ color: "var(--pf-ink)", marginBottom: 8 }}>Often added with peptides</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 56, height: 64, background: "var(--pf-ink)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <window.Vial name="BAC" dose="30mL" size="xs" bg="none" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{upsell.title}</div>
                  <div style={{ fontSize: 12, color: "var(--pf-text-2)" }}>{upsell.subtitle} · {C.formatPrice(upsell.variants[0].priceCents)}</div>
                </div>
                <button onClick={() => app.addToCart(upsell.handle, upsell.variants[0].size, 1)} className="pf-btn pf-btn--sm pf-btn--ink">Add</button>
              </div>
            </div>
          )}
        </div>

        {/* summary */}
        {app.cartLineDetails.length > 0 && (
          <div style={{ borderTop: "1px solid var(--pf-line)", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
              <span>Subtotal</span>
              <span className="pf-mono" style={{ fontWeight: 600 }}>{C.formatPrice(app.subtotalCents)}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--pf-text-3)", marginBottom: 16 }}>Tax and shipping calculated at checkout.</div>
            <button onClick={() => { app.setDrawerOpen(false); app.navigate("checkout"); }} className="pf-btn pf-btn--primary pf-btn--lg" style={{ width: "100%", marginBottom: 8 }}>
              Checkout · {C.formatPrice(app.subtotalCents)}
            </button>
            <button onClick={() => { app.setDrawerOpen(false); app.navigate("cart"); }} className="pf-btn pf-btn--ghost" style={{ width: "100%" }}>View full cart</button>
            <div style={{ marginTop: 16, padding: 12, background: "var(--pf-paper)", borderRadius: 8, fontSize: 11, color: "var(--pf-text-3)", lineHeight: 1.5 }}>
              For research purposes only. Not for human consumption. Compounds are supplied for laboratory use.
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

const QtyStepper = ({ value, onChange, min = 1, max = 99 }) => (
  <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--pf-line)", borderRadius: 999, height: 32 }}>
    <button onClick={() => onChange(Math.max(min, value - 1))} style={qtyBtn} aria-label="Decrease"><window.Icon.minus size={14} /></button>
    <span className="pf-mono" style={{ minWidth: 28, textAlign: "center", fontSize: 13, fontWeight: 600 }}>{value}</span>
    <button onClick={() => onChange(Math.min(max, value + 1))} style={qtyBtn} aria-label="Increase"><window.Icon.plus size={14} /></button>
  </div>
);
const qtyBtn = { width: 30, height: 30, border: "none", background: "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };

window.CartDrawer = CartDrawer;
window.QtyStepper = QtyStepper;
