import React, { useState, useEffect } from 'react';

// EFEK KETIK PELAN ALA TERMINAL DENGAN KURSOR BERKEDIP (HANYA SEKALI SAAT LOAD)
const TypewriterText = ({ text = '', speed = 24, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        // Hormati prefers-reduced-motion: langsung tampilkan teks penuh
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setDisplayedText(text);
            setIsTyping(false);
            onComplete?.();
            return;
        }

        let currentIndex = 0;
        setDisplayedText('');
        setIsTyping(true);

        const interval = setInterval(() => {
            currentIndex += 1;
            setDisplayedText(text.slice(0, currentIndex));

            if (currentIndex >= text.length) {
                clearInterval(interval);
                setIsTyping(false);
                onComplete?.();
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return (
        <span className="typewriter-container">
            <span>{displayedText}</span>
            <span className={`typewriter-cursor ${isTyping ? 'active' : 'idle'}`} aria-hidden="true">
                _
            </span>
        </span>
    );
};

export default TypewriterText;
