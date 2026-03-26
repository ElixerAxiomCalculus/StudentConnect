import React from 'react';

export default function Badge({ count, variant = 'danger', className = '' }) {
    if (!count && count !== 0) return null;
    return (
        <span className={`badge badge-${variant} ${className}`} aria-label={`${count} notifications`}>
            {count}
        </span>
    );
}
