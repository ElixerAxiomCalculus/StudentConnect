import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

export default function SearchInput({ placeholder = 'Search...', onSearch, delay = 300 }) {
    const [value, setValue] = useState('');
    const timerRef = useRef(null);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            onSearch?.(value);
        }, delay);
        return () => clearTimeout(timerRef.current);
    }, [value, delay]);

    return (
        <div className="search-input-wrapper">
            <Search className="search-icon" size={16} />
            <input
                className="input"
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                aria-label={placeholder}
            />
        </div>
    );
}
