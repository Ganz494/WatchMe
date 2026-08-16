const detailQuery = `
query ($id: Int) {
    Media (id: $id, type: ANIME) {
        id
        title {
            romaji
            english
        }
        description
        coverImage {
            large
        }
        averageScore
        genres
        recommendations (sort: [RATING_DESC], perPage: 5) {
            nodes {
                mediaRecommendation {
                    id
                    title {
                        romaji
                        english
                    }
                    coverImage {
                        large
                    }
                    averageScore
                }
            }
        }
    }
}
`;

async function fetchAniListDetail(query, variables) {
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ query, variables })
        });
        const json = await response.json();
        return json.data;
    } catch (error) {
        console.error('AniList API Error:', error);
        return null;
    }
}

async function loadAnimeDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const animeId = urlParams.get('id');
    if (!animeId) return;

    const data = await fetchAniListDetail(detailQuery, { id: parseInt(animeId) });
    if (data && data.Media) {
        renderDetail(data.Media);
        setupWatchlist(data.Media);
        renderRecommendations(data.Media.recommendations?.nodes);
    } else {
        document.getElementById('anime-synopsis').textContent = "Detail anime tidak ditemukan.";
    }
}

function renderDetail(anime) {
    const titleEl = document.getElementById('anime-title');
    const synopsisEl = document.getElementById('anime-synopsis');
    const scoreEl = document.getElementById('anime-score');
    const imgEl = document.getElementById('anime-img');
    
    if (titleEl) titleEl.textContent = anime.title?.english || anime.title?.romaji || 'Unknown';
    if (scoreEl) scoreEl.textContent = `⭐ Skor: ${anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A'}`;
    if (imgEl && anime.coverImage) imgEl.src = anime.coverImage.large || '';

    if (synopsisEl) {
        const rawSynopsis = anime.description || "No synopsis available.";
        synopsisEl.textContent = rawSynopsis.replace(/<[^>]*>?/gm, '');
    }
}

function setupWatchlist(anime) {
    const favBtn = document.getElementById('favorite-btn');
    if (!favBtn) return;

    let favorites = JSON.parse(localStorage.getItem('watchme_favorites')) || [];
    const isFav = favorites.some(fav => fav.id === anime.id);

    if (isFav) {
        favBtn.textContent = '❌ Hapus dari Favorit';
        favBtn.style.background = '#ef4444';
        favBtn.style.color = 'white';
    }

    favBtn.onclick = () => {
        favorites = JSON.parse(localStorage.getItem('watchme_favorites')) || [];
        const index = favorites.findIndex(fav => fav.id === anime.id);

        if (index > -1) {
            favorites.splice(index, 1);
            localStorage.setItem('watchme_favorites', JSON.stringify(favorites));
            favBtn.textContent = '⭐ Simpan ke Favorit';
            favBtn.style.background = '#38bdf8';
            favBtn.style.color = '#111827';
        } else {
            favorites.push({
                id: anime.id,
                title: anime.title,
                coverImage: anime.coverImage,
                averageScore: anime.averageScore
            });
            localStorage.setItem('watchme_favorites', JSON.stringify(favorites));
            favBtn.textContent = '❌ Hapus dari Favorit';
            favBtn.style.background = '#ef4444';
            favBtn.style.color = 'white';
        }
    };
}

function renderRecommendations(nodes) {
    const recGrid = document.getElementById('recommendation-grid');
    if (!recGrid) return;
    recGrid.innerHTML = '';

    const validRecs = nodes?.map(n => n.mediaRecommendation).filter(Boolean) || [];
    if (validRecs.length === 0) {
        recGrid.innerHTML = `<p style="color: #9ca3af; grid-column: 1 / -1;">Tidak ada rekomendasi serupa.</p>`;
        return;
    }

    validRecs.forEach(anime => {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.onclick = () => { window.location.href = `nonton.html?id=${anime.id}`; };

        const title = anime.title.english || anime.title.romaji || 'Unknown';
        const imageUrl = anime.coverImage?.large || '';
        const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : 'N/A';

        card.innerHTML = `
            <img src="${imageUrl}" alt="${title}">
            <div class="anime-info">
                <h3>${title}</h3>
                <span>⭐ Skor: ${score}</span>
            </div>
        `;
        recGrid.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', loadAnimeDetail);