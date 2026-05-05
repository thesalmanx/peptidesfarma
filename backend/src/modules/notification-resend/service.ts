import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import type {
  Logger,
  NotificationTypes,
} from "@medusajs/framework/types"

type InjectedDependencies = {
  logger: Logger
}

interface ResendOptions {
  api_key: string
  from: string
}

export class ResendNotificationService extends AbstractNotificationProviderService {
  static identifier = "notification-resend"

  protected logger_: Logger
  protected config_: { apiKey: string; from: string }

  static validateOptions(options: Record<string, unknown>) {
    // Allow startup without API key — email features will be disabled
    if (!options.api_key) {
      return
    }
    if (!options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Resend from email is required in the provider's options."
      )
    }
  }

  constructor({ logger }: InjectedDependencies, options: ResendOptions) {
    super()
    this.logger_ = logger
    this.config_ = {
      apiKey: options.api_key,
      from: options.from,
    }
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    if (!notification) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "No notification information provided"
      )
    }

    const from = notification.from?.trim() || this.config_.from
    const to = notification.to

    let subject = "Notification from Peptidesfarma"
    let html = ""

    if (notification.content) {
      subject = notification.content.subject || subject
      html = notification.content.html || notification.content.text || ""
    } else if (notification.data) {
      subject = (notification.data.subject as string) || subject
      html = (notification.data.html as string) || ""
    }

    const body: Record<string, unknown> = {
      from,
      to: [to],
      subject,
      html,
    }

    // CC/BCC support — pass via content.cc / content.bcc (string or string[])
    const contentAny = notification.content as Record<string, any> | undefined
    if (contentAny?.cc) {
      body.cc = Array.isArray(contentAny.cc) ? contentAny.cc : [contentAny.cc]
    }
    if (contentAny?.bcc) {
      body.bcc = Array.isArray(contentAny.bcc) ? contentAny.bcc : [contentAny.bcc]
    }

    if (notification.attachments?.length) {
      body.attachments = notification.attachments.map((a) => ({
        content: a.content,
        filename: a.filename,
        content_type: a.content_type,
      }))
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config_.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`Resend API error ${response.status}: ${errorBody}`)
      }

      const data = await response.json()
      this.logger_.info(`Email sent via Resend to ${to}: ${data.id}`)

      return { id: data.id }
    } catch (error: any) {
      this.logger_.error(`Failed to send email via Resend: ${error.message}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to send email via Resend: ${error.message}`
      )
    }
  }
}
