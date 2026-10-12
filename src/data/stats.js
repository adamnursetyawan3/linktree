/**
 * DATA STATISTIK HOMEPAGE (DASHBOARD EDITORIAL)
 * File ini berisi data metrik performa, kunjungan, dan distribusi sistem.
 * Setiap metrik memiliki atribut `source`: "live" | "lokal" | "statis".
 */

// ============================================================================
// 1. STATISTIK PENGUNJUNG (VISITORS)
// GANTI ANGKA INI DENGAN DATA ASLI DARI ANALYTICS ATAU LOG SERVER
// ============================================================================
export const visitorsStats = {
    total: {
        value: 28410,
        formatted: "28,410",
        label: "Total Kunjungan",
        change: "+14.2%",
        source: "statis" // "live" | "lokal" | "statis"
    },
    days7: {
        value: 2490,
        formatted: "2,490",
        label: "7 Hari Terakhir",
        change: "+8.4%",
        source: "statis",
        // Array harian untuk grafik garis (7 hari terakhir)
        daily: [
            { date: "05/10", label: "Senin", count: 310 },
            { date: "06/10", label: "Selasa", count: 345 },
            { date: "07/10", label: "Rabu", count: 390 },
            { date: "08/10", label: "Kamis", count: 360 },
            { date: "09/10", label: "Jumat", count: 420 },
            { date: "10/10", label: "Sabtu", count: 325 },
            { date: "11/10", label: "Minggu", count: 340 }
        ]
    },
    days30: {
        value: 11280,
        formatted: "11,280",
        label: "30 Hari Terakhir",
        change: "+18.6%",
        source: "statis",
        // Array harian untuk grafik garis (30 hari terakhir)
        daily: [
            { date: "12/09", count: 280 },
            { date: "13/09", count: 295 },
            { date: "14/09", count: 310 },
            { date: "15/09", count: 340 },
            { date: "16/09", count: 320 },
            { date: "17/09", count: 360 },
            { date: "18/09", count: 350 },
            { date: "19/09", count: 385 },
            { date: "20/09", count: 390 },
            { date: "21/09", count: 410 },
            { date: "22/09", count: 375 },
            { date: "23/09", count: 360 },
            { date: "24/09", count: 420 },
            { date: "25/09", count: 435 },
            { date: "26/09", count: 390 },
            { date: "27/09", count: 380 },
            { date: "28/09", count: 415 },
            { date: "29/09", count: 450 },
            { date: "30/09", count: 440 },
            { date: "01/10", count: 465 },
            { date: "02/10", count: 430 },
            { date: "03/10", count: 410 },
            { date: "04/10", count: 380 },
            { date: "05/10", count: 310 },
            { date: "06/10", count: 345 },
            { date: "07/10", count: 390 },
            { date: "08/10", count: 360 },
            { date: "09/10", count: 420 },
            { date: "10/10", count: 325 },
            { date: "11/10", count: 340 }
        ]
    },
    days90: {
        value: 28410,
        formatted: "28,410",
        label: "90 Hari Terakhir",
        change: "+24.1%",
        source: "statis",
        // Array mingguan agregat untuk rentang 90 hari
        daily: [
            { date: "M1", count: 1850 },
            { date: "M2", count: 1940 },
            { date: "M3", count: 2120 },
            { date: "M4", count: 2200 },
            { date: "M5", count: 2050 },
            { date: "M6", count: 2310 },
            { date: "M7", count: 2480 },
            { date: "M8", count: 2600 },
            { date: "M9", count: 2520 },
            { date: "M10", count: 2690 },
            { date: "M11", count: 2810 },
            { date: "M12", count: 2840 }
        ]
    }
};

// ============================================================================
// 2. SUMBER LALU LINTAS (TRAFFIC SOURCES)
// GANTI ANGKA INI DENGAN DATA ASLI (TOTAL HARUS 100%)
// ============================================================================
export const trafficSources = {
    source: "statis",
    items: [
        { name: "Direct / Terminal URL", percentage: 42, count: "11,932", tag: "Direct" },
        { name: "GitHub Repositories", percentage: 26, count: "7,386", tag: "Referral" },
        { name: "WhatsApp Komunitas", percentage: 18, count: "5,114", tag: "Social" },
        { name: "Discord Server", percentage: 14, count: "3,978", tag: "Community" }
    ]
};

// ============================================================================
// 3. DISTRIBUSI WILAYAH & PERANGKAT (REGIONS & DEVICES)
// GANTI ANGKA INI DENGAN DATA ASLI
// ============================================================================
export const regionStats = {
    source: "statis",
    items: [
        { code: "ID", name: "Indonesia", percentage: 74, ping: "12ms" },
        { code: "SG", name: "Singapura", percentage: 14, ping: "28ms" },
        { code: "US", name: "Amerika Serikat", percentage: 7, ping: "148ms" },
        { code: "OT", name: "Wilayah Lain", percentage: 5, ping: "96ms" }
    ]
};

export const deviceSplit = {
    source: "statis",
    items: [
        { type: "Desktop (Linux/Mac/Win)", percentage: 58, label: "Workstation" },
        { type: "Mobile (Android/iOS)", percentage: 38, label: "Handheld" },
        { type: "Tablet & Others", percentage: 4, label: "Portable" }
    ]
};

// ============================================================================
// 4. KETERSEDIAAN SISTEM & WAKTU AKTIF (UPTIME & STABILITY)
// GANTI ANGKA INI DENGAN DATA ASLI
// ============================================================================
export const uptimeStats = {
    percentage: "99.98%",
    duration: "365 Hari Online",
    status: "Operational",
    avgResponseTime: "48ms",
    source: "statis"
};

// ============================================================================
// 5. DATA FALLBACK GITHUB (DIPAKAI JIKA API GAGAL ATAU LIMIT TERCAPAI)
// GANTI ANGKA INI DENGAN DATA ASLI REPOSITORI GITHUB
// ============================================================================
export const githubFallbackStats = {
    source: "lokal",
    publicRepos: 18,
    followers: 42,
    contributions: 640,
    commitStreak: "24 Hari Berturut-turut",
    topLanguage: "TypeScript",
    profileUrl: "https://github.com/adamnursetyawan3"
};
