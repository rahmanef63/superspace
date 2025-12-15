/**
 * Generic Image Component
 * A truly shared image component with no feature dependencies
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface ImageComponentProps {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
  objectFit?: string;
  className?: string;
}

export const ImageComponent: React.FC<ImageComponentProps> = ({
  src = "https://picsum.photos/640/420",
  alt = "placeholder",
  width = "640",
  height = "420",
  rounded = true,
  objectFit = "cover",
  className = "w-full h-auto"
}) => (
  <img
    src={src}
    alt={alt}
    width={Number(width) || undefined}
    height={Number(height) || undefined}
    className={cn(
      className,
      rounded && "rounded-2xl",
      objectFit && `object-${objectFit}`
    )}
  />
);

export default ImageComponent;
