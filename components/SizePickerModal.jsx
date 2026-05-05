// SizePickerModal.jsx — global modal for picking a variant before adding to cart
const SizePickerModal = () => {
  const app = useApp();
  const C = window.PF_CATALOG;
  const data = app.pickerProduct;
  const visible = !!data;
  const product = data?.product;
  const qty = data?.qty || 1;

  // close on ESC
  React.useEffect(() => {
    if (!visible) return;
    const onKey = (e) => { if (e.key === "Escape") app.closePicker(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible]);

  if (!visible) return null;

  return (
    <div onClick={() => app.closePicker()}
      style={{
        position: "fixed", inset: 0, zIndex: 80,
        background: "rgba(8,18,42,0.55)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
        animation: "pf-fade 220ms ease both",
      }}>
      <div onClick={(e) => e.stopPropagation()} className="pf-picker-modal"
        style={{
          width: "min(460px, 100%)", background: "#fff", borderRadius: 18,
          padding: 28, boxShadow: "0 24px 60px rgba(8,18,42,0.4)",
          animation: "pf-pop 280ms cubic-bezier(.22,1,.36,1) both",
          position: "relative",
        }}>
        <button onClick={() => app.closePicker()} aria-label="Close"
          style={{ position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: 999,
            background: "var(--pf-paper)", border: "1px solid var(--pf-line)", color: "var(--pf-ink)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
          <window.Icon.close size={16} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 12, flexShrink: 0,
            background: "linear-gradient(180deg, #1B2D5C 0%, #0E1A33 100%)",
            display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ transform: "scale(0.45)" }}>
              <window.Vial name={product.title} dose={product.variants[0].size} size="sm" bg="none" />
            </div>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="pf-eyebrow" style={{ marginBottom: 4 }}>Choose your size</div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--pf-ink)", lineHeight: 1.2 }}>{product.title}</div>
            <div style={{ fontSize: 13, color: "var(--pf-text-2)", marginTop: 2 }}>{product.subtitle}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {product.variants.map((v, i) => {
            const oos = v.stock <= 0;
            const isCheapest = v.priceCents === Math.min(...product.variants.map(x => x.priceCents));
            return (
              <button key={v.size} disabled={oos}
                onClick={() => { app.addToCart(product.handle, v.size, qty); app.closePicker(); }}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "16px 18px", borderRadius: 12,
                  border: "1px solid var(--pf-line)",
                  background: oos ? "var(--pf-paper)" : "#fff",
                  color: oos ? "var(--pf-text-3)" : "var(--pf-text)",
                  cursor: oos ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  transition: "border-color 160ms, transform 160ms, box-shadow 160ms",
                }}
                onMouseEnter={(e) => { if (!oos) { e.currentTarget.style.borderColor = "var(--pf-blue)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(79,138,247,0.12)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--pf-line)"; e.currentTarget.style.boxShadow = "none"; }}>
                <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: "var(--pf-ink)" }}>{v.size}</span>
                  {oos
                    ? <span style={{ fontSize: 11, color: "var(--pf-err)", fontFamily: "var(--pf-mono)", textTransform: "uppercase", letterSpacing: 0.6 }}>Out of stock</span>
                    : v.stock < 10
                    ? <span style={{ fontSize: 11, color: "var(--pf-warn)", fontFamily: "var(--pf-mono)", textTransform: "uppercase", letterSpacing: 0.6 }}>Low stock</span>
                    : isCheapest ? <span style={{ fontSize: 11, color: "var(--pf-blue)", fontFamily: "var(--pf-mono)", textTransform: "uppercase", letterSpacing: 0.6 }}>Best value</span>
                    : <span style={{ fontSize: 11, color: "var(--pf-ok)", fontFamily: "var(--pf-mono)", textTransform: "uppercase", letterSpacing: 0.6 }}>In stock</span>
                  }
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="pf-mono" style={{ fontWeight: 700, fontSize: 15, color: "var(--pf-ink)" }}>{C.formatPrice(v.priceCents)}</span>
                  {!oos && (
                    <span style={{ width: 28, height: 28, borderRadius: 999, background: "var(--pf-blue)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <window.Icon.arrowRight size={14} />
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--pf-line)", fontSize: 12, color: "var(--pf-text-3)", display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <span>✓ Free shipping over $200</span>
          <span>✓ COA included</span>
          <span>✓ Same-day before 2pm CT</span>
        </div>
      </div>
      <style>{`
        @keyframes pf-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pf-pop { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
};

window.SizePickerModal = SizePickerModal;
