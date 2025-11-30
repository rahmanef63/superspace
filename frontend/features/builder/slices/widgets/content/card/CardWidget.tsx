import React from 'react';
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
      <div className="aspect-video w-full overflow-hidden rounded-t-2xl">
        <img 
          src={imageUrl} 
          alt="Card image" 
          className="w-full h-full object-cover"
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
