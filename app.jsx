// App.jsx — root app, routing, tweaks
const App = () => {
  const app = useApp();
  const tweaks = window.useTweaks ? window.useTweaks(/*EDITMODE-BEGIN*/{
    "accentBlue": "#4F8AF7",
    "anchorNavy": "#14213D",
    "density": "comfortable",
    "showAgeGate": true,
    "showAnnouncementBar": true,
    "showStarfield": true
  }/*EDITMODE-END*/) : [{}, () => {}];
  const [t, setT] = tweaks;

  React.useEffect(() => {
    document.documentElement.style.setProperty("--pf-blue", t.accentBlue);
    document.documentElement.style.setProperty("--pf-ink", t.anchorNavy);
  }, [t.accentBlue, t.anchorNavy]);

  // Reveal animation
  React.useEffect(() => {
    const els = document.querySelectorAll(".pf-reveal:not(.is-in)");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [app.route]);

  const r = app.route.name;
  const Page =
    r === "home" ? window.HomePage :
    r === "products" ? window.ProductsPage :
    r === "product" ? window.ProductDetailPage :
    r === "cart" ? window.CartPage :
    r === "checkout" ? window.CheckoutPage :
    r === "success" ? window.SuccessPage :
    r === "account" ? window.AccountPage :
    r === "login" ? () => <window.AuthPage mode="login" /> :
    r === "signup" ? () => <window.AuthPage mode="signup" /> :
    r === "blog" ? window.BlogPage :
    r === "post" ? window.PostPage :
    r === "about" ? window.AboutPage :
    r === "contact" ? window.ContactPage :
    window.HomePage;

  const dark = r === "home" || r === "products" || r === "product" || r === "blog" || r === "post" || r === "login" || r === "signup";

  return (
    <>
      {t.showAnnouncementBar && <window.AnnouncementBar />}
      <window.Navbar dark={dark} />
      <main><Page /></main>
      <window.Footer />
      <window.CartDrawer />
      <window.SizePickerModal />
      <window.SearchModal />
      <window.Toasts />
      {t.showAgeGate && <window.AgeGate />}
      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection title="Color">
            <window.TweakColor label="Accent blue" value={t.accentBlue} onChange={(v) => setT("accentBlue", v)} />
            <window.TweakColor label="Anchor navy" value={t.anchorNavy} onChange={(v) => setT("anchorNavy", v)} />
          </window.TweakSection>
          <window.TweakSection title="Layout">
            <window.TweakRadio label="Density" value={t.density} onChange={(v) => setT("density", v)} options={[{value:"comfortable", label:"Comfortable"},{value:"compact", label:"Compact"}]} />
            <window.TweakToggle label="Announcement bar" checked={t.showAnnouncementBar} onChange={(v) => setT("showAnnouncementBar", v)} />
            <window.TweakToggle label="Age gate on first visit" checked={t.showAgeGate} onChange={(v) => setT("showAgeGate", v)} />
            <window.TweakToggle label="Starfield backgrounds" checked={t.showStarfield} onChange={(v) => setT("showStarfield", v)} />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </>
  );
};

const Root = () => (
  <window.AppProvider>
    <App />
  </window.AppProvider>
);

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
