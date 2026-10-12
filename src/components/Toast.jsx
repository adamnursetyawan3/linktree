import React, { memo } from 'react';
import { Check, Info } from 'lucide-react';

export const Toast = memo(({ message, visible, type = 'success' }) => {
    if (!visible || !message) return null;

    return (
        <aside 
            className="portfolio-toast-container" 
            role="status" 
            aria-live="polite"
        >
            <div className="portfolio-toast-pill">
                <div className="toast-icon-wrap">
                    {type === 'success' ? (
                        <Check size={14} strokeWidth={2} className="text-[var(--status-online)]" />
                    ) : (
                        <Info size={14} strokeWidth={1.5} className="text-[var(--blue-4)]" />
                    )}
                </div>
                <span className="toast-message-text">{message}</span>
            </div>
        </aside>
    );
});

export default Toast;
