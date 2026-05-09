import { apiPlugin, storyblokInit } from "@storyblok/react/rsc"
import Page from "@/components/storyblok/Page"
import Feature from "@/components/storyblok/Feature"
import Grid from "@/components/storyblok/Grid"
import Teaser from "@/components/storyblok/Teaser"
import ProductSection from "@/components/storyblok/ProductSection"
import TrustBadgesBlock from "@/components/storyblok/TrustBadgesBlock"
import CertificateBlock from "@/components/storyblok/CertificateBlock"
import StatsGridBlock from "@/components/storyblok/StatsGridBlock"
import DosingBlock from "@/components/storyblok/DosingBlock"
import ImportantNotesBlock from "@/components/storyblok/ImportantNotesBlock"
import ResearchNoticeBlock from "@/components/storyblok/ResearchNoticeBlock"
import NewsletterBlock from "@/components/storyblok/NewsletterBlock"
import ContactHeroBlock from "@/components/storyblok/ContactHeroBlock"
import ContactFormBlock from "@/components/storyblok/ContactFormBlock"
import ContactCardsBlock from "@/components/storyblok/ContactCardsBlock"
import FaqBlock from "@/components/storyblok/FaqBlock"
import CtaBannerBlock from "@/components/storyblok/CtaBannerBlock"
import FeaturedProductsBlock from "@/components/storyblok/FeaturedProductsBlock"
import CollectionHeroBlock from "@/components/storyblok/CollectionHeroBlock"
import HomepageHeroBlock from "@/components/storyblok/HomepageHeroBlock"
import HomepageTrustGridBlock from "@/components/storyblok/HomepageTrustGridBlock"
import PrecisionSectionBlock from "@/components/storyblok/PrecisionSectionBlock"
import TestimonialsSectionBlock from "@/components/storyblok/TestimonialsSectionBlock"
import QualitySectionBlock from "@/components/storyblok/QualitySectionBlock"
import ExploreBannerBlock from "@/components/storyblok/ExploreBannerBlock"
import SubscriptionBannerBlock from "@/components/storyblok/SubscriptionBannerBlock"
import DisclaimerBlock from "@/components/storyblok/DisclaimerBlock"
import LegalPageBlock from "@/components/storyblok/LegalPageBlock"
import AboutUsBlock from "@/components/storyblok/AboutUsBlock"
import CollectionProductsBlock from "@/components/storyblok/CollectionProductsBlock"

export const getStoryblokApi = storyblokInit({
  accessToken: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
  bridge: true,
  use: [apiPlugin],
  apiOptions: {
    region: "eu",
  },
  components: {
    page: Page,
    home: Page,
    dynamicPage: Page,
    feature: Feature,
    grid: Grid,
    teaser: Teaser,
    product_section: ProductSection,
    trust_badges: TrustBadgesBlock,
    certificate_of_analysis: CertificateBlock,
    stats_grid: StatsGridBlock,
    dosing_information: DosingBlock,
    important_notes: ImportantNotesBlock,
    research_notice: ResearchNoticeBlock,
    newsletter: NewsletterBlock,
    contact_hero: ContactHeroBlock,
    contact_form: ContactFormBlock,
    contact_cards: ContactCardsBlock,
    faq_section: FaqBlock,
    cta_banner: CtaBannerBlock,
    featured_products: FeaturedProductsBlock,
    collection_hero: CollectionHeroBlock,
    homepage_hero: HomepageHeroBlock,
    homepage_trust_grid: HomepageTrustGridBlock,
    precision_section: PrecisionSectionBlock,
    testimonials_section: TestimonialsSectionBlock,
    quality_section: QualitySectionBlock,
    explore_banner: ExploreBannerBlock,
    subscription_banner: SubscriptionBannerBlock,
    disclaimer_section: DisclaimerBlock,
    legal_page: LegalPageBlock,
    about_us: AboutUsBlock,
    collection_products: CollectionProductsBlock,
  },
})
