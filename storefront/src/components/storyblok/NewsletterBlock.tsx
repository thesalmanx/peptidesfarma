"use client"

import { storyblokEditable, type SbBlokData } from "@storyblok/react"

interface NewsletterBlok extends SbBlokData {
  heading?: string
  subheading?: string
  button_text?: string
  success_message?: string
}

export default function NewsletterBlock({ blok }: { blok: NewsletterBlok }) {
  return <div {...storyblokEditable(blok)} />
}
