async function fetchAniList(query, variables) {
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ query, variables })
        });
        const json = await response.json();
        return json.data;
    } catch (error) {
        console.error('AniList API Error:', error);
        return null;
    }
}

const animeQuery = `
query ($page: Int, $perPage: Int, $search: String, $sort: [MediaSort]) {
    Page (page: $page, perPage: $perPage) {
        pageInfo {
            currentPage
            hasNextPage
            lastPage
        }
        media (search: $search, sort: $sort, type: ANIME) {
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

let currentPage = 1;
let currentSearchQuery = null;

async function muatAnime(search = null, page = 1) {
    const grid = document.getElementById('anime-grid');
    const sectionTitle = document.getElementById('section-title');
    if (!grid) return;

    currentSearchQuery = search;
    currentPage = page;

    if (sectionTitle) {
        sectionTitle.textContent = search ? `Hasil Pencarian: "${search}" (Hal. ${page})` : "Anime Trending & Terbaru";
    }

    grid.innerHTML = `
        <div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>
        <div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>
    `;

    const variables = {
        page: page,
        perPage: 30,
        search: search ? search : undefined,
        sort: search ? ["SEARCH_MATCH", "POPULARITY_DESC"] : ["TRENDING_DESC", "POPULARITY_DESC"]
    };

    const data = await fetchAniList(animeQuery, variables);

    if (data && data.Page) {
        displayAnimeResults(data.Page.media, grid);
        setupPagination(data.Page.pageInfo);
    } else {
        grid.innerHTML = `<p style="color: #9ca3af; grid-column: 1 / -1; text-align: center;">Tidak ada anime ditemukan.</p>`;
        removePagination();
    }
}

function displayAnimeResults(animeList, grid) {
    grid.innerHTML = '';
    if (!animeList || animeList.length === 0) {
        grid.innerHTML = `<p style="color: #9ca3af; grid-column: 1 / -1; text-align: center;">Tidak ada anime ditemukan.</p>`;
        return;
    }

    animeList.forEach(anime => {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.onclick = () => { window.location.href = `nonton.html?id=${anime.id}`; };

        const title = anime.title.english || anime.title.romaji || 'Unknown Title';
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
}

function setupPagination(pageInfo) {
    let pagContainer = document.getElementById('pagination-container');
    if (!pagContainer) {
        pagContainer = document.createElement('div');
        pagContainer.id = 'pagination-container';
        pagContainer.style.cssText = 'display: flex; justify-content: center; align-items: center; gap: 15px; margin: 30px 0; grid-column: 1 / -1;';
        const mainContainer = document.querySelector('main') || document.body;
        mainContainer.appendChild(pagContainer);
    }

    pagContainer.innerHTML = '';

    if (pageInfo.currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '← Sebelumnya';
        prevBtn.style.cssText = 'background: #1f2937; color: #38bdf8; border: 1px solid #374151; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold;';
        prevBtn.onclick = () => { muatAnime(currentSearchQuery, pageInfo.currentPage - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };
        pagContainer.appendChild(prevBtn);
    }

    const pageInfoText = document.createElement('span');
    pageInfoText.textContent = `Halaman ${pageInfo.currentPage}`;
    pageInfoText.style.cssText = 'color: #9ca3af; font-weight: 500;';
    pagContainer.appendChild(pageInfoText);

    if (pageInfo.hasNextPage) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Berikutnya →';
        nextBtn.style.cssText = 'background: #1f2937; color: #38bdf8; border: 1px solid #374151; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold;';
        nextBtn.onclick = () => { muatAnime(currentSearchQuery, pageInfo.currentPage + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };
        pagContainer.appendChild(nextBtn);
    }
}

function removePagination() {
    const pagContainer = document.getElementById('pagination-container');
    if (pagContainer) pagContainer.innerHTML = '';
}

// Fitur Tombol Random Anime Generator
async function handleRandomAnime() {
    const randomPage = Math.floor(Math.random() * 50) + 1;
    const data = await fetchAniList(animeQuery, { page: randomPage, perPage: 1, sort: ["POPULARITY_DESC"] });
    if (data && data.Page && data.Page.media && data.Page.media.length > 0) {
        window.location.href = `nonton.html?id=${data.Page.media[0].id}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    muatAnime(null, 1);

    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const randomBtn = document.getElementById('random-btn');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            muatAnime(query.length > 0 ? query : null, 1);
        });
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                muatAnime(query.length > 0 ? query : null, 1);
            }
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            muatAnime(null, 1);
        });
    }

    if (randomBtn) {
        randomBtn.addEventListener('click', handleRandomAnime);
    }
});