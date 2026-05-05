import crypto from "crypto"
import jwt from "jsonwebtoken"
import jwksClient from "jwks-rsa"
import {
  AbstractAuthModuleProvider,
  MedusaError,
} from "@medusajs/framework/utils"
import type { AuthIdentityProviderService, AuthenticationInput, AuthenticationResponse } from "@medusajs/framework/types"

// Apple JWKS client for verifying ID tokens
const appleJwks = jwksClient({
  jwksUri: "https://appleid.apple.com/auth/keys",
  cache: true,
  cacheMaxAge: 86400000, // 24 hours
})

interface AppleAuthOptions {
  clientId: string
  teamId: string
  keyId: string
  privateKey: string
  callbackUrl: string
}

interface AppleTokenPayload {
  sub: string
  email?: string
  email_verified?: string | boolean
}

export class AppleAuthService extends AbstractAuthModuleProvider {
  static identifier = "apple"
  static DISPLAY_NAME = "Apple Authentication"

  private config_: AppleAuthOptions

  static validateOptions(options: AppleAuthOptions) {
    if (!options.clientId) throw new Error("Apple clientId is required")
    if (!options.teamId) throw new Error("Apple teamId is required")
    if (!options.keyId) throw new Error("Apple keyId is required")
    if (!options.privateKey) throw new Error("Apple privateKey is required")
    if (!options.callbackUrl) throw new Error("Apple callbackUrl is required")
  }

  constructor(container: Record<string, unknown>, options: AppleAuthOptions) {
    // @ts-ignore
    super(...arguments)
    this.config_ = options
  }

  async register(_: AuthenticationInput): Promise<AuthenticationResponse> {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Apple does not support registration. Use method `authenticate` instead."
    )
  }

  async authenticate(
    req: AuthenticationInput,
    authIdentityService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const query = (req.query ?? {}) as Record<string, string>
    const body = (req.body ?? {}) as Record<string, string>

    if (query.error) {
      return {
        success: false,
        error: `${query.error_description || query.error}`,
      }
    }

    const stateKey = crypto.randomBytes(32).toString("hex")
    const state = {
      callback_url: body?.callback_url ?? this.config_.callbackUrl,
    }

    await authIdentityService.setState(stateKey, state)

    return this.getRedirect(this.config_.clientId, state.callback_url, stateKey)
  }

  async validateCallback(
    req: AuthenticationInput,
    authIdentityService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const query = (req.query ?? {}) as Record<string, string>
    const body = (req.body ?? {}) as Record<string, string>

    if (query.error) {
      return {
        success: false,
        error: `${query.error_description || query.error}`,
      }
    }

    const code = query?.code ?? body?.code
    if (!code) {
      return { success: false, error: "No code provided" }
    }

    const stateStr = query?.state ?? body?.state
    const state = await authIdentityService.getState(stateStr)
    if (!state) {
      return { success: false, error: "No state provided, or session expired" }
    }

    try {
      const clientSecret = this.generateClientSecret()

      const params = new URLSearchParams({
        client_id: this.config_.clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: state.callback_url as string,
      })

      const response = await fetch("https://appleid.apple.com/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      })

      if (!response.ok) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Could not exchange Apple token: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()
      const { authIdentity, success } = await this.verify_(
        data.id_token,
        authIdentityService,
        body
      )

      return { success, authIdentity }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  private async verify_(
    idToken: string,
    authIdentityService: AuthIdentityProviderService,
    body?: Record<string, string>
  ) {
    if (!idToken) {
      return { success: false, error: "No ID token found" }
    }

    // Decode header to get kid, then verify signature against Apple's public keys
    const decoded = jwt.decode(idToken, { complete: true })
    if (!decoded || !decoded.header?.kid) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Could not decode Apple ID token"
      )
    }

    let payload: AppleTokenPayload
    try {
      const signingKey = await appleJwks.getSigningKey(decoded.header.kid)
      const publicKey = signingKey.getPublicKey()
      payload = jwt.verify(idToken, publicKey, {
        algorithms: ["RS256"],
        issuer: "https://appleid.apple.com",
        audience: this.config_.clientId,
      }) as AppleTokenPayload
    } catch (verifyError: any) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Apple ID token verification failed: ${verifyError.message}`
      )
    }

    const entity_id = payload.sub

    const userMetadata: Record<string, unknown> = {
      email: payload.email,
    }

    if (body?.user) {
      try {
        const userData = JSON.parse(body.user)
        if (userData.name) {
          userMetadata.given_name = userData.name.firstName
          userMetadata.family_name = userData.name.lastName
          userMetadata.name = [userData.name.firstName, userData.name.lastName]
            .filter(Boolean)
            .join(" ")
        }
        if (userData.email) {
          userMetadata.email = userData.email
        }
      } catch {
      }
    }

    let authIdentity
    try {
      authIdentity = await authIdentityService.retrieve({ entity_id })
    } catch (error: any) {
      if (error.type === MedusaError.Types.NOT_FOUND) {
        authIdentity = await authIdentityService.create({
          entity_id,
          user_metadata: userMetadata,
        })
      } else {
        return { success: false, error: error.message }
      }
    }

    return { success: true, authIdentity }
  }

  private generateClientSecret(): string {
    const now = Math.floor(Date.now() / 1000)

    const payload = {
      iss: this.config_.teamId,
      iat: now,
      exp: now + 15777000,
      aud: "https://appleid.apple.com",
      sub: this.config_.clientId,
    }

    return jwt.sign(payload, this.config_.privateKey, {
      algorithm: "ES256",
      header: {
        alg: "ES256",
        kid: this.config_.keyId,
      },
    })
  }

  private getRedirect(clientId: string, callbackUrl: string, stateKey: string) {
    const authUrl = new URL("https://appleid.apple.com/auth/authorize")
    authUrl.searchParams.set("client_id", clientId)
    authUrl.searchParams.set("redirect_uri", callbackUrl)
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("scope", "name email")
    authUrl.searchParams.set("response_mode", "form_post")
    authUrl.searchParams.set("state", stateKey)

    return { success: true, location: authUrl.toString() }
  }
}
