import { useEffect, useRef } from 'react';

export const useFocusTrap = (isActive = false, onClose) => {
    const containerRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        if (!isActive) return;

        // Simpan elemen yang aktif sebelum modal terbuka
        triggerRef.current = document.activeElement;

        const container = containerRef.current;
        if (!container) return;

        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length > 0) {
            // Fokuskan elemen pertama yang dapat difokus
            const firstElement = focusableElements[0];
            firstElement.focus();
        }

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose?.();
                return;
            }

            if (e.key === 'Tab') {
                const currentFocusables = Array.from(
                    container.querySelectorAll(
                        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                    )
                );

                if (currentFocusables.length === 0) return;

                const first = currentFocusables[0];
                const last = currentFocusables[currentFocusables.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            // Kembalikan fokus ke trigger awal
            if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
                triggerRef.current.focus();
            }
        };
    }, [isActive, onClose]);

    return containerRef;
};

export default useFocusTrap;
