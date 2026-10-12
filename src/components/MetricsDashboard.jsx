import React, { useState, useMemo, memo } from 'react';
import { 
    Activity, 
    TrendingUp, 
    Radio, 
    Laptop, 
    Globe2, 
    GitCommit, 
    Server
} from 'lucide-react';
import { 
    visitorsStats, 
    trafficSources, 
    regionStats, 
    deviceSplit, 
    uptimeStats, 
    githubFallbackStats 
} from '../data/stats.js';
import { playClickHaptic } from '../utils/audioHaptic.js';
import { useReveal } from '../hooks/useReveal.js';

// BADGE SUMBER DATA KECIL (UNBOXED TEXT DISCIPLINE)
const SourceIndicator = memo(({ source = 'statis' }) => {
    const label = source.toUpperCase();
    return (
        <span 
            className="text-[10px] font-mono tracking-widest text-[var(--blue-4)] opacity-70"
            title={`Sumber data: ${source}`}
        >
            [{label}]
        </span>
    );
});

export const MetricsDashboard = memo(({ soundEnabled }) => {
    const [sectionRef, isRevealed] = useReveal({ threshold: 0.08 });
    const [selectedPeriod, setSelectedPeriod] = useState('days7'); // 'days7' | 'days30' | 'days90'
    const [hoveredPoint, setHoveredPoint] = useState(null);

    const currentVisitorData = visitorsStats[selectedPeriod] || visitorsStats.days7;
    const dailyPoints = currentVisitorData.daily || [];

    // HITUNG TITIK SVG KOORDINAT SECARA DINAMIS
    const chartMetrics = useMemo(() => {
        if (!dailyPoints.length) return { path: '', areaPath: '', points: [], minVal: 0, maxVal: 100 };
        
        const counts = dailyPoints.map(p => p.count);
        const minVal = Math.floor(Math.min(...counts) * 0.9);
        const maxVal = Math.ceil(Math.max(...counts) * 1.08);
        const range = maxVal - minVal || 1;

        const width = 800;
        const height = 180;
        const paddingX = 20;
        const paddingY = 20;
        const chartWidth = width - paddingX * 2;
        const chartHeight = height - paddingY * 2;

        const coords = dailyPoints.map((p, idx) => {
            const x = paddingX + (idx / (dailyPoints.length - 1)) * chartWidth;
            const y = height - paddingY - ((p.count - minVal) / range) * chartHeight;
            return { x, y, ...p };
        });

        // GENERATE SMOOTH BEZIER CURVE
        let path = `M ${coords[0].x} ${coords[0].y}`;
        for (let i = 0; i < coords.length - 1; i++) {
            const current = coords[i];
            const next = coords[i + 1];
            const controlX = (current.x + next.x) / 2;
            path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
        }

        const areaPath = `${path} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

        return { path, areaPath, points: coords, minVal, maxVal, width, height };
    }, [dailyPoints]);

    const handlePeriodChange = (period) => {
        playClickHaptic(soundEnabled);
        setSelectedPeriod(period);
        setHoveredPoint(null);
    };

    return (
        <section 
            id="metrik" 
            ref={sectionRef} 
            className={`editorial-section ${isRevealed ? 'revealed' : ''}`}
            aria-label="Metrik & Analitik Sistem"
        >
            <div className="section-container">
                {/* HEADER SECTION EDITORIAL TANPA KOTAK */}
                <header className="editorial-section-header">
                    <div className="editorial-kicker-row">
                        <span className="editorial-kicker-num">02</span>
                        <span className="editorial-kicker-slash">/</span>
                        <span className="editorial-kicker-title">METRIK & PERFORMA SISTEM</span>
                    </div>
                    <div className="editorial-header-actions">
                        <span className="text-xs font-mono text-[var(--blue-3)]">
                            PEMBARUAN REALTIME & HISTORI
                        </span>
                    </div>
                </header>

                {/* 1. ANGKA STATISTIK DISPLAY BESAR DI ATAS CANVAS (HAIRLINE SEPARATORS) */}
                <div className="editorial-hero-stats-grid">
                    <div className="editorial-stat-block">
                        <div className="flex items-center justify-between mb-1">
                            <span className="editorial-stat-label">Total Pengunjung</span>
                            <SourceIndicator source={visitorsStats.total.source} />
                        </div>
                        <div className="editorial-stat-number">{visitorsStats.total.formatted}</div>
                        <div className="editorial-stat-sub">
                            <span className="text-[var(--blue-4)] font-mono text-xs">{visitorsStats.total.change}</span>
                            <span className="text-[var(--blue-3)] text-xs ml-2">sejak peluncuran</span>
                        </div>
                    </div>

                    <div className="editorial-stat-block">
                        <div className="flex items-center justify-between mb-1">
                            <span className="editorial-stat-label">Ketersediaan Sistem</span>
                            <SourceIndicator source={uptimeStats.source} />
                        </div>
                        <div className="editorial-stat-number">{uptimeStats.percentage}</div>
                        <div className="editorial-stat-sub">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2" />
                            <span className="text-[var(--blue-3)] text-xs">{uptimeStats.duration}</span>
                        </div>
                    </div>

                    <div className="editorial-stat-block">
                        <div className="flex items-center justify-between mb-1">
                            <span className="editorial-stat-label">Rata-rata Respon</span>
                            <SourceIndicator source={uptimeStats.source} />
                        </div>
                        <div className="editorial-stat-number">{uptimeStats.avgResponseTime}</div>
                        <div className="editorial-stat-sub">
                            <span className="text-[var(--blue-3)] text-xs">Edge server latency</span>
                        </div>
                    </div>

                    <div className="editorial-stat-block">
                        <div className="flex items-center justify-between mb-1">
                            <span className="editorial-stat-label">Repositori Publik</span>
                            <SourceIndicator source={githubFallbackStats.source} />
                        </div>
                        <div className="editorial-stat-number">{githubFallbackStats.publicRepos}</div>
                        <div className="editorial-stat-sub">
                            <span className="text-[var(--blue-3)] text-xs">{githubFallbackStats.commitStreak}</span>
                        </div>
                    </div>
                </div>

                {/* 2. GRAFIK TREN HARIAN (SVG MURNI TANPA CARD BOX) */}
                <div className="editorial-chart-wrapper">
                    <div className="editorial-chart-toolbar">
                        <div className="flex items-center gap-2">
                            <Activity size={14} strokeWidth={1.5} className="text-[var(--blue-4)]" />
                            <span className="font-mono text-xs text-[var(--blue-2)] tracking-wide">
                                TREN KUNJUNGAN HARIAN
                            </span>
                            <span className="text-xs text-[var(--blue-3)] hidden sm:inline">
                                ({currentVisitorData.formatted} kunjungan)
                            </span>
                        </div>

                        {/* FILTER PERIODE TAB BUTTONS */}
                        <div className="editorial-segmented-tabs" role="tablist">
                            <button
                                role="tab"
                                aria-selected={selectedPeriod === 'days7'}
                                className={`editorial-tab-btn ${selectedPeriod === 'days7' ? 'active' : ''}`}
                                onClick={() => handlePeriodChange('days7')}
                            >
                                7 Hari
                            </button>
                            <button
                                role="tab"
                                aria-selected={selectedPeriod === 'days30'}
                                className={`editorial-tab-btn ${selectedPeriod === 'days30' ? 'active' : ''}`}
                                onClick={() => handlePeriodChange('days30')}
                            >
                                30 Hari
                            </button>
                            <button
                                role="tab"
                                aria-selected={selectedPeriod === 'days90'}
                                className={`editorial-tab-btn ${selectedPeriod === 'days90' ? 'active' : ''}`}
                                onClick={() => handlePeriodChange('days90')}
                            >
                                90 Hari
                            </button>
                        </div>
                    </div>

                    {/* SVG GRAPH CANVAS */}
                    <div className="editorial-svg-container">
                        <svg
                            viewBox={`0 0 ${chartMetrics.width} ${chartMetrics.height}`}
                            className="w-full h-auto overflow-visible select-none"
                            preserveAspectRatio="none"
                        >
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--blue-5)" stopOpacity="0.32" />
                                    <stop offset="100%" stopColor="var(--blue-5)" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>

                            {/* HAIRLINE HORIZONTAL GRID LINES */}
                            <line x1="20" y1="20" x2="780" y2="20" stroke="var(--blue-7)" strokeOpacity="0.35" strokeDasharray="3 3" />
                            <line x1="20" y1="90" x2="780" y2="90" stroke="var(--blue-7)" strokeOpacity="0.25" strokeDasharray="3 3" />
                            <line x1="20" y1="160" x2="780" y2="160" stroke="var(--blue-7)" strokeOpacity="0.4" />

                            {/* AREA UNDER CURVE */}
                            <path d={chartMetrics.areaPath} fill="url(#chartGradient)" />

                            {/* STROKE CURVE */}
                            <path 
                                d={chartMetrics.path} 
                                fill="none" 
                                stroke="var(--blue-4)" 
                                strokeWidth="2" 
                                strokeLinecap="round"
                            />

                            {/* HOVER CROSSHAIR & POINTS */}
                            {chartMetrics.points.map((pt, i) => (
                                <g key={i}>
                                    <circle
                                        cx={pt.x}
                                        cy={pt.y}
                                        r={hoveredPoint?.index === i ? 5 : 2.5}
                                        fill="var(--blue-1)"
                                        stroke="var(--blue-5)"
                                        strokeWidth={hoveredPoint?.index === i ? 2.5 : 1}
                                        className="transition-all duration-200 cursor-pointer"
                                        onMouseEnter={() => setHoveredPoint({ ...pt, index: i })}
                                    />
                                    {/* TRANSPARENT HIT BOX */}
                                    <rect
                                        x={pt.x - 12}
                                        y={0}
                                        width={24}
                                        height={chartMetrics.height}
                                        fill="transparent"
                                        className="cursor-pointer"
                                        onMouseEnter={() => setHoveredPoint({ ...pt, index: i })}
                                        onMouseLeave={() => setHoveredPoint(null)}
                                    />
                                </g>
                            ))}

                            {/* CROSSHAIR & TOOLTIP IF HOVERED */}
                            {hoveredPoint && (
                                <g pointerEvents="none">
                                    <line
                                        x1={hoveredPoint.x}
                                        y1={0}
                                        x2={hoveredPoint.x}
                                        y2={chartMetrics.height}
                                        stroke="var(--blue-3)"
                                        strokeWidth="1"
                                        strokeDasharray="2 2"
                                    />
                                </g>
                            )}
                        </svg>

                        {/* HOVER TOOLTIP FLOATER */}
                        {hoveredPoint && (
                            <div 
                                className="editorial-chart-tooltip"
                                style={{
                                    left: `${(hoveredPoint.x / chartMetrics.width) * 100}%`,
                                    top: `${(hoveredPoint.y / chartMetrics.height) * 100}%`
                                }}
                            >
                                <span className="font-mono text-[11px] text-[var(--blue-1)] font-semibold">
                                    {hoveredPoint.count} Kunjungan
                                </span>
                                <span className="text-[10px] text-[var(--blue-3)] block font-mono">
                                    {hoveredPoint.date} {hoveredPoint.label ? `· ${hoveredPoint.label}` : ''}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* AXIS LABELS */}
                    <div className="editorial-chart-axis-labels">
                        <span>{dailyPoints[0]?.date || ''}</span>
                        <span>{dailyPoints[Math.floor(dailyPoints.length / 2)]?.date || ''}</span>
                        <span>{dailyPoints[dailyPoints.length - 1]?.date || ''}</span>
                    </div>
                </div>

                {/* 3. DISTRIBUSI SUMBER TRAFFIC & PERANGKAT (TABEL & BARIS EDITORIAL) */}
                <div className="editorial-breakdown-grid">
                    {/* SUMBER LALU LINTAS */}
                    <div className="editorial-breakdown-col">
                        <div className="editorial-breakdown-header">
                            <span className="font-mono text-xs text-[var(--blue-2)] font-semibold tracking-wider">
                                SUMBER LALU LINTAS
                            </span>
                            <SourceIndicator source={trafficSources.source} />
                        </div>

                        <div className="editorial-traffic-list">
                            {trafficSources.items.map((src, idx) => (
                                <div key={idx} className="editorial-traffic-row">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-[var(--blue-2)] font-medium">{src.name}</span>
                                        <div className="flex items-center gap-2 font-mono">
                                            <span className="text-[var(--blue-3)]">{src.count}</span>
                                            <span className="text-[var(--blue-1)] font-semibold w-10 text-right">{src.percentage}%</span>
                                        </div>
                                    </div>
                                    <div className="editorial-hairline-track">
                                        <div 
                                            className="editorial-hairline-fill" 
                                            style={{ width: `${src.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* WILAYAH & PERANGKAT */}
                    <div className="editorial-breakdown-col">
                        <div className="editorial-breakdown-header">
                            <span className="font-mono text-xs text-[var(--blue-2)] font-semibold tracking-wider">
                                WILAYAH & PERANGKAT
                            </span>
                            <SourceIndicator source={regionStats.source} />
                        </div>

                        <div className="editorial-table-list">
                            {/* REGION ROWS */}
                            {regionStats.items.map((reg, idx) => (
                                <div key={idx} className="editorial-table-row">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[11px] text-[var(--blue-4)] w-6">{reg.code}</span>
                                        <span className="text-xs text-[var(--blue-2)]">{reg.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 font-mono text-xs">
                                        <span className="text-[var(--blue-3)] text-[11px]">{reg.ping}</span>
                                        <span className="text-[var(--blue-1)] font-semibold">{reg.percentage}%</span>
                                    </div>
                                </div>
                            ))}

                            {/* DEVICE ROW SUMMARY */}
                            <div className="editorial-table-row border-t border-[var(--blue-7)]/60 pt-3 mt-2">
                                <span className="text-xs text-[var(--blue-3)] font-mono">PERANGKAT</span>
                                <div className="flex items-center gap-3 text-xs font-mono">
                                    <span className="text-[var(--blue-2)]">Desktop {deviceSplit.items[0].percentage}%</span>
                                    <span className="text-[var(--blue-7)]">/</span>
                                    <span className="text-[var(--blue-2)]">Mobile {deviceSplit.items[1].percentage}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
});

export default MetricsDashboard;
