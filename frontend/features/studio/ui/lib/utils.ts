// Re-export shared utilities from global lib to avoid duplication
export { cn, uid, clamp } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function generateContainerClasses(props: {
  maxWidth?: string;
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  borderRadius?: string;
  border?: string;
  shadow?: string;
  className?: string;
}) {
  const classes = [];
  
  if (props.maxWidth) {
    classes.push(`max-w-${props.maxWidth}`);
  }
  
  if (props.padding) {
    classes.push(`p-${props.padding}`);
  }
  
  if (props.margin) {
    classes.push(`m-${props.margin}`);
  }
  
  if (props.backgroundColor) {
    classes.push(`bg-${props.backgroundColor}`);
  }
  
  if (props.borderRadius) {
    classes.push(`rounded-${props.borderRadius}`);
  }
  
  if (props.border) {
    classes.push(`border-${props.border}`);
  }
  
  if (props.shadow) {
    classes.push(`shadow-${props.shadow}`);
  }
  
  if (props.className) {
    classes.push(props.className);
  }
  
  return cn(...classes);
}

export function generateRowClasses(props: {
  gap?: string;
  justifyContent?: string;
  alignItems?: string;
  flexWrap?: string;
  className?: string;
}) {
  const classes = ['flex'];
  
  if (props.gap) {
    classes.push(`gap-${props.gap}`);
  }
  
  if (props.justifyContent) {
    classes.push(`justify-${props.justifyContent}`);
  }
  
  if (props.alignItems) {
    classes.push(`items-${props.alignItems}`);
  }
  
  if (props.flexWrap) {
    classes.push(`flex-${props.flexWrap}`);
  }
  
  if (props.className) {
    classes.push(props.className);
  }
  
  return cn(...classes);
}

export function generateColumnClasses(props: {
  width?: string;
  gap?: string;
  justifyContent?: string;
  alignItems?: string;
  className?: string;
}) {
  const classes = ['flex', 'flex-col'];
  
  if (props.width) {
    classes.push(`w-${props.width}`);
  }
  
  if (props.gap) {
    classes.push(`gap-${props.gap}`);
  }
  
  if (props.justifyContent) {
    classes.push(`justify-${props.justifyContent}`);
  }
  
  if (props.alignItems) {
    classes.push(`items-${props.alignItems}`);
  }
  
  if (props.className) {
    classes.push(props.className);
  }
  
  return cn(...classes);
}

export function generateSectionClasses(props: {
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  minHeight?: string;
  className?: string;
}) {
  const classes = [];
  
  if (props.padding) {
    classes.push(`p-${props.padding}`);
  }
  
  if (props.margin) {
    classes.push(`m-${props.margin}`);
  }
  
  if (props.backgroundColor) {
    classes.push(`bg-${props.backgroundColor}`);
  }
  
  if (props.minHeight) {
    classes.push(`min-h-${props.minHeight}`);
  }
  
  if (props.className) {
    classes.push(props.className);
  }
  
  return cn(...classes);
}
