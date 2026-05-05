import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { ShippoFulfillmentService } from "./service"

const services = [ShippoFulfillmentService]

export default ModuleProvider(Modules.FULFILLMENT, {
  services,
})
