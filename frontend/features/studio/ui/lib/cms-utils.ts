export { cn } from '@/lib/utils';

export const deepMerge = (target: any, source: any): any => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
};

export const compactProps = (defaults: Record<string, any>, props: Record<string, any>) => {
  const out: Record<string, any> = {};
  Object.keys(props || {}).forEach((k) => {
    if (JSON.stringify(props[k]) !== JSON.stringify(defaults[k])) {
      out[k] = props[k];
    }
  });
  return out;
};

export const generateSectionClasses = (props: Record<string, any>) => {
  const classes = [];
  
  if (props.display) classes.push(props.display);
  if (props.direction && props.display === 'flex') {
    classes.push(`flex-${props.direction}`);
  }
  if (props.gap) classes.push(`gap-${props.gap}`);
  if (props.padding) classes.push(`p-${props.padding}`);
  if (props.margin) classes.push(`m-${props.margin}`);
  if (props.width) classes.push(`w-${props.width}`);
  if (props.height) classes.push(`h-${props.height}`);
  if (props.position) classes.push(props.position);
  
  return classes.join(' ');
};
