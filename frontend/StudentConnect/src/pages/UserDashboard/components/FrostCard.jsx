import React from 'react';

export default function FrostCard({ children, className = '', flat = false, style = {}, ...props }) {
    return (
        <div
            className={`${flat ? 'frost-card-flat' : 'frost-card'} ${className}`}
            style={style}
            {...props}
        >
            {children}
        </div>
    );
}
