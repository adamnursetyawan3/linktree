import React, { useEffect, useRef } from 'react';

// JARINGAN TITIK DAN GARIS REDUP (MAKS 36 TITIK) DENGAN AUTO-PAUSE SAAT TAB TIDAK AKTIF
const NetworkCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Hormati prefers-reduced-motion
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (motionQuery.matches) return;

        let animationFrameId;
        let isTabActive = !document.hidden;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        const handleVisibilityChange = () => {
            isTabActive = !document.hidden;
            if (isTabActive) {
                lastTime = performance.now();
                render(performance.now());
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Kepadatan titik dibatasi maksimal 36 titik agar ringan
        const count = Math.min(36, Math.max(18, Math.floor((width * height) / 32000)));
        const particles = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.18,
            vy: (Math.random() - 0.5) * 0.18,
            radius: Math.random() * 1.2 + 0.8,
            alpha: Math.random() * 0.25 + 0.1,
        }));

        const MAX_DIST = 100;
        let lastTime = performance.now();

        const render = (time) => {
            if (!isTabActive) return;

            const delta = Math.min((time - lastTime) / 1000, 0.1);
            lastTime = time;

            ctx.clearRect(0, 0, width, height);

            // Perbarui partikel
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx * delta * 60;
                p.y += p.vy * delta * 60;

                if (p.x < 0) p.x = width;
                else if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                else if (p.y > height) p.y = 0;
            }

            // Gambar garis penghubung antar titik (alpha maks 0.35)
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist < MAX_DIST) {
                        const lineAlpha = Math.min(0.35, (1 - dist / MAX_DIST) * 0.14);
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        // Menggunakan warna blue-5 (#3A68B0) dengan alpha maks 0.35
                        ctx.strokeStyle = `rgba(58, 104, 176, ${lineAlpha.toFixed(3)})`;
                        ctx.lineWidth = 0.7;
                        ctx.stroke();
                    }
                }
            }

            // Gambar titik (alpha maks 0.35)
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                const dotAlpha = Math.min(0.35, p.alpha * 0.5);
                ctx.fillStyle = `rgba(90, 134, 204, ${dotAlpha.toFixed(3)})`;
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return <canvas ref={canvasRef} className="network-canvas" aria-hidden="true" />;
};

export default NetworkCanvas;
