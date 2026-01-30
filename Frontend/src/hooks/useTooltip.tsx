import React from 'react';
import Tooltip from '../components/common/Tooltip';

interface UseTooltipOptions {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
}

/**
 * Hook to wrap an element with a tooltip
 * Usage: const tooltip = useTooltip({ content: 'Tooltip text' });
 * Then: {tooltip(<button>Click me</button>)}
 */
export const useTooltip = (options: UseTooltipOptions) => {
  return (element: React.ReactElement) => {
    return (
      <Tooltip
        content={options.content}
        position={options.position}
        delay={options.delay}
        disabled={options.disabled}
      >
        {element}
      </Tooltip>
    );
  };
};

export default useTooltip;

