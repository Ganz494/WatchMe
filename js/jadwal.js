const seasonalQuery = `
query ($season: MediaSeason, $year: Int, $perPage: Int) {
    Page (page: 1, perPage: $perPage) {
        media (season: $season, seasonYear: $year, status: RELEASING, sort: [POPULARITY_DESC], type: ANIME) {
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

// Tentukan musim otomatis berdasarkan bulan saat ini
function getCurrentSeasonInfo() {
    const date = new Date();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    let season = "SPRING";
    if (month >= 1 && month <= 3) season = "WINTER";
    else if (month >= 4 && month <= 6) season = "SPRING";
    else if (month >= 7 && month <= 9) season = "SUMMER";
    else season = "FALL";

    return { season, year };
}

async function loadSeasonalAnime() {
    const grid = document.getElementById('anime-grid');
    if (!grid) return;

    grid.innerHTML = `
        <div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>
        <div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>
    `;

    const { season, year } = getCurrentSeasonInfo();

    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                query: seasonalQuery,
                variables: { season: season, year: year, perPage: 40 }
            })
        });
        const json = await response.json();
        const mediaList = json.data?.Page?.media || [];

        grid.innerHTML = '';
        if (mediaList.length === 0) {
            grid.innerHTML = `<p style="color: #9ca3af; grid-column: 1 / -1; text-align: center;">Tidak ada data jadwal musim ini.</p>`;
            return;
        }

        mediaList.forEach(anime => {
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

    } catch (error) {
        console.error('Error loading schedule:', error);
        grid.innerHTML = `<p style="color: #9ca3af; grid-column: 1 / -1; text-align: center;">Gagal memuat jadwal anime.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', loadSeasonalAnime);