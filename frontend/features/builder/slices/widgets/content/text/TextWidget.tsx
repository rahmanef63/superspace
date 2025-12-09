import React from 'react';
import { cn } from '@/lib/utils';

interface TextWidgetProps {
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'strong' | 'em' | 'small';
  content?: string;
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl';
  fontWeight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  textColor?: 'inherit' | 'current' | 'transparent' | 'black' | 'white' | 'gray-50' | 'gray-100' | 'gray-200' | 'gray-300' | 'gray-400' | 'gray-500' | 'gray-600' | 'gray-700' | 'gray-800' | 'gray-900' | 'red-500' | 'blue-500' | 'green-500' | 'yellow-500' | 'purple-500' | 'pink-500' | 'indigo-500';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'overline' | 'line-through';

  // Spacing
  letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
  lineHeight?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';

  // Typography
  fontFamily?: 'sans' | 'serif' | 'mono';
  fontStyle?: 'normal' | 'italic';

  // Box Model
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  // Layout
  background?: 'none' | 'white' | 'gray-50' | 'gray-100' | 'gray-200' | 'black' | 'transparent';
  border?: boolean;
  borderColor?: 'gray-200' | 'gray-300' | 'gray-400' | 'black' | 'white';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  truncate?: boolean;
  whitespace?: 'normal' | 'nowrap' | 'pre' | 'pre-line' | 'pre-wrap';

  className?: string;
}

export const TextWidget: React.FC<TextWidgetProps> = ({
  tag = "p",
  content = "Text content",
  fontSize = "base",
  fontWeight = "normal",
  textColor = "gray-900",
  textAlign = "left",
  textTransform = "none",
  textDecoration = "none",
  letterSpacing = "normal",
  lineHeight = "normal",
  fontFamily = "sans",
  fontStyle = "normal",
  margin = "none",
  padding = "none",
  background = "none",
  border = false,
  borderColor = "gray-200",
  borderRadius = "none",
  shadow = "none",
  maxWidth = "none",
  truncate = false,
  whitespace = "normal",
  className = ""
}) => {
  const Tag = tag as keyof JSX.IntrinsicElements;

  const getTextClasses = () => {
    const classes = [];

    if (fontSize !== 'base') classes.push(`text-${fontSize}`);
    if (fontWeight !== 'normal') classes.push(`font-${fontWeight}`);
    if (textColor !== 'gray-900') classes.push(`text-${textColor}`);
    if (textAlign !== 'left') classes.push(`text-${textAlign}`);
    if (textTransform !== 'none') classes.push(textTransform);
    if (textDecoration !== 'none') classes.push(textDecoration);
    if (letterSpacing !== 'normal') classes.push(`tracking-${letterSpacing}`);
    if (lineHeight !== 'normal') classes.push(`leading-${lineHeight}`);
    if (fontFamily !== 'sans') classes.push(`font-${fontFamily}`);
    if (fontStyle !== 'normal') classes.push(fontStyle);

    return classes.join(' ');
  };

  const getSpacingClasses = () => {
    const classes = [];

    if (margin !== 'none') {
      const marginMap = {
        xs: '1', sm: '2', md: '4', lg: '8', xl: '12', '2xl': '16'
      };
      classes.push(`m-${marginMap[margin as keyof typeof marginMap]}`);
    }

    if (padding !== 'none') {
      const paddingMap = {
        xs: '1', sm: '2', md: '4', lg: '8', xl: '12', '2xl': '16'
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
    if (borderRadius !== 'none') classes.push(`rounded-${borderRadius}`);
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
