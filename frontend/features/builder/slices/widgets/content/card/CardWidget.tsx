import React from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

interface CardWidgetProps {
  title?: string;
  description?: string;
  className?: string;
  showImage?: boolean;
  imageUrl?: string;
  children?: React.ReactNode;
}

export const CardWidget: React.FC<CardWidgetProps> = ({ 
  title, 
  description, 
  className = "", 
  showImage = false,
  imageUrl = "https://picsum.photos/400/200",
  children 
}) => (
  <Card className={className}>
    {showImage && (
      <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl">
        <Image
          src={imageUrl}
          alt="Card image"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    )}
    {(title || description) && (
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <div className="text-xs text-muted-foreground mt-1">{description}</div>}
      </CardHeader>
    )}
    <CardContent>{children}</CardContent>
  </Card>
);
