import React from 'react';

export default function Avatar({ src, alt = '', size = 'md', online = null, className = '' }) {
    return (
        <div className={`avatar avatar-${size} ${className}`} role="img" aria-label={alt}>
            <img src={src} alt={alt} loading="lazy" />
            {online !== null && (
                <span
                    className={`avatar-status ${online ? 'online' : 'offline'}`}
                    aria-label={online ? 'Online' : 'Offline'}
                />
            )}
        </div>
    );
}
