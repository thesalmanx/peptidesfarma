import {
  AbstractFulfillmentProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import { getCarrierTrackingUrl } from "../../utils/carrier-tracking-url"
import type {
  Logger,
  CalculatedShippingOptionPrice,
  CalculateShippingOptionPriceDTO,
  CreateFulfillmentResult,
  CreateShippingOptionDTO,
  FulfillmentDTO,
  FulfillmentItemDTO,
  FulfillmentOrderDTO,
} from "@medusajs/framework/types"

type InjectedDependencies = {
  logger: Logger
}

interface ShippoOptions {
  api_key: string
  from_name: string
  from_street: string
  from_city: string
  from_state: string
  from_zip: string
  from_country: string
  from_email: string
}

export class ShippoFulfillmentService extends AbstractFulfillmentProviderService {
  static identifier = "fulfillment-shippo"

  protected logger_: Logger
  protected options_: ShippoOptions

  static validateOptions(options: Record<string, unknown>) {
    if (!options.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Shippo api_key is required in the provider's options."
      )
    }
  }

  constructor({ logger }: InjectedDependencies, options: ShippoOptions) {
    super()
    this.logger_ = logger
    this.options_ = options
  }

  async getFulfillmentOptions(): Promise<{ id: string; is_return?: boolean }[]> {
    return [
      { id: "shippo-standard" },
      { id: "shippo-express" },
      { id: "shippo-standard-return", is_return: true },
    ]
  }

  async validateOption(
    optionData: Record<string, unknown>
  ): Promise<boolean> {
    return true
  }

  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: any
  ): Promise<any> {
    return data
  }

  async canCalculate(
    data: CreateShippingOptionDTO
  ): Promise<boolean> {
    return true
  }

  async calculatePrice(
    optionData: CalculateShippingOptionPriceDTO["optionData"],
    data: CalculateShippingOptionPriceDTO["data"],
    context: CalculateShippingOptionPriceDTO["context"]
  ): Promise<CalculatedShippingOptionPrice> {
    // Read shipping cost from cart metadata (set by Shippo rate selection on storefront)
    const cart = (context as any)?.cart
    const meta = cart?.metadata || {}
    const shippoCost = meta.shippo_shipping_cost

    if (shippoCost != null && !isNaN(Number(shippoCost))) {
      return { calculated_amount: Math.round(Number(shippoCost) * 100), is_calculated_price_tax_inclusive: false }
    }

    // Also check if amount is passed in the data directly
    if (data && (data as any).amount != null) {
      return { calculated_amount: Math.round(Number((data as any).amount) * 100), is_calculated_price_tax_inclusive: false }
    }

    // Default: free shipping if no rate info
    return { calculated_amount: 0, is_calculated_price_tax_inclusive: false }
  }

  async createFulfillment(
    data: Record<string, unknown>,
    items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
    order: Partial<FulfillmentOrderDTO> | undefined,
    fulfillment: Partial<Omit<FulfillmentDTO, "provider_id" | "data" | "items">>
  ): Promise<CreateFulfillmentResult> {
    // If the order already has a tracking number in metadata (set by the
    // Shippo webhook handler), skip the Shippo API call.
    const orderMeta = (order as any)?.metadata || {}
    const existingTracking = orderMeta.shippo_tracking_number
    if (existingTracking) {
      const existingUrl = orderMeta.shippo_tracking_url || ""
      const existingLabel = orderMeta.shippo_label_url || ""
      const existingCarrier = orderMeta.shippo_carrier || ""
      this.logger_.info(`Shippo: Label already purchased — using existing tracking ${existingTracking} (no Shippo API call)`)
      return {
        data: {
          tracking_number: existingTracking,
          label_url: existingLabel,
          carrier: existingCarrier,
          source: "shippo_webhook",
        },
        labels: [
          {
            tracking_number: existingTracking,
            tracking_url: existingUrl,
            label_url: existingLabel,
          },
        ],
      }
    }

    const shippingAddress = (order as any)?.shipping_address ||
      (fulfillment as any)?.shipping_address ||
      (data as any)?.shipping_address

    if (!shippingAddress) {
      this.logger_.warn("Shippo: No shipping address found, returning empty fulfillment")
      return { data: {}, labels: [] }
    }

    try {
      const shipment = await this.shippoRequest("/shipments/", {
        method: "POST",
        body: JSON.stringify({
          address_from: {
            name: this.options_.from_name,
            street1: this.options_.from_street,
            city: this.options_.from_city,
            state: this.options_.from_state,
            zip: this.options_.from_zip,
            country: this.options_.from_country,
            email: this.options_.from_email,
          },
          address_to: {
            name: `${shippingAddress.first_name || ""} ${shippingAddress.last_name || ""}`.trim(),
            street1: shippingAddress.address_1 || "",
            street2: shippingAddress.address_2 || "",
            city: shippingAddress.city || "",
            state: shippingAddress.province || "",
            zip: shippingAddress.postal_code || "",
            country: shippingAddress.country_code?.toUpperCase() || "US",
            email: (order as any)?.email || "",
            phone: shippingAddress.phone || "",
          },
          parcels: [
            {
              length: "10",
              width: "8",
              height: "4",
              distance_unit: "in",
              weight: "1",
              mass_unit: "lb",
            },
          ],
          async: false,
        }),
      })

      if (!shipment.rates || shipment.rates.length === 0) {
        this.logger_.warn("Shippo: No rates returned for shipment")
        return { data: { shippo_shipment_id: shipment.object_id }, labels: [] }
      }

      const rate = shipment.rates[0]

      const transaction = await this.shippoRequest("/transactions/", {
        method: "POST",
        body: JSON.stringify({
          rate: rate.object_id,
          label_file_type: "PDF",
          async: false,
        }),
      })

      const trackingNumber = transaction.tracking_number || ""
      const labelUrl = transaction.label_url || ""
      const carrierName = rate.provider || ""
      const trackingUrl = trackingNumber
        ? getCarrierTrackingUrl(trackingNumber, carrierName)
        : ""

      this.logger_.info(
        `Shippo: Fulfillment created — tracking: ${trackingNumber}, label: ${labelUrl}`
      )

      return {
        data: {
          shippo_shipment_id: shipment.object_id,
          shippo_transaction_id: transaction.object_id,
          shippo_rate_id: rate.object_id,
          tracking_number: trackingNumber,
          label_url: labelUrl,
          carrier: rate.provider || "",
        },
        labels: [
          {
            tracking_number: trackingNumber,
            tracking_url: trackingUrl,
            label_url: labelUrl,
          },
        ],
      }
    } catch (error: any) {
      this.logger_.error(`Shippo: createFulfillment failed — ${error.message}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Shippo fulfillment creation failed: ${error.message}`
      )
    }
  }

  async cancelFulfillment(
    data: Record<string, unknown>
  ): Promise<any> {
    const transactionId = (data as any)?.shippo_transaction_id
    if (!transactionId) {
      this.logger_.warn("Shippo: No transaction ID to cancel")
      return
    }

    try {
      await this.shippoRequest("/refunds/", {
        method: "POST",
        body: JSON.stringify({ transaction: transactionId }),
      })
      this.logger_.info(`Shippo: Refund requested for transaction ${transactionId}`)
    } catch (error: any) {
      this.logger_.error(`Shippo: cancelFulfillment failed — ${error.message}`)
    }
  }

  async createReturnFulfillment(
    fulfillment: Record<string, unknown>
  ): Promise<CreateFulfillmentResult> {
    return { data: {}, labels: [] }
  }

  async getFulfillmentDocuments(
    data: Record<string, unknown>
  ): Promise<never[]> {
    return []
  }

  async getReturnDocuments(
    data: Record<string, unknown>
  ): Promise<never[]> {
    return []
  }

  async getShipmentDocuments(
    data: Record<string, unknown>
  ): Promise<never[]> {
    return []
  }

  async retrieveDocuments(
    fulfillmentData: Record<string, unknown>,
    documentType: string
  ): Promise<void> {
  }

  private async shippoRequest(
    path: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `https://api.goshippo.com${path}`

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `ShippoToken ${this.options_.api_key}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`Shippo API error ${response.status}: ${errorBody}`)
    }

    return response.json()
  }
}
