import React, { useEffect } from 'react';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
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
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close filters">
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