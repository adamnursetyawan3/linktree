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

// TOOLTIP SUMBER DATA RESMI
const SOURCE_TOOLTIPS = {
    live: 'Diambil langsung',
    lokal: 'Dari perangkat ini',
    statis: 'Diisi manual'
};

// PENANDA SUMBER DATA: PILL 11PX, BORDER 1PX BLUE-7, TEKS BLUE-3, LATAR TRANSPARAN
const SourceIndicator = memo(({ source = 'statis' }) => {
    const label = source.toUpperCase();
    const tooltipText = SOURCE_TOOLTIPS[source] || 'Diisi manual';
    return (
        <span 
            className="metric-data-badge font-mono"
            title={`Sumber data: ${tooltipText}`}
        >
            {label}
        </span>
    );
});

export const MetricsDashboard = memo(({ soundEnabled, sectionNumber = "02" }) => {
    const [sectionRef, isRevealed] = useReveal();
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

    const formattedVisitorTotal = (visitorsStats.total.value || 28410).toLocaleString('id-ID');
    const changeFormatted = (visitorsStats.total.change || '+14.2%').replace('.', ',');
    const uptimePctFormatted = (uptimeStats.percentage || '99.98%').replace('.', ',');
    const currentChartCountFormatted = currentVisitorData.value 
        ? currentVisitorData.value.toLocaleString('id-ID')
        : (currentVisitorData.formatted || '').replace(',', '.');

    return (
        <section 
            id="metrik" 
            ref={sectionRef} 
            className={`editorial-section ${isRevealed ? 'revealed' : ''}`}
            aria-label="Metrik dan performa sistem"
        >
            <div className="section-container">
                {/* HEADER SECTION EDITORIAL TANPA KOTAK */}
                <header className="editorial-section-header">
                    <div className="editorial-kicker-row">
                        <span className="editorial-kicker-num">{sectionNumber}</span>
                        <span className="editorial-kicker-slash" aria-hidden="true">/</span>
                        <h2 className="editorial-kicker-title">Metrik dan performa sistem</h2>
                    </div>
                    <div className="editorial-header-actions">
                        <span className="text-xs font-mono text-[var(--blue-3)]">
                            Pembaruan realtime dan histori
                        </span>
                    </div>
                </header>

                {/* 1. ANGKA STATISTIK DISPLAY BESAR TANPA KARTU (LAYOUT TERBUKA) */}
                <div className="editorial-hero-stats-grid">
                    <div className="editorial-stat-block">
                        <div className="editorial-stat-header-row">
                            <span className="editorial-stat-label">TOTAL PENGUNJUNG</span>
                            <SourceIndicator source={visitorsStats.total.source} />
                        </div>
                        <div className="editorial-stat-number">{formattedVisitorTotal}</div>
                        <div className="editorial-stat-sub">
                            <span className="stat-change-val font-mono">{changeFormatted}</span>
                            <span className="stat-sub-text">sejak peluncuran</span>
                        </div>
                    </div>

                    <div className="editorial-stat-block">
                        <div className="editorial-stat-header-row">
                            <span className="editorial-stat-label">KETERSEDIAAN SISTEM</span>
                            <SourceIndicator source={uptimeStats.source} />
                        </div>
                        <div className="editorial-stat-number">{uptimePctFormatted}</div>
                        <div className="editorial-stat-sub">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
                            <span className="stat-sub-text">{uptimeStats.duration.toLowerCase()}</span>
                        </div>
                    </div>

                    <div className="editorial-stat-block">
                        <div className="editorial-stat-header-row">
                            <span className="editorial-stat-label">RATA-RATA RESPON</span>
                            <SourceIndicator source={uptimeStats.source} />
                        </div>
                        <div className="editorial-stat-number">{uptimeStats.avgResponseTime}</div>
                        <div className="editorial-stat-sub">
                            <span className="stat-sub-text">Latensi server edge</span>
                        </div>
                    </div>

                    <div className="editorial-stat-block">
                        <div className="editorial-stat-header-row">
                            <span className="editorial-stat-label">REPOSITORI PUBLIK</span>
                            <SourceIndicator source={githubFallbackStats.source} />
                        </div>
                        <div className="editorial-stat-number">{githubFallbackStats.publicRepos.toLocaleString('id-ID')}</div>
                        <div className="editorial-stat-sub">
                            <span className="stat-sub-text">{githubFallbackStats.commitStreak.toLowerCase()}</span>
                        </div>
                    </div>
                </div>

                {/* 2. GRAFIK TREN HARIAN (SVG MURNI TANPA KARTU) */}
                <div className="editorial-chart-wrapper">
                    <div className="editorial-chart-toolbar">
                        <div className="flex items-center gap-2">
                            <Activity size={14} strokeWidth={1.5} className="text-[var(--blue-4)]" aria-hidden="true" />
                            <span className="font-mono text-xs text-[var(--blue-2)] tracking-wide">
                                Tren kunjungan harian
                            </span>
                            <span className="text-xs text-[var(--blue-3)] ml-2 hidden sm:inline">
                                ({currentChartCountFormatted} kunjungan)
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
                                7 hari
                            </button>
                            <button
                                role="tab"
                                aria-selected={selectedPeriod === 'days30'}
                                className={`editorial-tab-btn ${selectedPeriod === 'days30' ? 'active' : ''}`}
                                onClick={() => handlePeriodChange('days30')}
                            >
                                30 hari
                            </button>
                            <button
                                role="tab"
                                aria-selected={selectedPeriod === 'days90'}
                                className={`editorial-tab-btn ${selectedPeriod === 'days90' ? 'active' : ''}`}
                                onClick={() => handlePeriodChange('days90')}
                            >
                                90 hari
                            </button>
                        </div>
                    </div>

                    {/* SVG GRAPH CANVAS (LANGSUNG DI ATAS LATAR HALAMAN) */}
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

                        {/* HOVER TOOLTIP FLOATER (OVERLAY BERBINGKAI RESMI) */}
                        {hoveredPoint && (
                            <div 
                                className="editorial-chart-tooltip"
                                style={{
                                    left: `${(hoveredPoint.x / chartMetrics.width) * 100}%`,
                                    top: `${(hoveredPoint.y / chartMetrics.height) * 100}%`
                                }}
                            >
                                <span className="font-mono text-[11px] text-[var(--blue-1)] font-semibold">
                                    {hoveredPoint.count.toLocaleString('id-ID')} kunjungan
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

                {/* 3. DISTRIBUSI SUMBER TRAFFIC & PERANGKAT (LAYOUT TERBUKA) */}
                <div className="editorial-breakdown-grid">
                    {/* SUMBER LALU LINTAS */}
                    <div className="editorial-breakdown-col">
                        <div className="editorial-breakdown-header">
                            <span className="font-mono text-xs text-[var(--blue-2)] font-semibold tracking-wider">
                                Sumber lalu lintas
                            </span>
                            <SourceIndicator source={trafficSources.source} />
                        </div>

                        <div className="editorial-traffic-list">
                            {trafficSources.items.map((src, idx) => {
                                const numericCount = parseInt(String(src.count).replace(/[^\d]/g, ''), 10) || 0;
                                return (
                                    <div key={idx} className="editorial-traffic-row">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-[var(--blue-2)] font-medium">{src.name}</span>
                                            <div className="flex items-center gap-2 font-mono">
                                                <span className="text-[var(--blue-3)]">{numericCount.toLocaleString('id-ID')}</span>
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
                                );
                            })}
                        </div>
                    </div>

                    {/* WILAYAH DAN PERANGKAT */}
                    <div className="editorial-breakdown-col">
                        <div className="editorial-breakdown-header">
                            <span className="font-mono text-xs text-[var(--blue-2)] font-semibold tracking-wider">
                                Wilayah dan perangkat
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

MetricsDashboard.displayName = 'MetricsDashboard';
export default MetricsDashboard;

