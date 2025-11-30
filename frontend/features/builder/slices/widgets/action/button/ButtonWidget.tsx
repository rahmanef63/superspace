import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonWidgetProps {
  text?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link' | 'primary' | 'secondary';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  className?: string;
  icon?: string;
  iconPosition?: 'left' | 'right' | 'top' | 'bottom';
  disabled?: boolean;
  fullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animation?: 'none' | 'bounce' | 'pulse' | 'ping' | 'spin';
  gradient?: boolean;
  borderWidth?: '0' | '1' | '2' | '4' | '8';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
  children?: React.ReactNode;
}

export const ButtonWidget: React.FC<ButtonWidgetProps> = ({ 
  text = "Button",
  variant = "default",
  size = "md",
  href = "",
  className = "",
  icon = "",
  iconPosition = "left",
  disabled = false,
  fullWidth = false,
  rounded = "md",
  shadow = "sm",
  animation = "none",
  gradient = false,
  borderWidth = "1",
  padding = "md",
  margin = "none",
  textAlign = "center",
  fontWeight = "medium",
  textTransform = "none",
  letterSpacing = "normal",
  children
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return 'bg-background text-foreground border-border hover:bg-muted';
      case 'primary':
        return 'bg-primary text-primary-foreground border-primary hover:bg-primary/90';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80';
      case 'destructive':
        return 'bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90';
      case 'outline':
        return 'bg-transparent text-foreground border-border hover:bg-muted';
      case 'ghost':
        return 'bg-transparent text-foreground border-transparent hover:bg-muted';
      case 'link':
        return 'bg-transparent text-primary border-transparent hover:underline';
      default:
        return 'bg-background text-foreground border-border hover:bg-muted';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'h-6 px-2 text-xs';
      case 'sm':
        return 'h-8 px-3 text-sm';
      case 'md':
        return 'h-10 px-4 text-sm';
      case 'lg':
        return 'h-12 px-6 text-base';
      case 'xl':
        return 'h-14 px-8 text-lg';
      default:
        return 'h-10 px-4 text-sm';
    }
  };

  const getRoundedClasses = () => {
    switch (rounded) {
      case 'none': return 'rounded-none';
      case 'sm': return 'rounded-sm';
      case 'md': return 'rounded-md';
      case 'lg': return 'rounded-lg';
      case 'xl': return 'rounded-xl';
      case 'full': return 'rounded-full';
      default: return 'rounded-md';
    }
  };

  const getShadowClasses = () => {
    switch (shadow) {
      case 'none': return '';
      case 'sm': return 'shadow-sm';
      case 'md': return 'shadow-md';
      case 'lg': return 'shadow-lg';
      case 'xl': return 'shadow-xl';
      default: return 'shadow-sm';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'bounce': return 'animate-bounce';
      case 'pulse': return 'animate-pulse';
      case 'ping': return 'animate-ping';
      case 'spin': return 'animate-spin';
      default: return '';
    }
  };

  const getPaddingClasses = () => {
    if (padding === 'none') return '';
    switch (padding) {
      case 'xs': return 'p-1';
      case 'sm': return 'p-2';
      case 'md': return 'p-3';
      case 'lg': return 'p-4';
      case 'xl': return 'p-6';
      default: return '';
    }
  };

  const getMarginClasses = () => {
    if (margin === 'none') return '';
    switch (margin) {
      case 'xs': return 'm-1';
      case 'sm': return 'm-2';
      case 'md': return 'm-3';
      case 'lg': return 'm-4';
      case 'xl': return 'm-6';
      default: return '';
    }
  };

  const getTextClasses = () => {
    const classes = [];
    
    if (textAlign !== 'center') classes.push(`text-${textAlign}`);
    if (fontWeight !== 'medium') classes.push(`font-${fontWeight}`);
    if (textTransform !== 'none') classes.push(`${textTransform}`);
    if (letterSpacing !== 'normal') classes.push(`tracking-${letterSpacing}`);
    
    return classes.join(' ');
  };

  const renderIcon = () => {
    if (!icon) return null;
    
    const iconClasses = cn(
      "flex-shrink-0",
      size === 'xs' ? 'w-3 h-3' : 
      size === 'sm' ? 'w-4 h-4' : 
      size === 'lg' ? 'w-6 h-6' : 
      size === 'xl' ? 'w-7 h-7' : 'w-5 h-5'
    );
    
    return <span className={iconClasses}>{icon}</span>;
  };

  const renderContent = () => {
    const content = children || text;
    
    if (iconPosition === 'top') {
      return (
        <div className="flex flex-col items-center gap-1">
          {renderIcon()}
          <span>{content}</span>
        </div>
      );
    }
    
    if (iconPosition === 'bottom') {
      return (
        <div className="flex flex-col items-center gap-1">
          <span>{content}</span>
          {renderIcon()}
        </div>
      );
    }
    
    if (iconPosition === 'right') {
      return (
        <div className="flex items-center gap-2">
          <span className="flex-1">{content}</span>
          {renderIcon()}
        </div>
      );
    }
    
    // Default: left
    return (
      <div className="flex items-center gap-2">
        {renderIcon()}
        <span className="flex-1">{content}</span>
      </div>
    );
  };

  const buttonClasses = cn(
    "inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
    getVariantClasses(),
    getSizeClasses(),
    getRoundedClasses(),
    getShadowClasses(),
    getAnimationClasses(),
    getPaddingClasses(),
    getMarginClasses(),
    getTextClasses(),
    fullWidth && "w-full",
    gradient && variant === 'primary' && "bg-gradient-to-r from-primary to-primary/80",
    gradient && variant === 'destructive' && "bg-gradient-to-r from-destructive to-destructive/80",
    `border-${borderWidth}`,
    className
  );

  if (href && !disabled) {
    return (
      <a href={href} className={buttonClasses}>
        {renderContent()}
      </a>
    );
  }

  return (
    <button className={buttonClasses} disabled={disabled}>
      {renderContent()}
    </button>
  );
};
