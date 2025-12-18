import React from 'react';
import { cn, generateContainerClasses } from '@/frontend/features/studio/ui/lib/utils';

interface ContainerProps {
  display?: string;
  direction?: string;
  gap?: string;
  padding?: string;
  margin?: string;
  width?: string;
  height?: string;
  position?: string;
  className?: string;
  children?: React.ReactNode;
}

export const ContainerWidget: React.FC<ContainerProps> = (props) => {
  const generatedClasses = generateContainerClasses(props);
  const finalClasses = cn(generatedClasses, props.className);

  return (
    <div className={finalClasses}>
      {props.children}
    </div>
  );
};
