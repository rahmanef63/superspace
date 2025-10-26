import React from 'react';
import { cn } from '@/lib/utils';

interface ImageProps {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
  className?: string;
  objectFit?: string;
}

export const ImageWidget: React.FC<ImageProps> = ({ 
  src = "https://picsum.photos/640/420",
  alt = "placeholder",
  width = "640",
  height = "420",
  rounded = true,
  className = "w-full h-auto",
  objectFit = "cover"
}) => (
  <img 
    src={src} 
    alt={alt} 
    width={Number(width) || undefined} 
    height={Number(height) || undefined} 
    className={cn(
      className, 
      rounded && "rounded-2xl",
      `object-${objectFit}`
    )} 
  />
);
