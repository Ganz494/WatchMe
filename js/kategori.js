async function fetchAniList(query, variables) {
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        });
        const json = await response.json();
        return json.data;
    } catch (error) {
        console.error('AniList API Error:', error);
        return null;
    }
}

const genresQuery = `
query {
    GenreCollection
}
`;

const animeByGenreQuery = `
query ($genre: String, $page: Int, $perPage: Int) {
    Page (page: $page, perPage: $perPage) {
        media (genre: $genre, sort: [POPULARITY_DESC], type: ANIME) {
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
`;

async function muatGenre() {
    const genreListContainer = document.getElementById('genre-list');
    if (!genreListContainer) return;

    const data = await fetchAniList(genresQuery, {});
    if (data && data.GenreCollection) {
        genreListContainer.innerHTML = '';
        data.GenreCollection.forEach(genreName => {
            const btn = document.createElement('button');
            btn.textContent = genreName;
            btn.style.cssText = 'background: #1f2937; color: #38bdf8; border: 1px solid #374151; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-weight: 500; transition: background 0.2s;';
            btn.onmouseover = () => btn.style.background = '#374151';
            btn.onmouseout = () => btn.style.background = '#1f2937';
            btn.onclick = () => muatAnimeByGenre(genreName);
            genreListContainer.appendChild(btn);
        });
    }
}

async function muatAnimeByGenre(genreName) {
    const grid = document.getElementById('anime-grid');
    const catTitle = document.getElementById('cat-title');
    if (!grid) return;
    if (catTitle) catTitle.textContent = `Genre: ${genreName}`;
    
    grid.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>';
    
    const data = await fetchAniList(animeByGenreQuery, { genre: genreName, page: 1, perPage: 24 });
    
    grid.innerHTML = '';
    if (data && data.Page && data.Page.media && data.Page.media.length > 0) {
        data.Page.media.forEach(anime => {
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
            grid.appendChild(card);
        });
    } else {
        grid.innerHTML = `<p style="color: #9ca3af; grid-column: 1 / -1; text-align: center;">Tidak ada anime dalam genre ini.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    muatGenre();
    muatAnimeByGenre('Action');
});