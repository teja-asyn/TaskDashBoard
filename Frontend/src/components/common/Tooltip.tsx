import React, { useState, useRef, useEffect, useCallback } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const positionRef = useRef(position);

  // Keep position ref in sync
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const showTooltip = () => {
    if (disabled || !content) return;
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
    setTooltipPosition(null);
  };

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) {
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    let top = 0;
    let left = 0;
    const currentPosition = positionRef.current;

    switch (currentPosition) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + 8;
        left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.right + scrollX + 8;
        break;
    }

    // Keep tooltip within viewport
    const padding = 8;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding;
    }
    if (top < padding) top = padding;
    if (top + tooltipRect.height > window.innerHeight + scrollY - padding) {
      top = triggerRect.top + scrollY - tooltipRect.height - 8;
    }

    setTooltipPosition({ top, left });
  }, []);

  // Calculate position after tooltip is rendered
  useEffect(() => {
    if (!isVisible) return;

    // Wait for DOM to update, then calculate position
    const timer = setTimeout(() => {
      if (tooltipRef.current && triggerRef.current) {
        updatePosition();
      }
    }, 0);

    const handleResize = () => {
      if (tooltipRef.current && triggerRef.current) {
        updatePosition();
      }
    };
    
    const handleScroll = () => {
      if (tooltipRef.current && triggerRef.current) {
        updatePosition();
      }
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isVisible, updatePosition]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const childWithProps = React.cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      // Handle existing ref if present
      const existingRef = (children as any).ref;
      if (existingRef) {
        if (typeof existingRef === 'function') {
          existingRef(node);
        } else if (typeof existingRef === 'object' && 'current' in existingRef) {
          (existingRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }
      }
    },
    onMouseEnter: (e: React.MouseEvent) => {
      showTooltip();
      if (children.props.onMouseEnter) {
        children.props.onMouseEnter(e);
      }
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hideTooltip();
      if (children.props.onMouseLeave) {
        children.props.onMouseLeave(e);
      }
    },
    onFocus: (e: React.FocusEvent) => {
      showTooltip();
      if (children.props.onFocus) {
        children.props.onFocus(e);
      }
    },
    onBlur: (e: React.FocusEvent) => {
      hideTooltip();
      if (children.props.onBlur) {
        children.props.onBlur(e);
      }
    },
  });

  return (
    <>
      {childWithProps}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`fixed z-[9999] px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none whitespace-nowrap ${
            tooltipPosition ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
          style={tooltipPosition ? {
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          } : {
            top: '-9999px',
            left: '-9999px',
          }}
        >
          {content}
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
              position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
              position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
              'left-[-4px] top-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </>
  );
};

export default Tooltip;
