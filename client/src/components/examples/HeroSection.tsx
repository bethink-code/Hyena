import { HeroSection } from "../HeroSection";
import heroImage from "@assets/stock_images/modern_hotel_lobby_w_9345d9d3.jpg";

export default function HeroSectionExample() {
  return (
    <HeroSection
      title="Welcome to Network Support"
      subtitle="Get help with connectivity issues in seconds"
      imageSrc={heroImage}
      ctaText="Test My Connection"
      onCtaClick={() => console.log("CTA clicked")}
    />
  );
}
