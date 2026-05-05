import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { AppleAuthService } from "./service"

const services = [AppleAuthService]

export default ModuleProvider(Modules.AUTH, {
  services,
})
