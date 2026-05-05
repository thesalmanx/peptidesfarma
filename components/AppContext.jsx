// AppContext.jsx — cart, toasts, age gate, mock auth
const AppContext = React.createContext(null);
const useApp = () => React.useContext(AppContext);

const AppProvider = ({ children }) => {
  // Cart: array of { handle, variantSize, qty }
  const [cart, setCart] = React.useState([]);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [toasts, setToasts] = React.useState([]);
  const [agePassed, setAgePassed] = React.useState(true); // default true; gate component flips on mount once
  const [route, setRoute] = React.useState({ name: "home", params: {} });
  const [mockUser, setMockUser] = React.useState(null);
  const [pickerProduct, setPickerProduct] = React.useState(null); // product object or null

  // toast api
  const toastIdRef = React.useRef(0);
  const addToast = (msg, kind = "info") => {
    const id = ++toastIdRef.current;
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  };

  // navigate
  const navigate = (name, params = {}) => {
    setRoute({ name, params });
    setDrawerOpen(false);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // cart helpers
  const addToCart = (handle, variantSize, qty = 1) => {
    setCart(prev => {
      const ix = prev.findIndex(l => l.handle === handle && l.variantSize === variantSize);
      if (ix >= 0) {
        const copy = prev.slice();
        copy[ix] = { ...copy[ix], qty: copy[ix].qty + qty };
        return copy;
      }
      return [...prev, { handle, variantSize, qty }];
    });
    setDrawerOpen(true);
    const p = window.PF_CATALOG.productByHandle(handle);
    addToast(`${p?.title || "Item"} added`, "success");
  };
  const updateQty = (handle, variantSize, qty) => {
    setCart(prev => prev
      .map(l => (l.handle === handle && l.variantSize === variantSize) ? { ...l, qty: Math.max(1, qty) } : l)
    );
  };
  const removeLine = (handle, variantSize) => {
    setCart(prev => prev.filter(l => !(l.handle === handle && l.variantSize === variantSize)));
  };
  const clearCart = () => setCart([]);

  // Smart add: if multi-variant -> open picker; else add lowest-variant directly.
  const pickAndAddToCart = (handle, qty = 1) => {
    const p = window.PF_CATALOG.productByHandle(handle);
    if (!p) return;
    if (p.variants.length > 1) {
      setPickerProduct({ product: p, qty });
    } else {
      addToCart(handle, p.variants[0].size, qty);
    }
  };
  const closePicker = () => setPickerProduct(null);

  const cartLineDetails = React.useMemo(() => cart.map(line => {
    const p = window.PF_CATALOG.productByHandle(line.handle);
    const variant = p?.variants.find(v => v.size === line.variantSize);
    const priceCents = variant ? variant.priceCents : 0;
    return { ...line, product: p, variant, priceCents, lineTotalCents: priceCents * line.qty };
  }), [cart]);

  const subtotalCents = cartLineDetails.reduce((s, l) => s + l.lineTotalCents, 0);
  const cartCount = cart.reduce((s, l) => s + l.qty, 0);

  const value = {
    cart, cartLineDetails, subtotalCents, cartCount,
    addToCart, updateQty, removeLine, clearCart, pickAndAddToCart,
    pickerProduct, closePicker,
    drawerOpen, setDrawerOpen,
    searchOpen, setSearchOpen,
    toasts, addToast,
    agePassed, setAgePassed,
    route, navigate,
    mockUser, setMockUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

window.AppProvider = AppProvider;
window.useApp = useApp;
