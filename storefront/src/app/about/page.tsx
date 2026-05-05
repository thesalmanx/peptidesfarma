import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Peptidesfarma, our commitment to purity, and our mission to provide the highest quality research peptides.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="product-hero-bg relative flex flex-col justify-center items-center w-full py-20 px-5">
        <h1 className="text-[36px] md:text-[56px] font-bold tracking-[-0.03em] text-center" style={{ color: "#0E1A33" }}>
          About <span style={{ color: "#4F8AF7" }}>Peptidesfarma</span>
        </h1>
        <p className="mt-4 text-[18px] leading-[28px] text-center max-w-[560px]" style={{ color: "#44516B" }}>
          Dedicated to advancing research through premium-quality peptides and compounds.
        </p>
      </section>

      <section className="max-w-[800px] mx-auto px-5 md:px-6 py-12 md:py-16">
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-[24px] md:text-[32px] font-bold tracking-[-0.02em] text-[#0E1A33] mb-4">Our Mission</h2>
            <p className="text-[16px] leading-[26px] text-[#44516B]">
              At Peptidesfarma, we are committed to providing researchers with the highest quality peptides and compounds available. Every product in our catalog undergoes rigorous HPLC testing to ensure a minimum purity of 99%, and each order ships with a detailed Certificate of Analysis.
            </p>
          </div>

          <div>
            <h2 className="text-[24px] md:text-[32px] font-bold tracking-[-0.02em] text-[#0E1A33] mb-4">Quality Assurance</h2>
            <p className="text-[16px] leading-[26px] text-[#44516B]">
              Quality is the foundation of everything we do. Our products are synthesized using state-of-the-art processes and verified by independent third-party laboratories. We maintain strict quality control protocols at every stage, from synthesis to packaging and delivery.
            </p>
          </div>

          <div>
            <h2 className="text-[24px] md:text-[32px] font-bold tracking-[-0.02em] text-[#0E1A33] mb-4">Fast & Reliable Shipping</h2>
            <p className="text-[16px] leading-[26px] text-[#44516B]">
              We understand that time is critical in research. That is why we process and ship all orders placed before 2 PM EST on the same business day. Our temperature-controlled packaging ensures your compounds arrive in optimal condition.
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/products"
              className="btn-primary inline-flex items-center justify-center h-[48px] px-8 rounded-full text-[16px] font-bold text-white hover:opacity-90 transition-opacity"
            >
              Browse Our Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
