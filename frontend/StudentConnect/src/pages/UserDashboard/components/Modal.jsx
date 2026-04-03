import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, footer }) {
    const modalRef = useRef(null);

    useEffect(() => {
        // isOpen===false means controlled-closed; undefined means uncontrolled (parent handles it)
        if (isOpen === false) return;
        document.body.style.overflow = 'hidden';
        modalRef.current?.focus();
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Early return AFTER all hooks — supports both controlled (isOpen prop) and
    // uncontrolled (parent conditionally renders the component) usage patterns.
    if (isOpen === false) return null;

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
            <div
                className="modal"
                ref={modalRef}
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="modal-close" onClick={onClose} aria-label="Close modal">
                        <X size={16} />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>,
        document.body
    );
}
