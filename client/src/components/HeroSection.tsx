import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { BetaBadge } from "./BetaBadge";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  logoUrl?: string;
  hotelName?: string;
  location?: string;
  badges?: string[];
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
}

export function HeroSection({
  title,
  subtitle,
  imageSrc,
  logoUrl,
  hotelName,
  location,
  badges,
  ctaText,
  onCtaClick,
  className,
}: HeroSectionProps) {
  return (
    <div className={cn("relative min-h-[280px] md:min-h-[360px] overflow-hidden rounded-lg", className)}>
      {/* Base Image */}
      <div className="absolute inset-0">
        <img
          src={imageSrc}
          alt="Hero background"
          className="w-full h-full object-cover"
          data-testid="img-hero-background"
        />
        {/* Layered Gradient Overlays */}
        <div 
          className="absolute inset-0" 
          style={{ background: 'var(--hero-overlay-radial)' }}
        />
        <div 
          className="absolute inset-0" 
          style={{ background: 'var(--hero-overlay-linear)' }}
        />
      </div>

      {/* Content Container */}
      <div className="relative h-full min-h-[280px] md:min-h-[360px] flex flex-col justify-between p-6 md:p-8">
        {/* Top Row - Brand Plaque & Beta Badge */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          {/* Brand Plaque - Top Left */}
          {(logoUrl || hotelName) && (
            <div 
              className="dark:bg-black/80 backdrop-blur-md rounded-md shadow-lg p-4 md:p-5 bg-[#0000004f]"
              data-testid="container-brand-plaque"
            >
              <div className="flex items-center gap-4">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt={hotelName || "Property logo"}
                    className="h-16 md:h-20 w-auto object-contain"
                    data-testid="img-property-logo"
                  />
                )}
                {hotelName && (
                  <div className="flex flex-col">
                    <span className="text-base md:text-lg font-semibold text-white" data-testid="text-hotel-name">
                      {hotelName}
                    </span>
                    {location && (
                      <span className="text-sm text-white/80" data-testid="text-hotel-location">
                        {location}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Beta Badge - Top Right */}
          <div className="bg-black/60 backdrop-blur-md rounded-md p-2">
            <BetaBadge />
          </div>
        </div>

        {/* Spacer for mobile, flex-grow for desktop */}
        <div className="h-20 md:flex-1 md:min-h-16" />

        {/* Content Stack - Bottom */}
        <div className="max-w-2xl space-y-2 pt-[0px] pb-[0px] ml-[20px] mr-[20px]">
          {/* Headline */}
          <h1 
            className="text-3xl md:text-4xl lg:text-5xl text-white leading-tight font-medium" 
            style={{ textWrap: 'balance' }}
            data-testid="text-hero-title"
          >
            {title}
          </h1>

          {/* Subtitle */}
          <p 
            className="text-base md:text-lg text-white/90 leading-relaxed"
            data-testid="text-hero-subtitle"
          >
            {subtitle}
          </p>

          {/* Badge Strip */}
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-2" data-testid="container-hero-badges">
              {badges.map((badge, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="bg-background/70 dark:bg-background/50 backdrop-blur-sm border-border/60 text-foreground no-default-hover-elevate no-default-active-elevate"
                  data-testid={`badge-hero-${index}`}
                >
                  {badge}
                </Badge>
              ))}
            </div>
          )}

          {/* CTA Button */}
          {ctaText && onCtaClick && (
            <div>
              <Button
                size="lg"
                onClick={onCtaClick}
                variant="default"
                data-testid="button-hero-cta"
              >
                {ctaText}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
