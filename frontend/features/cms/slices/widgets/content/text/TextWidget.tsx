import React from 'react';
import { cn } from '@/lib/utils';

interface TextWidgetProps {
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'strong' | 'em' | 'small';
  content?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl';
  weight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  color?: 'inherit' | 'current' | 'transparent' | 'black' | 'white' | 'gray-50' | 'gray-100' | 'gray-200' | 'gray-300' | 'gray-400' | 'gray-500' | 'gray-600' | 'gray-700' | 'gray-800' | 'gray-900' | 'red-500' | 'blue-500' | 'green-500' | 'yellow-500' | 'purple-500' | 'pink-500' | 'indigo-500';
  align?: 'left' | 'center' | 'right' | 'justify';
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  decoration?: 'none' | 'underline' | 'overline' | 'line-through';
  spacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
  leading?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
  family?: 'sans' | 'serif' | 'mono';
  style?: 'normal' | 'italic';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  background?: 'none' | 'white' | 'gray-50' | 'gray-100' | 'gray-200' | 'black' | 'transparent';
  border?: boolean;
  borderColor?: 'gray-200' | 'gray-300' | 'gray-400' | 'black' | 'white';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  truncate?: boolean;
  whitespace?: 'normal' | 'nowrap' | 'pre' | 'pre-line' | 'pre-wrap';
  className?: string;
}

export const TextWidget: React.FC<TextWidgetProps> = ({ 
  tag = "p", 
  content = "Text content", 
  size = "base",
  weight = "normal",
  color = "gray-900",
  align = "left",
  transform = "none",
  decoration = "none",
  spacing = "normal",
  leading = "normal",
  family = "sans",
  style = "normal",
  margin = "none",
  padding = "none",
  background = "none",
  border = false,
  borderColor = "gray-200",
  rounded = "none",
  shadow = "none",
  maxWidth = "none",
  truncate = false,
  whitespace = "normal",
  className = ""
}) => {
  const Tag = tag as keyof JSX.IntrinsicElements;

  const getTextClasses = () => {
    const classes = [];
    
    if (size !== 'base') classes.push(`text-${size}`);
    if (weight !== 'normal') classes.push(`font-${weight}`);
    if (color !== 'gray-900') classes.push(`text-${color}`);
    if (align !== 'left') classes.push(`text-${align}`);
    if (transform !== 'none') classes.push(transform);
    if (decoration !== 'none') classes.push(decoration);
    if (spacing !== 'normal') classes.push(`tracking-${spacing}`);
    if (leading !== 'normal') classes.push(`leading-${leading}`);
    if (family !== 'sans') classes.push(`font-${family}`);
    if (style !== 'normal') classes.push(style);
    
    return classes.join(' ');
  };

  const getSpacingClasses = () => {
    const classes = [];
    
    if (margin !== 'none') {
      const marginMap = {
        xs: '1', sm: '2', md: '4', lg: '6', xl: '8', '2xl': '12'
      };
      classes.push(`m-${marginMap[margin as keyof typeof marginMap]}`);
    }
    
    if (padding !== 'none') {
      const paddingMap = {
        xs: '1', sm: '2', md: '4', lg: '6', xl: '8', '2xl': '12'
      };
      classes.push(`p-${paddingMap[padding as keyof typeof paddingMap]}`);
    }
    
    return classes.join(' ');
  };

  const getLayoutClasses = () => {
    const classes = [];
    
    if (background !== 'none') classes.push(`bg-${background}`);
    if (border) {
      classes.push('border');
      if (borderColor !== 'gray-200') classes.push(`border-${borderColor}`);
    }
    if (rounded !== 'none') classes.push(`rounded-${rounded}`);
    if (shadow !== 'none') classes.push(`shadow-${shadow}`);
    if (maxWidth !== 'none') classes.push(`max-w-${maxWidth}`);
    if (truncate) classes.push('truncate');
    if (whitespace !== 'normal') classes.push(`whitespace-${whitespace}`);
    
    return classes.join(' ');
  };

  const textClasses = cn(
    getTextClasses(),
    getSpacingClasses(),
    getLayoutClasses(),
    className
  );

  return (
    <Tag className={textClasses}>
      {content}
    </Tag>
  );
};
