document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('anime-grid');
    if (!grid) return;

    const favorites = JSON.parse(localStorage.getItem('watchme_favorites')) || [];

    if (favorites.length === 0) {
        grid.innerHTML = `<p style="color: #9ca3af; grid-column: 1 / -1; text-align: center; padding: 40px;">Belum ada anime di daftar favorit Anda. Silakan tambahkan dari halaman detail anime!</p>`;
        return;
    }

    favorites.forEach(anime => {
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
});