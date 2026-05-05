// ProductCard.jsx — peptora-style card on dark plinth, used in grids
const ProductCard = ({ product }) => {
  const app = useApp();
  const C = window.PF_CATALOG;
  const { Icon } = window;
  const lowestVariant = C.lowestInStockVariant(product);
  const fromPrice = C.fromPriceCents(product);

  const onAdd = (e) => {
    e.stopPropagation();
    app.pickAndAddToCart(product.handle, 1);
  };

  return (
    <div className="pf-reveal is-in" style={{ position: "relative" }}>
      <div onClick={() => app.navigate("product", { handle: product.handle })} style={{
        cursor: "pointer",
        background: "linear-gradient(180deg, #1B2D5C 0%, #0E1A33 70%, #4F6B9C 100%)",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        height: 280,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div className="pf-starfield" style={{ position: "absolute", inset: 0, opacity: 0.5 }}></div>
        <button aria-label="Save" style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 999, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2 }}>
          <Icon.heart size={14} />
        </button>
        <div style={{ position: "relative", zIndex: 1, transform: "translateY(20px)" }}>
          <window.Vial name={product.title} dose={lowestVariant.size} size="md" bg="none" />
        </div>
      </div>
      <div style={{ paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.2 }}>{product.title}</div>
          <div style={{ fontSize: 12, color: "var(--pf-text-3)", marginTop: 2 }}>{product.subtitle}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: "var(--pf-text-3)" }}>From</div>
          <div className="pf-mono" style={{ fontSize: 14, fontWeight: 600 }}>{C.formatPrice(fromPrice)}</div>
        </div>
      </div>
      <button onClick={onAdd} className="pf-btn pf-btn--ink" style={{ width: "100%", marginTop: 10 }}>
        <Icon.bag size={16} /> Add to cart
      </button>
    </div>
  );
};

window.ProductCard = ProductCard;
