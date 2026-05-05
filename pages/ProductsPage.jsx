// ProductsPage.jsx — list with filters, sort, pagination
const ProductsPage = () => {
  const app = useApp();
  const C = window.PF_CATALOG;
  const { Icon } = window;
  const initialCat = app.route.params.category || "all";
  const [category, setCategory] = React.useState(initialCat);
  const [sort, setSort] = React.useState("best");
  const [priceMax, setPriceMax] = React.useState(70000);
  const [sizeFilter, setSizeFilter] = React.useState("all");

  const all = C.visibleCatalog();
  let list = all.filter(p => category === "all" || p.category === category);
  list = list.filter(p => C.fromPriceCents(p) <= priceMax);
  if (sizeFilter !== "all") list = list.filter(p => p.variants.some(v => v.size.toLowerCase().includes(sizeFilter)));

  const sorted = [...list].sort((a, b) => {
    if (sort === "best") return a.bestSellerRank - b.bestSellerRank;
    if (sort === "az") return a.title.localeCompare(b.title);
    if (sort === "asc") return C.fromPriceCents(a) - C.fromPriceCents(b);
    if (sort === "desc") return C.fromPriceCents(b) - C.fromPriceCents(a);
    if (sort === "new") return b.bestSellerRank - a.bestSellerRank;
    return 0;
  });

  return (
    <div>
      {/* Page header */}
      <section className="pf-starfield" style={{ padding: "80px 0 60px" }}>
        <div className="pf-wrap">
          <div className="pf-eyebrow pf-eyebrow--dark" style={{ marginBottom: 16 }}>Catalog · {all.length} compounds</div>
          <h1 style={{ fontSize: 64, fontWeight: 600, letterSpacing: "-0.03em", color: "#fff", margin: "0 0 16px", lineHeight: 1 }}>
            Research-grade <span style={{ color: "var(--pf-blue-soft)" }}>peptides</span>
          </h1>
          <p style={{ color: "var(--pf-dark-text-2)", fontSize: 16, maxWidth: 640, margin: 0, lineHeight: 1.6 }}>
            Lot-traced, HPLC-verified compounds. Every order ships with the lot-specific COA. Filter by goal or size below.
          </p>
        </div>
      </section>

      {/* Sticky filter bar */}
      <section style={{ position: "sticky", top: 64, zIndex: 40, background: "var(--pf-paper)", borderBottom: "1px solid var(--pf-line)" }}>
        <div className="pf-wrap" style={{ padding: "16px 0", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {/* Category pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1, minWidth: 0 }}>
            <CatPill label="All" count={all.length} active={category === "all"} onClick={() => setCategory("all")} />
            {C.CATEGORIES.filter(c => c.id !== "support").map(c => {
              const n = all.filter(p => p.category === c.id).length;
              return <CatPill key={c.id} label={c.label} count={n} active={category === c.id} onClick={() => setCategory(c.id)} />;
            })}
          </div>
          {/* Size + Sort */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} style={selectStyle}>
              <option value="all">Any size</option>
              <option value="5mg">5 mg</option>
              <option value="10mg">10 mg</option>
              <option value="20mg">20 mg</option>
              <option value="100mg">100 mg+</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={selectStyle}>
              <option value="best">Best sellers</option>
              <option value="asc">Price · low to high</option>
              <option value="desc">Price · high to low</option>
              <option value="az">A to Z</option>
              <option value="new">Newest lots</option>
            </select>
          </div>
        </div>
      </section>

      <section style={{ padding: "40px 0 80px", background: "var(--pf-paper)" }}>
        <div className="pf-wrap">
          <div style={{ fontSize: 13, color: "var(--pf-text-3)", marginBottom: 24 }} className="pf-mono">
            {sorted.length} {sorted.length === 1 ? "result" : "results"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {sorted.map(p => <window.ProductCard key={p.handle} product={p} />)}
          </div>
        </div>
      </section>
    </div>
  );
};

const selectStyle = {
  padding: "9px 14px",
  border: "1px solid var(--pf-line)",
  borderRadius: 999,
  background: "#fff",
  fontFamily: "inherit",
  fontSize: 13,
  color: "var(--pf-ink)",
  cursor: "pointer",
};

const CatPill = ({ label, count, active, onClick }) => (
  <button onClick={onClick} style={{
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "9px 16px", borderRadius: 999,
    background: active ? "var(--pf-ink)" : "#fff",
    color: active ? "#fff" : "var(--pf-text-2)",
    border: active ? "1px solid var(--pf-ink)" : "1px solid var(--pf-line)",
    cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500,
    transition: "all 0.18s ease",
    whiteSpace: "nowrap",
  }}>
    <span>{label}</span>
    <span className="pf-mono" style={{ fontSize: 11, opacity: active ? 0.7 : 0.55 }}>{count}</span>
  </button>
);

window.ProductsPage = ProductsPage;
