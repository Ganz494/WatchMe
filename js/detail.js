let currentAnimeData = null;

async function translateText(text, targetLang) {
    if (!text || targetLang === 'en') return text;
    const chunks = [];
    let current = '';
    text.split('. ').forEach(sentence => {
        if ((current + sentence).length < 450) {
            current += (current ? '. ' : '') + sentence;
        } else {
            if (current) chunks.push(current + '.');
            current = sentence;
        }
    });
    if (current) chunks.push(current);

    let translatedChunks = [];
    for (let chunk of chunks) {
        try {
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|${targetLang}`);
            const data = await res.json();
            if (data && data.responseData && data.responseData.translatedText) {
                translatedChunks.push(data.responseData.translatedText);
            } else {
                translatedChunks.push(chunk);
            }
        } catch (e) {
            translatedChunks.push(chunk);
        }
    }
    return translatedChunks.join(' ');
}

async function renderDetail() {
    if (!currentAnimeData) return;
    const anime = currentAnimeData;
    const lang = localStorage.getItem('watchme_lang') || 'id';

    document.getElementById('anime-title').textContent = anime.title;
    document.getElementById('anime-img').src = anime.images.jpg.image_url;
    document.getElementById('anime-img').alt = anime.title;

    let synopsis = anime.synopsis || (lang === 'id' ? 'Sinopsis tidak tersedia.' : 'Synopsis not available.');
    if (anime.synopsis) {
        synopsis = await translateText(anime.synopsis, lang);
    }

    document.getElementById('anime-synopsis').textContent = synopsis;
    
    const scoreLabel = lang === 'id' ? 'Skor' : 'Score';
    document.getElementById('anime-meta').textContent = `⭐ ${scoreLabel}: ${anime.score || 'N/A'} | 📺 Total Episode: ${anime.episodes || 'N/A'} | 📌 Status: ${anime.status || 'N/A'}`;

    let watchlistBtn = document.getElementById('watchlist-btn');
    if (!watchlistBtn) {
        watchlistBtn = document.createElement('button');
        watchlistBtn.id = 'watchlist-btn';
        watchlistBtn.style.cssText = 'margin-top: 15px; background: #1f2937; color: #38bdf8; border: 1px solid #374151; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; display: block;';
        document.getElementById('anime-meta').after(watchlistBtn);
    }

    let favorites = JSON.parse(localStorage.getItem('watchme_favorites')) || [];
    const isFav = favorites.some(fav => fav.id === anime.mal_id);
    
    watchlistBtn.textContent = isFav ? (lang === 'id' ? '❤️ Hapus dari Favorit' : '❤️ Remove from Favorites') : (lang === 'id' ? '🤍 Tambah ke Favorit' : '🤍 Add to Favorites');
    
    watchlistBtn.onclick = () => {
        favorites = JSON.parse(localStorage.getItem('watchme_favorites')) || [];
        const index = favorites.findIndex(fav => fav.id === anime.mal_id);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push({ id: anime.mal_id, title: anime.title, image: anime.images.jpg.image_url });
        }
        localStorage.setItem('watchme_favorites', JSON.stringify(favorites));
        renderDetail();
    };

    const trailerContainer = document.getElementById('trailer-container');
    if (anime.trailer && anime.trailer.embed_url) {
        trailerContainer.innerHTML = `<iframe src="${anime.trailer.embed_url}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;" allowfullscreen></iframe>`;
    } else {
        const noTrailerText = lang === 'id' ? 'Trailer resmi tidak tersedia untuk anime ini.' : 'Official trailer is not available for this anime.';
        trailerContainer.innerHTML = `<p style="color: #9ca3af; padding: 40px; text-align: center;">${noTrailerText}</p>`;
    }
}

async function muatDetailAnime() {
    const urlParams = new URLSearchParams(window.location.search);
    const animeId = urlParams.get('id');
    
    if (!animeId) {
        document.getElementById('anime-title').textContent = getTranslation('no_data');
        return;
    }

    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}`);
        const result = await response.json();
        currentAnimeData = result.data;
        await renderDetail();
    } catch (error) {
        console.error('Gagal memuat detail:', error);
        document.getElementById('anime-title').textContent = getTranslation('error_data');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    muatDetailAnime();

    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            setTimeout(renderDetail, 100);
        });
    }
});