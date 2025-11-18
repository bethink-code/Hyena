import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  logoUrl?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
}

export function HeroSection({
  title,
  subtitle,
  imageSrc,
  logoUrl,
  ctaText,
  onCtaClick,
  className,
}: HeroSectionProps) {
  return (
    <div className={cn("relative h-64 overflow-hidden rounded-lg", className)}>
      <div className="absolute inset-0">
        <img
          src={imageSrc}
          alt="Hero background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
      </div>
      {logoUrl && (
        <div className="absolute top-4 left-4">
          <img
            src={logoUrl}
            alt="Property logo"
            className="h-10 object-contain"
            data-testid="img-property-logo"
          />
        </div>
      )}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold text-white mb-3" data-testid="text-hero-title">
          {title}
        </h1>
        <p className="text-lg text-white/90 mb-6 max-w-2xl" data-testid="text-hero-subtitle">
          {subtitle}
        </p>
        {ctaText && onCtaClick && (
          <Button
            size="lg"
            onClick={onCtaClick}
            className="bg-primary hover:bg-primary/90"
            data-testid="button-hero-cta"
          >
            {ctaText}
          </Button>
        )}
      </div>
    </div>
  );
}
