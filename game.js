document.addEventListener('DOMContentLoaded', () => {
    const colors = ['red', 'green', 'blue', 'yellow'];
    let sequence = [];
    let userSequence = [];
    let score = 0;
    let isDisplayingSequence = false;


    const playSound = (color) => {
        const audio = new Audio(`sounds/${color}.wav`);
        audio.play();
    };
   
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) { // Если прокрутили больше 200px
            scrollToTopButton.style.display = 'block';
        } else {
            scrollToTopButton.style.display = 'none';
        }
    });

    // Плавная прокрутка наверх
    const scrollToTopButton = document.getElementById('scrollToTop');
    if (scrollToTopButton) {
        scrollToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    } else {
        console.error('Кнопка "Наверх" не найдена в DOM.');
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
            playSound(color);
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
    const submitScore = async (score) => {
        const user = localStorage.getItem('currentUser') || 'Anonymous';
    
        try {
            const response = await fetch('https://d5dsv84kj5buag61adme.apigw.yandexcloud.net', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user, score }),
            });
    
            if (!response.ok) {
                throw new Error('Ошибка при отправке результата');
            }
    
            const result = await response.json();
            console.log('Результат успешно отправлен:', result);
            alert('Ваш результат сохранён!');
        } catch (error) {
            console.error('Ошибка отправки:', error);
            alert('Не удалось сохранить результат. Попробуйте позже.');
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
    
        flashButton(clickedColor);
        playSound(clickedColor);
    
        const currentStep = userSequence.length - 1;
        if (userSequence[currentStep] !== sequence[currentStep]) {
            alert('Incorrect! Game over.');
            submitScore(score); // Отправляем результат
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

    const startButton = document.getElementById('startGame');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    } else {
        console.error("Start Game button not found in the DOM.");
    }
});
