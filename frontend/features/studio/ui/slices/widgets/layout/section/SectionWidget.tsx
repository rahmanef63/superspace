import React from 'react';
import { cn } from '@/lib/utils';

interface SectionWidgetProps {
  name?: string;
  tag?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'nav';
  display?: 'block' | 'flex' | 'grid' | 'inline' | 'inline-block' | 'inline-flex';
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  width?: 'auto' | 'full' | 'screen' | 'min' | 'max' | 'fit' | '1/2' | '1/3' | '2/3' | '1/4' | '3/4';
  height?: 'auto' | 'full' | 'screen' | 'min' | 'max' | 'fit';
  maxWidth?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  background?: 'none' | 'white' | 'gray-50' | 'gray-100' | 'gray-200' | 'black' | 'transparent';
  backgroundImage?: string;
  backgroundSize?: 'auto' | 'cover' | 'contain';
  backgroundPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  backgroundRepeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y';
  border?: boolean;
  borderColor?: 'gray-200' | 'gray-300' | 'gray-400' | 'black' | 'white';
  borderWidth?: '0' | '1' | '2' | '4' | '8';
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  zIndex?: 'auto' | '0' | '10' | '20' | '30' | '40' | '50';
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  opacity?: '0' | '25' | '50' | '75' | '100';
  className?: string;
  children?: React.ReactNode;
}

export const SectionWidget: React.FC<SectionWidgetProps> = ({
  name = "Section",
  tag = "section",
  display = "block",
  direction = "row",
  justify = "start",
  align = "start",
  wrap = "nowrap",
  gap = "none",
  padding = "md",
  margin = "none",
  width = "full",
  height = "auto",
  maxWidth = "none",
  background = "none",
  backgroundImage = "",
  backgroundSize = "cover",
  backgroundPosition = "center",
  backgroundRepeat = "no-repeat",
  border = false,
  borderColor = "gray-200",
  borderWidth = "1",
  borderStyle = "solid",
  rounded = "none",
  shadow = "none",
  position = "static",
  zIndex = "auto",
  overflow = "visible",
  opacity = "100",
  className = "",
  children
}) => {
  const Tag = tag as React.ElementType;

  const getDisplayClasses = () => {
    const classes: string[] = [display];
    
    if (display === 'flex') {
      classes.push(`flex-${direction}`);
      if (justify !== 'start') classes.push(`justify-${justify}`);
      if (align !== 'start') classes.push(`items-${align}`);
      if (wrap !== 'nowrap') classes.push(`flex-${wrap}`);
    }
    
    return classes.join(' ');
  };

  const getSpacingClasses = () => {
    const classes: string[] = [];
    
    if (gap !== 'none') {
      const gapMap = {
        xs: '1', sm: '2', md: '4', lg: '6', xl: '8', '2xl': '12'
      };
      classes.push(`gap-${gapMap[gap as keyof typeof gapMap]}`);
    }
    
    if (padding !== 'none') {
      const paddingMap = {
        xs: '1', sm: '2', md: '4', lg: '6', xl: '8', '2xl': '12'
      };
      classes.push(`p-${paddingMap[padding as keyof typeof paddingMap]}`);
    }
    
    if (margin !== 'none') {
      const marginMap = {
        xs: '1', sm: '2', md: '4', lg: '6', xl: '8', '2xl': '12'
      };
      classes.push(`m-${marginMap[margin as keyof typeof marginMap]}`);
    }
    
    return classes.join(' ');
  };

  const getSizeClasses = () => {
    const classes: string[] = [];
    
    if (width !== 'auto') classes.push(`w-${width}`);
    if (height !== 'auto') classes.push(`h-${height}`);
    if (maxWidth !== 'none') classes.push(`max-w-${maxWidth}`);
    
    return classes.join(' ');
  };

  const getBackgroundClasses = () => {
    const classes: string[] = [];
    
    if (background !== 'none') classes.push(`bg-${background}`);
    if (backgroundImage) {
      classes.push(`bg-${backgroundSize}`);
      classes.push(`bg-${backgroundPosition}`);
      classes.push(`bg-${backgroundRepeat}`);
    }
    
    return classes.join(' ');
  };

  const getBorderClasses = () => {
    if (!border) return '';
    
    const classes: string[] = [];
    classes.push('border');
    if (borderWidth !== '1') classes.push(`border-${borderWidth}`);
    if (borderColor !== 'gray-200') classes.push(`border-${borderColor}`);
    if (borderStyle !== 'solid') classes.push(`border-${borderStyle}`);
    
    return classes.join(' ');
  };

  const getEffectClasses = () => {
    const classes: string[] = [];
    
    if (rounded !== 'none') classes.push(`rounded-${rounded}`);
    if (shadow !== 'none') classes.push(`shadow-${shadow}`);
    if (position !== 'static') classes.push(position);
    if (zIndex !== 'auto') classes.push(`z-${zIndex}`);
    if (overflow !== 'visible') classes.push(`overflow-${overflow}`);
    if (opacity !== '100') classes.push(`opacity-${opacity}`);
    
    return classes.join(' ');
  };

  const sectionClasses = cn(
    getDisplayClasses(),
    getSpacingClasses(),
    getSizeClasses(),
    getBackgroundClasses(),
    getBorderClasses(),
    getEffectClasses(),
    className
  );

  const backgroundStyles: React.CSSProperties | undefined = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize,
        backgroundPosition,
        backgroundRepeat,
      }
    : undefined;

  return (
    <Tag className={sectionClasses} data-section-name={name} style={backgroundStyles}>
      {children}
    </Tag>
  );
};
