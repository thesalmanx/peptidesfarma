import {
  createProductsWorkflow,
  createSalesChannelsWorkflow,
  createRegionsWorkflow,
  createShippingOptionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  createStockLocationsWorkflow,
  createInventoryLevelsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  createApiKeysWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { ExecArgs, ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function seedPeptidesfarma({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve("query")
  const fulfillmentModuleService = container.resolve("fulfillment")

  logger.info("Seeding Peptidesfarma store...")

  // ── 1. Update Store ──
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "name"],
  })
  const store = stores[0]

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        name: "Peptidesfarma",
        supported_currencies: [
          { currency_code: "usd", is_default: true },
        ],
      },
    },
  })
  logger.info("Store updated: Peptidesfarma")

  // ── 2. Create Sales Channel ──
  const { result: salesChannelResult } = await createSalesChannelsWorkflow(container).run({
    input: {
      salesChannelsData: [
        { name: "Default Sales Channel", description: "Peptidesfarma storefront" },
      ],
    },
  })
  const salesChannel = salesChannelResult[0]
  logger.info(`Sales channel created: ${salesChannel.id}`)

  // ── 3. Link Sales Channel to Store ──
  await link.create({
    "store": { store_id: store.id },
    "sales_channel": { sales_channel_id: salesChannel.id },
  })

  // ── 4. Create Publishable API Key ──
  const { result: apiKeyResult } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        { title: "Storefront Publishable Key", type: "publishable", created_by: "" },
      ],
    },
  })
  const pubApiKey = apiKeyResult[0]
  logger.info(`Publishable API key created: ${pubApiKey.id}`)

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: { id: pubApiKey.id, add: [salesChannel.id] },
  })

  // ── 5. Create Stock Location ──
  const { result: stockLocationResult } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        {
          name: "Peptidesfarma Warehouse",
          address: {
            address_1: "123 Commerce St",
            city: "San Francisco",
            country_code: "us",
            postal_code: "94105",
          },
        },
      ],
    },
  })
  const stockLocation = stockLocationResult[0]
  logger.info(`Stock location created: ${stockLocation.id}`)

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: stockLocation.id, add: [salesChannel.id] },
  })

  // ── 6. Set up fulfillment provider for location ──
  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Peptidesfarma Fulfillment Set",
    type: "shipping",
    service_zones: [
      {
        name: "United States",
        geo_zones: [{ type: "country", country_code: "us" }],
      },
    ],
  })

  await link.create({
    "stock_location": { stock_location_id: stockLocation.id },
    "fulfillment": { fulfillment_set_id: fulfillmentSet.id },
  })

  // ── 7. Create Region ──
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "United States",
          currency_code: "usd",
          countries: ["us"],
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  })
  const usRegion = regionResult[0]
  logger.info(`Region created: ${usRegion.id}`)

  // ── 8. Create Shipping Options ──
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles()
  const defaultProfile = shippingProfiles[0]

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: defaultProfile.id,
        type: { label: "Standard", description: "Standard shipping", code: "standard" },
        prices: [{ currency_code: "usd", amount: 0 }],
        rules: [{ attribute: "enabled_in_store", value: '"true"', operator: "eq" }],
      },
    ],
  })
  logger.info("Shipping options created")

  // ── 9. Create Products ──
  const products = [
    // Retatrutide
    {
      title: "Retatrutide",
      description: "Research-grade Retatrutide peptide for laboratory use.",
      handle: "retatrutide",
      status: "published" as const,
      options: [{ title: "Size", values: ["5mg", "10mg", "15mg", "20mg", "30mg", "40mg pen", "50mg"] }],
      variants: [
        { title: "5mg", sku: "RET-5MG", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "5mg" } },
        { title: "10mg", sku: "RET-10MG", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "10mg" } },
        { title: "15mg", sku: "RET-15MG", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "15mg" } },
        { title: "20mg", sku: "RET-20MG", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "20mg" } },
        { title: "30mg", sku: "RET-30MG", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "30mg" } },
        { title: "40mg pen", sku: "RET-40MG-PEN", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "40mg pen" } },
        { title: "50mg", sku: "RET-50MG", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "50mg" } },
      ],
      sales_channels: [{ id: salesChannel.id }],
    },
    // Tesamorelin
    {
      title: "Tesamorelin",
      description: "Research-grade Tesamorelin peptide for laboratory use.",
      handle: "tesamorelin",
      status: "published" as const,
      options: [{ title: "Size", values: ["5mg", "10mg", "20mg"] }],
      variants: [
        { title: "5mg", sku: "TES-5MG", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "5mg" } },
        { title: "10mg", sku: "TES-10MG", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "10mg" } },
        { title: "20mg", sku: "TES-20MG", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "20mg" } },
      ],
      sales_channels: [{ id: salesChannel.id }],
    },
    // BAC Water
    {
      title: "BAC Water",
      description: "Bacteriostatic Water for reconstitution.",
      handle: "bac-water",
      status: "published" as const,
      options: [{ title: "Size", values: ["3ml", "10ml"] }],
      variants: [
        { title: "3ml", sku: "BAC-3ML", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "3ml" } },
        { title: "10ml", sku: "BAC-10ML", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "10ml" } },
      ],
      sales_channels: [{ id: salesChannel.id }],
    },
    // NAD+
    {
      title: "NAD+",
      description: "Research-grade NAD+ for laboratory use.",
      handle: "nad-plus",
      status: "published" as const,
      options: [{ title: "Size", values: ["500mg", "1000mg"] }],
      variants: [
        { title: "500mg", sku: "NAD-500MG", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "500mg" } },
        { title: "1000mg", sku: "NAD-1000MG", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "1000mg" } },
      ],
      sales_channels: [{ id: salesChannel.id }],
    },
    // MOTS-C
    {
      title: "MOTS-C",
      description: "Research-grade MOTS-C peptide for laboratory use.",
      handle: "mots-c",
      status: "published" as const,
      options: [{ title: "Size", values: ["20mg"] }],
      variants: [
        { title: "20mg", sku: "MOTSC-20MG", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "20mg" } },
      ],
      sales_channels: [{ id: salesChannel.id }],
    },
    // BPC-157
    {
      title: "BPC-157",
      description: "Research-grade BPC-157 peptide for laboratory use.",
      handle: "bpc-157",
      status: "published" as const,
      options: [{ title: "Size", values: ["5mg", "10mg"] }],
      variants: [
        { title: "5mg", sku: "BPC-5MG", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "5mg" } },
        { title: "10mg", sku: "BPC-10MG", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "10mg" } },
      ],
      sales_channels: [{ id: salesChannel.id }],
    },
    // Glutathione
    {
      title: "Glutathione",
      description: "Research-grade Glutathione for laboratory use.",
      handle: "glutathione",
      status: "published" as const,
      options: [{ title: "Size", values: ["1500mg"] }],
      variants: [
        { title: "1500mg", sku: "GLUT-1500MG", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "1500mg" } },
      ],
      sales_channels: [{ id: salesChannel.id }],
    },
    // KLOW
    {
      title: "KLOW",
      description: "Research-grade KLOW compound for laboratory use.",
      handle: "klow",
      status: "published" as const,
      options: [{ title: "Size", values: ["80mg"] }],
      variants: [
        { title: "80mg", sku: "KLOW-80MG", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "80mg" } },
      ],
      sales_channels: [{ id: salesChannel.id }],
    },
    // MT-2
    {
      title: "MT-2",
      description: "Research-grade Melanotan II peptide for laboratory use.",
      handle: "mt-2",
      status: "published" as const,
      options: [{ title: "Size", values: ["10mg"] }],
      variants: [
        { title: "10mg", sku: "MT2-10MG", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "10mg" } },
      ],
      sales_channels: [{ id: salesChannel.id }],
    },
    // Epithalon
    {
      title: "Epithalon",
      description: "Research-grade Epithalon peptide for laboratory use.",
      handle: "epithalon",
      status: "published" as const,
      options: [{ title: "Size", values: ["10mg"] }],
      variants: [
        { title: "10mg", sku: "EPITH-10MG", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "10mg" } },
      ],
      sales_channels: [{ id: salesChannel.id }],
    },
    // Selank
    {
      title: "Selank",
      description: "Research-grade Selank peptide for laboratory use.",
      handle: "selank",
      status: "published" as const,
      options: [{ title: "Size", values: ["10mg"] }],
      variants: [
        { title: "10mg", sku: "SELK-10MG", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "10mg" } },
      ],
      sales_channels: [{ id: salesChannel.id }],
    },
    // DSIP
    {
      title: "DSIP",
      description: "Research-grade Delta Sleep-Inducing Peptide for laboratory use.",
      handle: "dsip",
      status: "published" as const,
      options: [{ title: "Size", values: ["5mg"] }],
      variants: [
        { title: "5mg", sku: "DSIP-5MG", prices: [{ currency_code: "usd", amount: 0 }], manage_inventory: true, options: { Size: "5mg" } },
      ],
      sales_channels: [{ id: salesChannel.id }],
    },
  ]

  const { result: productResult } = await createProductsWorkflow(container).run({
    input: { products },
  })
  logger.info(`Created ${productResult.length} products`)

  // ── 10. Create Inventory Levels ──
  // Map product variant → inventory item → stock at location
  const inventoryQuantities: Record<string, number> = {
    "RET-5MG": 20, "RET-10MG": 30, "RET-15MG": 10, "RET-20MG": 20,
    "RET-30MG": 20, "RET-40MG-PEN": 1, "RET-50MG": 10,
    "TES-5MG": 10, "TES-10MG": 20, "TES-20MG": 10,
    "BAC-3ML": 30, "BAC-10ML": 20,
    "NAD-500MG": 10, "NAD-1000MG": 10,
    "MOTSC-20MG": 10,
    "BPC-5MG": 10, "BPC-10MG": 10,
    "GLUT-1500MG": 10,
    "KLOW-80MG": 10,
    "MT2-10MG": 10,
    "EPITH-10MG": 10,
    "SELK-10MG": 10,
    "DSIP-5MG": 10,
  }

  const inventoryLevels: { location_id: string; inventory_item_id: string; stocked_quantity: number }[] = []

  for (const product of productResult) {
    for (const variant of product.variants || []) {
      if (!variant.inventory_items?.length) continue
      const sku = variant.sku || ""
      const qty = inventoryQuantities[sku] || 10

      for (const invItem of variant.inventory_items) {
        inventoryLevels.push({
          location_id: stockLocation.id,
          inventory_item_id: invItem.inventory_item_id,
          stocked_quantity: qty,
        })
      }
    }
  }

  if (inventoryLevels.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: inventoryLevels },
    })
    logger.info(`Created ${inventoryLevels.length} inventory levels`)
  }

  logger.info("Peptidesfarma seed completed successfully!")
  logger.info(`Publishable API Key: ${pubApiKey.token}`)
}
