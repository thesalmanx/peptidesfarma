interface ProductVariant {
  id: string
  title: string
  calculated_price?: {
    calculated_amount: number
    currency_code: string
  }
}

export default function ProductPrice({
  variant,
}: {
  variant: ProductVariant
}) {
  if (!variant.calculated_price) {
    return (
      <p className="text-sm text-zinc-500">Price unavailable</p>
    )
  }

  const { calculated_amount, currency_code } = variant.calculated_price
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency_code,
  }).format(calculated_amount)

  return (
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {formatted}
      </span>
      <span className="text-sm text-zinc-500 uppercase">
        {currency_code}
      </span>
    </div>
  )
}
