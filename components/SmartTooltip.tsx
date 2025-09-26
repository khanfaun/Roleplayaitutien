import React, { useState, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';

interface SmartTooltipProps {
  children: React.ReactNode;
  target: HTMLElement | null;
  show: boolean;
  className?: string;
  position?: 'auto' | 'top' | 'bottom' | 'left' | 'right';
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export const SmartTooltip = React.forwardRef<HTMLDivElement, SmartTooltipProps>(({ children, target, show, className, position = 'auto', onClick }, forwardedRef) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const tooltipRef = (forwardedRef || internalRef) as React.RefObject<HTMLDivElement>;

    const [style, setStyle] = useState<React.CSSProperties>({
        opacity: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        pointerEvents: 'none',
    });

    useLayoutEffect(() => {
        if (show && target && tooltipRef.current) {
            const parentRect = target.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const margin = 8;

            let top: number;
            let left: number;

            if (position === 'right') {
                top = parentRect.top + parentRect.height / 2 - tooltipRect.height / 2;
                left = parentRect.right + margin;

                // Adjust if it overflows right edge of viewport
                if (left + tooltipRect.width > viewportWidth - margin) {
                    left = parentRect.left - tooltipRect.width - margin; // Try to position on the left
                }
            } else { // 'auto', 'top', 'bottom' default behavior
                // Vertical positioning: prefer above
                if (parentRect.top - tooltipRect.height - margin > 0) {
                    top = parentRect.top - tooltipRect.height - margin;
                } else { // Not enough space above, place below
                    top = parentRect.bottom + margin;
                }

                // Horizontal positioning: prefer centered
                left = parentRect.left + (parentRect.width / 2) - (tooltipRect.width / 2);
            }


            // General collision detection after initial placement
            if (top < margin) {
                top = margin;
            }
            if (top + tooltipRect.height > viewportHeight - margin) {
                top = viewportHeight - tooltipRect.height - margin;
            }
            if (left < margin) {
                left = margin;
            }
            if (left + tooltipRect.width > viewportWidth - margin) {
                left = viewportWidth - tooltipRect.width - margin;
            }

            setStyle(prev => ({
                ...prev,
                top: `${top}px`,
                left: `${left}px`,
                opacity: 1,
                transition: 'opacity 0.2s',
                pointerEvents: onClick ? 'auto' : 'none',
            }));
        } else {
            setStyle(prev => ({
                ...prev,
                opacity: 0,
                pointerEvents: 'none',
            }));
        }
    }, [show, target, children, position, onClick]);

    if (!show) return null;

    return ReactDOM.createPortal(
        <div
            ref={tooltipRef}
            style={style}
            className={className}
            onClick={onClick}
        >
            {children}
        </div>,
        document.body
    );
});