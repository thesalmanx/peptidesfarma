// CartPage.jsx + CheckoutPage.jsx + AccountPage.jsx + AuthPage.jsx + BlogPages.jsx + MiscPages.jsx
const CartPage = () => {
  const app = useApp();
  const C = window.PF_CATALOG;
  const { Icon } = window;
  if (app.cartLineDetails.length === 0) {
    return (
      <section className="pf-section">
        <div className="pf-wrap" style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ width: 80, height: 80, margin: "0 auto 24px", borderRadius: 999, background: "var(--pf-paper-2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.bag size={32} /></div>
          <h1 style={{ fontSize: 36, fontWeight: 600, margin: "0 0 12px" }}>Your cart is empty</h1>
          <p style={{ color: "var(--pf-text-2)", marginBottom: 24 }}>Browse the catalog to start an order.</p>
          <button onClick={() => app.navigate("products")} className="pf-btn pf-btn--primary pf-btn--lg">Shop catalog</button>
        </div>
      </section>
    );
  }
  return (
    <section style={{ padding: "60px 0", background: "var(--pf-paper)" }}>
      <div className="pf-wrap">
        <div className="pf-eyebrow" style={{ marginBottom: 12 }}>Your order</div>
        <h1 style={{ fontSize: 48, fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 40px" }}>Cart ({app.cartCount})</h1>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 40 }}>
          <div className="pf-card" style={{ padding: 0, overflow: "hidden" }}>
            {app.cartLineDetails.map((line, i) => (
              <div key={line.handle + line.variantSize} style={{ display: "grid", gridTemplateColumns: "100px 1fr auto", gap: 20, padding: 24, borderBottom: i < app.cartLineDetails.length - 1 ? "1px solid var(--pf-line)" : "none", alignItems: "center" }}>
                <div style={{ width: 100, height: 120, background: "var(--pf-ink)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <window.Vial name={line.product.title} dose={line.variantSize} size="sm" bg="none" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{line.product.title}</div>
                  <div style={{ fontSize: 13, color: "var(--pf-text-3)", marginBottom: 8 }}>{line.product.subtitle}</div>
                  <span className="pf-chip pf-chip--light">{line.variantSize}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="pf-mono" style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{C.formatPrice(line.lineTotalCents)}</div>
                  <window.QtyStepper value={line.qty} onChange={(q) => app.updateQty(line.handle, line.variantSize, q)} />
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => app.removeLine(line.handle, line.variantSize)} style={{ background: "none", border: "none", color: "var(--pf-text-3)", cursor: "pointer", fontSize: 12, textDecoration: "underline" }}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside style={{ position: "sticky", top: 84, alignSelf: "start" }}>
            <div className="pf-card" style={{ padding: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>Order summary</h3>
              <SummaryRow label="Subtotal" value={C.formatPrice(app.subtotalCents)} />
              <SummaryRow label="Shipping" value={app.subtotalCents >= 20000 ? "Free" : "$12.00"} />
              <SummaryRow label="Tax (est.)" value={C.formatPrice(Math.round(app.subtotalCents * 0.078))} />
              <div className="pf-rule" style={{ margin: "16px 0" }}></div>
              <SummaryRow label={<strong>Total</strong>} value={<strong className="pf-mono">{C.formatPrice(app.subtotalCents + (app.subtotalCents >= 20000 ? 0 : 1200) + Math.round(app.subtotalCents * 0.078))}</strong>} />
              <button onClick={() => app.navigate("checkout")} className="pf-btn pf-btn--primary pf-btn--lg" style={{ width: "100%", marginTop: 20 }}>Checkout <Icon.arrowRight size={16} /></button>
              <div style={{ marginTop: 16, padding: 12, background: "var(--pf-paper)", borderRadius: 8, fontSize: 11, color: "var(--pf-text-3)", lineHeight: 1.5 }}>
                For research purposes only. Not for human consumption.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

const SummaryRow = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "6px 0" }}>
    <span style={{ color: "var(--pf-text-2)" }}>{label}</span>
    <span className="pf-mono">{value}</span>
  </div>
);

// CHECKOUT
const CheckoutPage = () => {
  const app = useApp();
  const C = window.PF_CATALOG;
  const { Icon } = window;
  const [step, setStep] = React.useState(1);
  const [addr, setAddr] = React.useState({ name: "", email: "", street: "", city: "", state: "CA", zip: "", phone: "" });
  const [ship, setShip] = React.useState("ups-ground");
  const [pay, setPay] = React.useState("card");
  const [promo, setPromo] = React.useState("");
  const [promoApplied, setPromoApplied] = React.useState(false);

  const shippingOptions = [
    { id: "ups-ground", name: "UPS Ground", eta: "3-5 business days", price: app.subtotalCents >= 20000 ? 0 : 1200 },
    { id: "usps-priority", name: "USPS Priority", eta: "2-3 business days", price: 1800 },
    { id: "ups-2day", name: "UPS 2nd Day Air", eta: "2 business days", price: 2800 },
  ];
  const shipChosen = shippingOptions.find(s => s.id === ship);
  const tax = Math.round(app.subtotalCents * 0.078);
  const discount = promoApplied ? Math.round(app.subtotalCents * 0.10) : 0;
  const total = app.subtotalCents + shipChosen.price + tax - discount;

  if (app.cartLineDetails.length === 0) {
    return (
      <section className="pf-section pf-wrap" style={{ textAlign: "center" }}>
        <h1>No items to check out</h1>
        <button onClick={() => app.navigate("products")} className="pf-btn pf-btn--primary">Shop catalog</button>
      </section>
    );
  }

  return (
    <section style={{ padding: "40px 0", background: "var(--pf-paper)" }}>
      <div className="pf-wrap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 32, fontWeight: 600, margin: 0 }}>Checkout</h1>
          {!app.mockUser && <button onClick={() => app.navigate("login")} className="pf-btn pf-btn--ghost pf-btn--sm">Already have an account? Log in</button>}
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 32 }}>
          {["Address", "Shipping", "Payment", "Review"].map((s, i) => (
            <div key={s} style={{ flex: 1, padding: "12px 16px", background: i + 1 <= step ? "var(--pf-ink)" : "#fff", color: i + 1 <= step ? "#fff" : "var(--pf-text-3)", borderRadius: 8, border: "1px solid var(--pf-line)", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
              <span className="pf-mono" style={{ opacity: 0.7 }}>0{i + 1}</span> {s}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 32 }}>
          <div className="pf-card" style={{ padding: 28 }}>
            {step === 1 && (
              <>
                <h3 style={{ margin: "0 0 20px", fontSize: 18 }}>Shipping address</h3>
                <Field label="Email" value={addr.email} onChange={(v) => setAddr({ ...addr, email: v })} placeholder="researcher@lab.org" />
                <Field label="Full name" value={addr.name} onChange={(v) => setAddr({ ...addr, name: v })} />
                <Field label="Street address" value={addr.street} onChange={(v) => setAddr({ ...addr, street: v })} placeholder="Powered by Google Places" />
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
                  <Field label="City" value={addr.city} onChange={(v) => setAddr({ ...addr, city: v })} />
                  <Field label="State" value={addr.state} onChange={(v) => setAddr({ ...addr, state: v })} />
                  <Field label="ZIP" value={addr.zip} onChange={(v) => setAddr({ ...addr, zip: v })} />
                </div>
                <Field label="Phone" value={addr.phone} onChange={(v) => setAddr({ ...addr, phone: v })} />
                <div style={{ fontSize: 11, color: "var(--pf-text-3)", marginTop: 8 }}>Country: United States only.</div>
                <button onClick={() => setStep(2)} className="pf-btn pf-btn--primary pf-btn--lg" style={{ marginTop: 20 }}>Continue to shipping</button>
              </>
            )}
            {step === 2 && (
              <>
                <h3 style={{ margin: "0 0 20px", fontSize: 18 }}>Shipping method</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {shippingOptions.map(opt => (
                    <label key={opt.id} style={{ display: "flex", alignItems: "center", padding: 16, border: `1px solid ${ship === opt.id ? "var(--pf-blue)" : "var(--pf-line)"}`, borderRadius: 10, cursor: "pointer" }}>
                      <input type="radio" name="ship" checked={ship === opt.id} onChange={() => setShip(opt.id)} style={{ marginRight: 12, accentColor: "var(--pf-blue)" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.name}</div>
                        <div style={{ fontSize: 12, color: "var(--pf-text-3)" }}>{opt.eta}</div>
                      </div>
                      <div className="pf-mono" style={{ fontWeight: 600 }}>{opt.price === 0 ? "Free" : C.formatPrice(opt.price)}</div>
                    </label>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                  <button onClick={() => setStep(1)} className="pf-btn pf-btn--ghost">Back</button>
                  <button onClick={() => setStep(3)} className="pf-btn pf-btn--primary" style={{ flex: 1 }}>Continue to payment</button>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h3 style={{ margin: "0 0 20px", fontSize: 18 }}>Payment</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
                  {["card", "apple", "google", "venmo"].map(m => (
                    <button key={m} onClick={() => setPay(m)} style={{ padding: 14, border: `1px solid ${pay === m ? "var(--pf-ink)" : "var(--pf-line)"}`, borderRadius: 10, background: pay === m ? "var(--pf-ink)" : "#fff", color: pay === m ? "#fff" : "var(--pf-text)", cursor: "pointer", fontWeight: 600, fontSize: 13, textTransform: "capitalize" }}>{m === "apple" ? "Apple Pay" : m === "google" ? "Google Pay" : m}</button>
                  ))}
                </div>
                {pay === "card" && (
                  <div>
                    <Field label="Card number" placeholder="0000 0000 0000 0000" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <Field label="Expiry" placeholder="MM/YY" />
                      <Field label="CVC" placeholder="123" />
                    </div>
                  </div>
                )}
                {pay !== "card" && <div style={{ padding: 24, background: "var(--pf-paper)", borderRadius: 8, textAlign: "center", fontSize: 14, color: "var(--pf-text-2)" }}>You'll complete payment with {pay} after order review.</div>}
                <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                  <button onClick={() => setStep(2)} className="pf-btn pf-btn--ghost">Back</button>
                  <button onClick={() => setStep(4)} className="pf-btn pf-btn--primary" style={{ flex: 1 }}>Review order</button>
                </div>
              </>
            )}
            {step === 4 && (
              <>
                <h3 style={{ margin: "0 0 20px", fontSize: 18 }}>Review and place order</h3>
                <ReviewBlock label="Ship to">{addr.name || "—"}, {addr.street || "—"}, {addr.city}, {addr.state} {addr.zip}</ReviewBlock>
                <ReviewBlock label="Method">{shipChosen.name} · {shipChosen.eta}</ReviewBlock>
                <ReviewBlock label="Payment">{pay === "card" ? "Card ending ····" : pay === "apple" ? "Apple Pay" : pay === "google" ? "Google Pay" : "Venmo"}</ReviewBlock>
                <div style={{ padding: 16, background: "var(--pf-blue-tint)", borderRadius: 8, fontSize: 12, color: "var(--pf-ink)", marginTop: 16, lineHeight: 1.6 }}>
                  By placing this order you confirm these compounds are for laboratory research only and not for human consumption.
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                  <button onClick={() => setStep(3)} className="pf-btn pf-btn--ghost">Back</button>
                  <button onClick={() => { app.clearCart(); app.navigate("success"); }} className="pf-btn pf-btn--primary pf-btn--lg" style={{ flex: 1 }}>Place order · {C.formatPrice(total)}</button>
                </div>
              </>
            )}
          </div>
          <aside style={{ position: "sticky", top: 84, alignSelf: "start" }}>
            <div className="pf-card" style={{ padding: 24 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>Summary</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 16, borderBottom: "1px solid var(--pf-line)" }}>
                {app.cartLineDetails.map(line => (
                  <div key={line.handle + line.variantSize} style={{ display: "flex", gap: 10, fontSize: 13 }}>
                    <div style={{ width: 40, height: 48, background: "var(--pf-ink)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <window.Vial name={line.product.title} dose={line.variantSize} size="xs" bg="none" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{line.product.title}</div>
                      <div style={{ fontSize: 11, color: "var(--pf-text-3)" }}>{line.variantSize} · qty {line.qty}</div>
                    </div>
                    <div className="pf-mono">{C.formatPrice(line.lineTotalCents)}</div>
                  </div>
                ))}
              </div>
              <div style={{ paddingTop: 16, paddingBottom: 16, borderBottom: "1px solid var(--pf-line)" }}>
                <div style={{ display: "flex", gap: 4 }}>
                  <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Promo code" style={{ flex: 1, height: 36, padding: "0 12px", border: "1px solid var(--pf-line)", borderRadius: 8, fontSize: 13, fontFamily: "inherit" }} />
                  <button onClick={() => setPromoApplied(true)} className="pf-btn pf-btn--ink pf-btn--sm">Apply</button>
                </div>
                {promoApplied && <div style={{ fontSize: 12, color: "var(--pf-ok)", marginTop: 8 }}>✓ RESEARCH10 applied — 10% off</div>}
              </div>
              <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                <SummaryRow label="Subtotal" value={C.formatPrice(app.subtotalCents)} />
                <SummaryRow label="Shipping" value={shipChosen.price === 0 ? "Free" : C.formatPrice(shipChosen.price)} />
                <SummaryRow label={`Tax (${addr.zip || "ZIP"})`} value={C.formatPrice(tax)} />
                {discount > 0 && <SummaryRow label="Discount" value={"-" + C.formatPrice(discount)} />}
                <div className="pf-rule" style={{ margin: "8px 0" }}></div>
                <SummaryRow label={<strong>Total</strong>} value={<strong className="pf-mono" style={{ fontSize: 18 }}>{C.formatPrice(total)}</strong>} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

const Field = ({ label, value, onChange, placeholder, type = "text" }) => (
  <label style={{ display: "block", marginBottom: 12 }}>
    <div style={{ fontSize: 12, color: "var(--pf-text-3)", marginBottom: 6, fontFamily: "var(--pf-mono)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</div>
    <input type={type} value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} style={{ width: "100%", height: 44, padding: "0 14px", border: "1px solid var(--pf-line)", borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "#fff" }} />
  </label>
);
const ReviewBlock = ({ label, children }) => (
  <div style={{ padding: "12px 0", borderBottom: "1px solid var(--pf-line)" }}>
    <div className="pf-eyebrow" style={{ marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 14 }}>{children}</div>
  </div>
);

// SUCCESS
const SuccessPage = () => {
  const app = useApp();
  const { Icon } = window;
  return (
    <section className="pf-section">
      <div className="pf-wrap" style={{ maxWidth: 640, textAlign: "center" }}>
        <div style={{ width: 80, height: 80, margin: "0 auto 24px", borderRadius: 999, background: "var(--pf-blue-tint)", color: "var(--pf-blue)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.check size={32} /></div>
        <h1 style={{ fontSize: 48, fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 12px" }}>Order placed</h1>
        <p style={{ color: "var(--pf-text-2)", fontSize: 16, marginBottom: 32 }}>Thanks. Order #PF-2026-{Math.floor(Math.random()*9000+1000)} is confirmed. We'll email tracking when the lot ships, expected to arrive by May 8.</p>
        <button onClick={() => app.navigate("products")} className="pf-btn pf-btn--primary pf-btn--lg">Continue browsing</button>
      </div>
    </section>
  );
};

// ACCOUNT
const AccountPage = () => {
  const app = useApp();
  const { Icon } = window;
  if (!app.mockUser) { React.useEffect(() => app.navigate("login"), []); return null; }
  const orders = [
    { id: "PF-2026-4921", date: "Apr 28, 2026", total: 32400, status: "Delivered", items: 2 },
    { id: "PF-2026-4801", date: "Apr 14, 2026", total: 18000, status: "Shipped", items: 1 },
    { id: "PF-2026-4622", date: "Mar 30, 2026", total: 56000, status: "Delivered", items: 3 },
  ];
  return (
    <section className="pf-section">
      <div className="pf-wrap" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 40 }}>
        <aside>
          <div className="pf-eyebrow" style={{ marginBottom: 12 }}>Account</div>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>{app.mockUser.name}</div>
          <div style={{ fontSize: 12, color: "var(--pf-text-3)", marginBottom: 24 }}>{app.mockUser.email}</div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[["Orders", true], ["Addresses", false], ["Settings", false], ["Sign out", false]].map(([l, a]) => (
              <a key={l} onClick={() => l === "Sign out" && (app.setMockUser(null), app.navigate("home"))} style={{ padding: "8px 12px", borderRadius: 8, background: a ? "var(--pf-ink)" : "transparent", color: a ? "#fff" : "var(--pf-text-2)", cursor: "pointer", fontSize: 14 }}>{l}</a>
            ))}
          </nav>
        </aside>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 24px" }}>Orders</h1>
          <div className="pf-card">
            {orders.map((o, i) => (
              <div key={o.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", padding: 20, gap: 16, alignItems: "center", borderBottom: i < orders.length - 1 ? "1px solid var(--pf-line)" : "none" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{o.id}</div>
                  <div style={{ fontSize: 12, color: "var(--pf-text-3)" }}>{o.date}</div>
                </div>
                <div style={{ fontSize: 13, color: "var(--pf-text-2)" }}>{o.items} items</div>
                <div className="pf-mono" style={{ fontWeight: 600 }}>{window.PF_CATALOG.formatPrice(o.total)}</div>
                <div><span className="pf-chip pf-chip--light">{o.status}</span></div>
                <button className="pf-btn pf-btn--ghost pf-btn--sm">Details</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// AUTH
const AuthPage = ({ mode }) => {
  const app = useApp();
  const { Icon } = window;
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  return (
    <section className="pf-starfield" style={{ padding: "80px 0", minHeight: "70vh" }}>
      <div className="pf-wrap" style={{ maxWidth: 440 }}>
        <div className="pf-card" style={{ padding: 36 }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: "0 0 8px" }}>{mode === "signup" ? "Create account" : "Welcome back"}</h1>
          <p style={{ color: "var(--pf-text-2)", fontSize: 14, marginBottom: 24 }}>{mode === "signup" ? "Sign up to track orders and access COA history." : "Log in to your researcher account."}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            <button className="pf-btn pf-btn--ghost" style={{ width: "100%" }}><Icon.google size={16} /> Continue with Google</button>
            <button className="pf-btn pf-btn--ghost" style={{ width: "100%" }}><Icon.apple size={16} /> Continue with Apple</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0", fontSize: 11, color: "var(--pf-text-3)" }}>
            <div style={{ flex: 1, height: 1, background: "var(--pf-line)" }}></div> OR <div style={{ flex: 1, height: 1, background: "var(--pf-line)" }}></div>
          </div>
          <Field label="Email" value={email} onChange={setEmail} />
          <Field label="Password" value={pw} onChange={setPw} type="password" />
          <button onClick={() => { app.setMockUser({ name: "Researcher", email: email || "researcher@lab.org" }); app.navigate("account"); }} className="pf-btn pf-btn--primary" style={{ width: "100%", marginTop: 8 }}>{mode === "signup" ? "Create account" : "Log in"}</button>
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--pf-text-2)" }}>
            {mode === "signup" ? "Have an account?" : "New here?"}{" "}
            <a onClick={() => app.navigate(mode === "signup" ? "login" : "signup")} style={{ color: "var(--pf-blue)", cursor: "pointer", fontWeight: 600 }}>{mode === "signup" ? "Log in" : "Sign up"}</a>
          </div>
        </div>
      </div>
    </section>
  );
};

// BLOG
const BlogPage = () => {
  const app = useApp();
  const posts = [
    { tag: "Method", title: "Reconstituting lyophilized peptides: a working reference", date: "Apr 12, 2026", read: "6 min", excerpt: "A practical guide to bacteriostatic water ratios, vial handling and storage protocols." },
    { tag: "Quality", title: "How we read a COA: identity, potency and contaminants", date: "Mar 28, 2026", read: "8 min", excerpt: "Walk through the three sections of a typical HPLC certificate of analysis." },
    { tag: "Storage", title: "Cold chain handling for sensitive research peptides", date: "Mar 14, 2026", read: "5 min", excerpt: "Temperature ranges, transit windows and what to do when a shipment delays." },
    { tag: "Method", title: "Filtering and aliquoting reconstituted vials", date: "Feb 22, 2026", read: "7 min", excerpt: "0.22 micron filtration, single-use aliquots and freeze-thaw considerations." },
    { tag: "Quality", title: "What 99% purity actually means in HPLC analysis", date: "Feb 09, 2026", read: "5 min", excerpt: "Reading peak integration and what the secondary peaks tell you." },
    { tag: "Lab", title: "Calculating IU and mcg conversions for common peptides", date: "Jan 30, 2026", read: "4 min", excerpt: "A reference table for converting between mass and activity units." },
  ];
  return (
    <section style={{ padding: "60px 0", background: "var(--pf-paper)" }}>
      <div className="pf-wrap">
        <div className="pf-eyebrow" style={{ marginBottom: 12 }}>Journal</div>
        <h1 style={{ fontSize: 56, fontWeight: 600, letterSpacing: "-0.03em", margin: "0 0 40px" }}>Method notes</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {posts.map((post, i) => (
            <article key={i} onClick={() => app.navigate("post", { slug: i })} style={{ cursor: "pointer", background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid var(--pf-line)" }}>
              <div className="pf-starfield" style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <window.Vial name="PF" dose="5mg" size="sm" bg="none" />
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <span className="pf-chip pf-chip--light">{post.tag}</span>
                  <span className="pf-eyebrow">{post.date} · {post.read}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px", lineHeight: 1.3 }}>{post.title}</h3>
                <p style={{ fontSize: 13, color: "var(--pf-text-2)", margin: 0, lineHeight: 1.6 }}>{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
const PostPage = () => {
  const app = useApp();
  return (
    <article style={{ padding: "60px 0" }}>
      <div className="pf-wrap" style={{ maxWidth: 720 }}>
        <span className="pf-chip pf-chip--light" style={{ marginBottom: 16 }}>Method</span>
        <h1 style={{ fontSize: 48, fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 16px", lineHeight: 1.1 }}>Reconstituting lyophilized peptides: a working reference</h1>
        <div style={{ color: "var(--pf-text-3)", marginBottom: 32, fontSize: 14 }}>Apr 12, 2026 · 6 min read</div>
        <div className="pf-starfield" style={{ height: 320, borderRadius: 12, marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <window.Vial name="BPC-157" dose="5mg" size="lg" />
        </div>
        <div style={{ fontSize: 17, lineHeight: 1.8, color: "var(--pf-text-2)" }}>
          <p>Reconstitution is the step where most lab handling errors creep in. The goal is simple: dissolve the lyophilized powder into a known volume of bacteriostatic water without introducing contaminants, denaturing the peptide or losing yield to vial walls.</p>
          <h2 style={{ color: "var(--pf-text)", fontSize: 24, marginTop: 32 }}>Materials</h2>
          <p>You need: the sealed peptide vial, sterile bacteriostatic water with 0.9% benzyl alcohol, an alcohol prep pad, a sterile syringe with appropriate needle gauge, and a clean laminar flow surface or sanitized bench area.</p>
          <h2 style={{ color: "var(--pf-text)", fontSize: 24, marginTop: 32 }}>Procedure</h2>
          <p>Wipe both vial septa with alcohol. Draw the calculated volume of bacteriostatic water and inject slowly down the inner wall of the peptide vial. Avoid spraying directly onto the lyophilized cake. Roll the vial gently between your palms until fully dissolved. Do not shake.</p>
          <p>Once reconstituted, label the vial with date and concentration. Store refrigerated, used within the standard window for the compound in question.</p>
        </div>
        <button onClick={() => app.navigate("blog")} className="pf-btn pf-btn--ghost" style={{ marginTop: 40 }}>← Back to journal</button>
      </div>
    </article>
  );
};

// MISC
const SimplePage = ({ title, body }) => (
  <section className="pf-section">
    <div className="pf-wrap" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 48, fontWeight: 600, letterSpacing: "-0.025em", margin: "0 0 24px" }}>{title}</h1>
      <div style={{ fontSize: 16, lineHeight: 1.8, color: "var(--pf-text-2)" }}>{body}</div>
    </div>
  </section>
);

const AboutPage = () => <SimplePage title="About Peptidesfarma" body={
  <>
    <p>Peptidesfarma is a pharmaceutical-grade research peptide supplier. Every compound we offer is independently verified for identity and potency, lot-traced, and supplied with a HPLC certificate of analysis.</p>
    <p>We exist because researchers should not have to chase paperwork or wonder whether what is on the label matches what is in the vial. Our standard is simple. If we ship it, we tested it. Every lot, every time.</p>
    <h2 style={{ color: "var(--pf-text)", fontSize: 24, marginTop: 32 }}>Standards</h2>
    <p>Compounds are synthesized in cleanroom conditions, lyophilized and sealed under inert atmosphere. Each batch is tested by an independent third-party laboratory before release. We retain reference samples for traceability.</p>
  </>
} />;
const ContactPage = () => <SimplePage title="Contact the lab" body={<>
  <p>For questions about lots, COAs, shipping or technical handling, the team is available Monday through Friday.</p>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
    <Field label="First name" />
    <Field label="Last name" />
    <Field label="Email" />
    <Field label="Phone" />
  </div>
  <Field label="Message" />
  <button className="pf-btn pf-btn--primary">Send message</button>
</>} />;

window.CartPage = CartPage;
window.CheckoutPage = CheckoutPage;
window.SuccessPage = SuccessPage;
window.AccountPage = AccountPage;
window.AuthPage = AuthPage;
window.BlogPage = BlogPage;
window.PostPage = PostPage;
window.AboutPage = AboutPage;
window.ContactPage = ContactPage;
