import { NextRequest, NextResponse } from "next/server"

const ZIPTAX_API_KEY = process.env.ZIPTAX_API_KEY || ""

// States where we have nexus — use full combined rate (state + county + city + zip)
const FULL_RATE_STATES = ["UT", "CA", "WY"]

/**
 * GET /api/tax?zip=84111
 * GET /api/tax?address=451+S+State+St+Salt+Lake+City+UT+84111
 *
 * Returns sales tax rate:
 * - CA & WY: full combined rate (state + county + city)
 * - All other states: base state rate only (no local additions)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const zip = searchParams.get("zip")
  const address = searchParams.get("address")

  if (!zip && !address) {
    return NextResponse.json({ error: "zip or address required" }, { status: 400 })
  }

  if (!ZIPTAX_API_KEY) {
    return NextResponse.json({ rate: 0, taxable: false, reason: "no_api_key" })
  }

  try {
    const query = address || zip
    const res = await fetch(
      `https://api.zip-tax.com/request/v60?address=${encodeURIComponent(query!)}`,
      {
        headers: { "X-API-KEY": ZIPTAX_API_KEY },
        next: { revalidate: 86400 },
      }
    )

    const data = await res.json()

    if (data?.metadata?.response?.code !== 100) {
      return NextResponse.json({
        rate: 0,
        taxable: false,
        reason: "api_error",
        detail: data?.metadata?.response?.message,
      })
    }

    // Get jurisdiction details
    const state = data.baseRates?.find(
      (r: any) => r.jurType === "US_STATE_SALES_TAX"
    )
    const county = data.baseRates?.find(
      (r: any) => r.jurType === "US_COUNTY_SALES_TAX"
    )
    const city = data.baseRates?.find(
      (r: any) => r.jurType === "US_CITY_SALES_TAX"
    )

    const stateCode = (state?.jurName || "").toUpperCase()
    const stateRate = state?.rate || 0

    // Full combined rate from Zip-Tax
    const salesTax = data.taxSummaries?.find(
      (s: any) => s.taxType === "SALES_TAX"
    )
    const combinedRate = salesTax?.rate ?? 0

    // CA & WY: full combined rate. All other states: state rate only.
    const rate = FULL_RATE_STATES.includes(stateCode) ? combinedRate : stateRate

    return NextResponse.json({
      rate,
      taxable: rate > 0,
      percent: `${(rate * 100).toFixed(2)}%`,
      state: stateCode,
      fullRate: FULL_RATE_STATES.includes(stateCode),
      normalizedAddress: data.addressDetail?.normalizedAddress || "",
      shippingTaxable: data.shipping?.taxable === "Y",
    })
  } catch (err: any) {
    return NextResponse.json({
      rate: 0,
      taxable: false,
      reason: "network_error",
      detail: err.message,
    })
  }
}
