import React, { useEffect, useRef } from 'react';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, children }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const modalElement = modalRef.current;
        if (isOpen && modalElement) {
            window.addEventListener('keydown', handleEsc);

            // Focus trapping logic
            const focusableElements = modalElement.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            // Focus the first element (the close button)
            firstElement?.focus();

            const handleTabKey = (e: KeyboardEvent) => {
                 if (e.key !== 'Tab') return;

                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstElement) {
                        lastElement?.focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        firstElement?.focus();
                        e.preventDefault();
                    }
                }
            };

            modalElement.addEventListener('keydown', handleTabKey);

            return () => {
                window.removeEventListener('keydown', handleEsc);
                modalElement.removeEventListener('keydown', handleTabKey);
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex flex-col justify-end z-50 md:hidden"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                ref={modalRef}
                className="bg-brand-secondary rounded-t-2xl shadow-2xl w-full max-h-[85vh] flex flex-col transition-transform duration-300 ease-in-out transform translate-y-full animate-[slide-up_0.3s_ease-out_forwards]"
                onClick={(e) => e.stopPropagation()}
                style={{
                    animationName: 'slide-up',
                    animationDuration: '0.3s',
                    animationTimingFunction: 'ease-out',
                    animationFillMode: 'forwards'
                }}
            >
                <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-brand-text">Filters</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-brand-primary" aria-label="Close filters">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-4 overflow-y-auto">
                    {children}
                </div>
                <style>{`
                    @keyframes slide-up {
                        from { transform: translateY(100%); }
                        to { transform: translateY(0); }
                    }
                `}</style>
            </div>
        </div>
    );
};