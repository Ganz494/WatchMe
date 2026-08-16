const translations = {
    id: {
        title_home: "WatchMe - Direktori & Informasi Anime Terbaik",
        title_category: "Kategori Anime - WatchMe",
        title_detail: "Detail Anime - WatchMe",
        nav_home: "Beranda",
        nav_category: "Kategori",
        search_placeholder: "Cari anime...",
        section_trending: "Anime Trending & Terbaru",
        cat_header: "Kategori & Genre Anime",
        ads_label: "Iklan / Sponsor",
        ads_placeholder: "Ruang Iklan Banner",
        footer_text: "© 2026 WatchMe. Seluruh data anime bersumber dari Jikan API / MyAnimeList. Platform direktori informasi mandiri dan legal.",
        loading_detail: "Memuat detail...",
        official_trailer: "Trailer Resmi",
        loading_text: "Memuat data anime...",
        no_data: "Tidak ada anime ditemukan.",
        error_data: "Gagal memuat data anime. Silakan muat ulang halaman.",
        no_trailer: "Trailer resmi tidak tersedia untuk anime ini."
    },
    en: {
        title_home: "WatchMe - Best Anime Directory & Information",
        title_category: "Anime Categories - WatchMe",
        title_detail: "Anime Detail - WatchMe",
        nav_home: "Home",
        nav_category: "Categories",
        search_placeholder: "Search anime...",
        section_trending: "Trending & Latest Anime",
        cat_header: "Anime Categories & Genres",
        ads_label: "Ads / Sponsor",
        ads_placeholder: "Banner Ad Space",
        footer_text: "© 2026 WatchMe. All anime data sourced from Jikan API / MyAnimeList. Independent and legal information directory platform.",
        loading_detail: "Loading details...",
        official_trailer: "Official Trailer",
        loading_text: "Loading anime data...",
        no_data: "No anime found.",
        error_data: "Failed to load anime data. Please reload the page.",
        no_trailer: "Official trailer is not available for this anime."
    }
};

function setLanguage(lang) {
    localStorage.setItem('watchme_lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });
    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
        langBtn.textContent = lang.toUpperCase();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let currentLang = localStorage.getItem('watchme_lang') || 'id';
    setLanguage(currentLang);

    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            currentLang = localStorage.getItem('watchme_lang') || 'id';
            let newLang = currentLang === 'id' ? 'en' : 'id';
            setLanguage(newLang);
            if (typeof renderDetail === 'function') {
                renderDetail();
            }
        });
    }
});

function getTranslation(key) {
    const lang = localStorage.getItem('watchme_lang') || 'id';
    return translations[lang][key] || key;
}