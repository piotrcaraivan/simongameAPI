document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = "https://d5dsv84kj5buag61adme.apigw.yandexcloud.net";
    const rowsPerPage = 10;
    let currentPage = 1;
    let allPlayers = [];
    let filteredPlayers = [];

    const fetchPlayers = async () => {
        try {
            const response = await fetch(`${apiUrl}/players`);
            const players = await response.json();
            allPlayers = players;
            filteredPlayers = [...allPlayers];
            renderTable();
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
        }
    };

    const renderTable = () => {
        const tableBody = document.getElementById('scoreBody');
        if (!tableBody) return;
        tableBody.innerHTML = '';

        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const pagePlayers = filteredPlayers.slice(start, end);

        pagePlayers.forEach((player) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${player.Login || "Неизвестно"}</td>
                <td>${player.Score !== undefined ? player.Score : "N/A"}</td>
                <td>${player.Date || "?"}</td>
            `;

            if (typeof player.Score === 'number') {
                if (player.Score < 2) {
                    row.style.backgroundColor = 'red';
                } else if (player.Score >= 2 && player.Score < 8) {
                    row.style.backgroundColor = 'yellow';
                } else if (player.Score >= 8) {
                    row.style.backgroundColor = 'lightgreen';
                }
            }

            tableBody.appendChild(row);
        });

        updatePaginationInfo();
    };

    const updatePaginationInfo = () => {
        const totalPages = Math.ceil(filteredPlayers.length / rowsPerPage);
        const pageInfo = document.getElementById('pageInfo');
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
    
        if (pageInfo) {
            pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
        }
    
        if (prevPage) {
            prevPage.disabled = currentPage === 1;
        }
    
        if (nextPage) {
            nextPage.disabled = currentPage === totalPages;
        }
    };
    

    const applyFiltersAndSort = () => {
        const searchName = document.getElementById('searchName')?.value.toLowerCase() || '';
        const sortOption = document.getElementById('sortOption')?.value || '';
        const selectedColor = document.getElementById('colorSelect')?.value || 'all';
    
        filteredPlayers = allPlayers.filter((player) => {
            const matchesName = player.Login.toLowerCase().includes(searchName);
            const matchesColor = selectedColor === 'all' || player.Color === selectedColor;
            return matchesName && matchesColor;
        });
    
        if (sortOption === 'scoreDesc') {
            filteredPlayers.sort((a, b) => b.Score - a.Score);
        } else if (sortOption === 'scoreAsc') {
            filteredPlayers.sort((a, b) => a.Score - b.Score);
        } else if (sortOption === 'nameAsc') {
            filteredPlayers.sort((a, b) => a.Login.localeCompare(b.Login));
        } else if (sortOption === 'nameDesc') {
            filteredPlayers.sort((a, b) => b.Login.localeCompare(a.Login));
        }
    
        currentPage = 1;
        renderTable();
    };
    
    const updatePlayerScore = async (login, score) => {
        const token = localStorage.getItem('authToken');
    
        try {
            const response = await fetch(`${apiUrl}/players/${login}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ score }),
            });
    
            if (!response.ok) {
                throw new Error('Ошибка при обновлении очков');
            }
    
            console.log('Очки игрока обновлены успешно.');
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
        }
    };

    const saveScoreAfterGame = async (score) => {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            console.error('Пользователь не авторизован.');
            return;
        }
        await updatePlayerScore(currentUser, score);
    };

    document.getElementById('prevPage')?.addEventListener('click', () => {
        currentPage--;
        renderTable();
    });

    document.getElementById('nextPage')?.addEventListener('click', () => {
        currentPage++;
        renderTable();
    });

    document.getElementById('filterApply')?.addEventListener('click', applyFiltersAndSort);

    fetchPlayers();
});
