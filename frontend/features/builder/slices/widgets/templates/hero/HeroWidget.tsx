import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';

interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  imageUrl?: string;
  reverse?: boolean;
  className?: string;
}

export const HeroWidget: React.FC<HeroProps> = ({
  title = "Build faster with your Super Workspace",
  subtitle = "Composable widgets, live JSON schema, and shadcn-style UI.",
  ctaText = "Open Dashboard",
  ctaHref = "/dashboard",
  imageUrl = "https://picsum.photos/seed/hero/800/600",
  reverse = false,
  className = "rounded-3xl bg-gradient-to-br from-muted to-background border border-border"
}) => (
  <div className={cn("overflow-hidden p-8 md:p-10", className)}>
    <div className={cn(
      "grid items-center gap-8 md:gap-12", 
      reverse ? "md:grid-cols-[1.1fr_1fr]" : "md:grid-cols-[1.1fr_1fr]"
    )}> 
      <div className={cn("space-y-4", reverse && "order-last md:order-first")}> 
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-muted-foreground md:text-base text-sm">
          {subtitle}
        </p>
        <div className="pt-2">
          <a href={ctaHref}>
            <Button size="lg">{ctaText}</Button>
          </a>
        </div>
      </div>
      <div>
        <img 
          src={imageUrl} 
          alt="hero" 
          className="w-full h-auto rounded-2xl shadow-sm" 
        />
      </div>
    </div>
  </div>
);
