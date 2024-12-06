document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = "https://d5dsv84kj5buag61adme.apigw.yandexcloud.net";
    const colors = ['red', 'green', 'blue', 'yellow'];
    const rowsPerPage = 10;
    let currentPage = 1;
    let allPlayers = [];
    let filteredPlayers = [];
    let sequence = [];
    let userSequence = [];
    let score = 0;
    let isDisplayingSequence = false;

    const playSound = (color) => {
        const audio = new Audio(`sounds/${color}.wav`);
        audio.play();
    };

    // Fetch players and render the leaderboard
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

    const hashPassword = async (password) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    };
// Registration
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const login = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const passHash = await hashPassword(password);
            const response = await fetch(`${apiUrl}/players`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ login, password: passHash }),
            });

            if (!response.ok) throw new Error('Ошибка при регистрации');
            alert("Пользователь успешно зарегистрирован!");
        } catch (error) {
            alert("Ошибка: " + error.message);
        }
    });
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const login = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const passHash = await hashPassword(password);
            const response = await fetch(`${apiUrl}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ login, password: passHash }),
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Ошибка при входе');
            localStorage.setItem('currentUser', login);
            alert("Вы успешно вошли!");
            window.location.href = "index.html";
        } catch (error) {
            alert("Ошибка: " + error.message);
        }
    });
}

    const resetGame = () => {
        sequence = [];
        userSequence = [];
        score = 0;
        updateScore();
        disableInput();
    };

    const nextSequence = () => {
        userSequence = [];
        const nextColor = colors[Math.floor(Math.random() * colors.length)];
        sequence.push(nextColor);
        showSequence();
    };

    const showSequence = () => {
        isDisplayingSequence = true;
        disableInput();

        let index = 0;
        const interval = setInterval(() => {
            if (index >= sequence.length) {
                clearInterval(interval);
                isDisplayingSequence = false;
                enableInput();
                return;
            }

            flashButton(sequence[index]);
            index++;
        }, 1000);
    };

    const flashButton = (color) => {
        const button = document.querySelector(`.${color}`);
        if (button) {
            button.classList.add('active');
            playSound(color); // Play sound when button flashes
            setTimeout(() => {
                button.classList.remove('active');
            }, 500);
        } else {
            console.error(`Button for color "${color}" not found.`);
        }
    };

    const updateScore = () => {
        const scoreDisplay = document.getElementById('score-value');
        if (scoreDisplay) {
            scoreDisplay.innerText = score;
        } else {
            console.error("Score display element not found.");
        }
    };

    const disableInput = () => {
        const gameBoard = document.getElementById('gameBoard');
        if (gameBoard) {
            gameBoard.removeEventListener('click', handleUserInput);
        } else {
            console.error("Game board element not found.");
        }
    };

    const enableInput = () => {
        const gameBoard = document.getElementById('gameBoard');
        if (gameBoard) {
            gameBoard.addEventListener('click', handleUserInput);
        } else {
            console.error("Game board element not found.");
        }
    };

    const handleUserInput = (event) => {
        if (isDisplayingSequence) return;
    
        const clickedButton = event.target.closest('.colorButton');
        if (!clickedButton) {
            console.error("Clicked element is not a valid color button.");
            return;
        }
    
        const clickedColor = clickedButton.getAttribute('data-color');
        userSequence.push(clickedColor);
    
        flashButton(clickedColor); // Flash the button
        playSound(clickedColor); // Play sound when user clicks
    
        const currentStep = userSequence.length - 1;
        if (userSequence[currentStep] !== sequence[currentStep]) {
            alert('Incorrect! Game over.');
            resetGame();
            return;
        }
    
        if (userSequence.length === sequence.length) {
            score++;
            updateScore();
            setTimeout(nextSequence, 1000);
        }
    };
    
    const startGame = () => {
        console.log("Game started");
        resetGame();
        nextSequence();
    };

    // Attach event listeners
    const startButton = document.getElementById('startGame');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    } else {
        console.error("Start Game button not found in the DOM.");
    }

    document.getElementById('prevPage')?.addEventListener('click', () => {
        currentPage--;
        renderTable();
    });

    document.getElementById('nextPage')?.addEventListener('click', () => {
        currentPage++;
        renderTable();
    });

    document.getElementById('filterApply')?.addEventListener('click', applyFiltersAndSort);

    // Fetch players initially
    fetchPlayers();
});