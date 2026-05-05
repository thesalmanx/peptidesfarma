import Link from "next/link"
import { getFeaturedProducts } from "@/lib/data"
import ProductSlider from "@/components/product/ProductSlider"
import TrustBadges from "@/components/sections/TrustBadges"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.peptidesfarma.com"

export const revalidate = 3600

const FAQ_ITEMS = [
  { q: "What purity level do your peptides have?", a: "All our peptides undergo rigorous HPLC testing and maintain a minimum purity of 99%. Each product ships with a Certificate of Analysis (COA) documenting the exact purity results." },
  { q: "How fast do you ship?", a: "Orders placed before 2 PM EST ship the same day. We use temperature-controlled packaging and offer standard, priority, and 2-day shipping options." },
  { q: "Do you offer free shipping?", a: "Yes! Orders over $200 qualify for free standard shipping, and orders over $300 get free 2-day shipping." },
  { q: "Are your products for human consumption?", a: "No. All products sold by Peptidesfarma are strictly for laboratory research purposes only and are not intended for human consumption." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, and Venmo." },
  { q: "Can I return my order?", a: "We accept returns of unopened, undamaged products within 30 days of delivery. Please contact our support team to initiate a return." },
]

export default async function HomePage() {
  const products = await getFeaturedProducts()

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ padding: "80px 20px 60px", minHeight: "560px" }}>
        <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center gap-8">
          <div className="flex flex-col items-center gap-4 hero-stagger-1">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-semibold tracking-wider uppercase"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.8)" }}
            >
              99%+ Purity Guaranteed
            </span>
          </div>

          <h1
            className="hero-stagger-2 text-[40px] md:text-[64px] leading-[1.05] font-bold tracking-[-0.03em] text-white max-w-[800px]"
          >
            Premium Research{" "}
            <span
              className="font-serif italic font-normal"
              style={{ fontFamily: "var(--font-instrument-serif)" }}
            >
              Peptides
            </span>{" "}
            & Compounds
          </h1>

          <p
            className="hero-stagger-3 text-[18px] md:text-[20px] leading-[28px] md:leading-[30px] max-w-[540px]"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            HPLC-verified, pharmaceutical grade compounds for laboratory research. Same-day shipping with every order.
          </p>

          <div className="hero-stagger-4 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/products"
              className="btn-primary group inline-flex items-center justify-center h-[52px] px-8 rounded-full text-[16px] font-bold text-white hover:opacity-90 transition-opacity"
            >
              Browse Products
              <span className="inline-flex overflow-hidden w-0 group-hover:w-7 group-hover:pl-2 transition-all duration-200 ease-out">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center h-[52px] px-8 rounded-full text-[16px] font-semibold transition-colors"
              style={{ color: "#fff", border: "1px solid rgba(255,255,255,0.22)" }}
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <TrustBadges transparent />

      {/* Featured Products */}
      <section className="px-5 md:px-20 py-12 md:py-16">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col items-center gap-3 mb-10 text-center">
            <h2 className="text-[32px] md:text-[48px] font-bold leading-[1.1] tracking-[-0.03em] text-white">
              Featured{" "}
              <span style={{ color: "#7AA2FF" }}>Products</span>
            </h2>
            <p className="text-[16px] md:text-[18px] leading-[26px] max-w-[480px]" style={{ color: "rgba(255,255,255,0.75)" }}>
              Our most popular research compounds, rigorously tested and ready to ship.
            </p>
          </div>
          <ProductSlider products={products.slice(0, 8)} />
          <div className="mt-10 text-center">
            <Link
              href="/products"
              className="btn-primary group inline-flex items-center rounded-full py-4 h-14 text-lg font-bold text-white hover:opacity-90 transition-opacity"
              style={{ padding: "14px 28px 14px 24px" }}
            >
              See all products
              <span className="inline-flex overflow-hidden w-0 group-hover:w-7 group-hover:pl-2 transition-all duration-200 ease-out">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="px-5 md:px-20 py-12 md:py-16">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-[32px] md:text-[40px] font-bold leading-[1.1] tracking-[-0.03em] text-white text-center mb-10">
            Why Researchers Choose <span style={{ color: "#7AA2FF" }}>Peptidesfarma</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: "99%+ Purity", desc: "Every batch is HPLC-verified and ships with a detailed Certificate of Analysis.", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
              { title: "Same-Day Shipping", desc: "Orders placed before 2 PM EST are processed and shipped the same business day.", icon: "M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" },
              { title: "Dedicated Support", desc: "Our research specialists are available to answer your questions and guide your orders.", icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" },
            ].map((item) => (
              <div
                key={item.title}
                className="card-hover flex flex-col items-start p-6 gap-4 rounded-[20px]"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <div className="w-12 h-12 rounded-[14px] flex items-center justify-center" style={{ background: "rgba(79,138,247,0.15)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7AA2FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-[18px] font-bold text-white">{item.title}</h3>
                <p className="text-[15px] leading-[22px]" style={{ color: "rgba(255,255,255,0.7)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-5 md:px-20 py-12 md:py-16">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-[32px] md:text-[40px] font-bold leading-[1.1] tracking-[-0.03em] text-white text-center mb-10">
            Frequently Asked <span style={{ color: "#7AA2FF" }}>Questions</span>
          </h2>
          <div className="flex flex-col gap-3">
            {FAQ_ITEMS.map((faq, i) => (
              <details
                key={i}
                className="group rounded-[16px] overflow-hidden"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="text-[16px] md:text-[18px] font-semibold text-white pr-4">{faq.q}</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 transition-transform duration-200 group-open:rotate-180">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-[15px] leading-[24px]" style={{ color: "rgba(255,255,255,0.75)" }}>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-5 md:px-20 py-12 md:py-16">
        <div
          className="max-w-[1280px] mx-auto rounded-[24px] flex flex-col items-center text-center gap-6"
          style={{ padding: "64px 32px", background: "rgba(79,138,247,0.08)", border: "1px solid rgba(79,138,247,0.2)" }}
        >
          <h2 className="text-[32px] md:text-[48px] font-bold leading-[1.1] tracking-[-0.03em] text-white">
            Ready to start your research?
          </h2>
          <p className="text-[16px] md:text-[18px] leading-[26px] max-w-[480px]" style={{ color: "rgba(255,255,255,0.8)" }}>
            Browse our complete catalog of research-grade peptides and compounds. Free shipping on orders over $200.
          </p>
          <Link
            href="/products"
            className="btn-primary group inline-flex items-center h-[52px] px-8 rounded-full text-[16px] font-bold text-white hover:opacity-90 transition-opacity"
          >
            Shop Now
            <span className="inline-flex overflow-hidden w-0 group-hover:w-7 group-hover:pl-2 transition-all duration-200 ease-out">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </Link>
        </div>
      </section>
    </div>
  )
}
