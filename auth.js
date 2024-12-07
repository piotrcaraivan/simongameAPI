document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = "https://d5dsv84kj5buag61adme.apigw.yandexcloud.net";

    const hashPassword = async (password) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    };

    // Регистрация пользователя
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

    // Вход пользователя
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
                window.location.href = "index.html"; // Перенаправление после входа
            } catch (error) {
                alert("Ошибка: " + error.message);
            }
        });
    }
});
