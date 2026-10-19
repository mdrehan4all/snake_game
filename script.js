const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const restartBtn = document.getElementById("restartBtn");
const gameOverOverlay = document.getElementById("gameOverOverlay");

const GRID = 20;
const COLS = canvas.width / GRID;
const ROWS = canvas.height / GRID;

let snake, direction, nextDirection, food, score, highScore, gameLoop, speed, isGameOver;

// Fix: properly initialize highScore on load
highScore = parseInt(localStorage.getItem("snakeHigh")) || 0;
highScoreEl.textContent = highScore;

function init() {
    snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
    direction = {x: 1, y: 0};
    nextDirection = {x: 1, y: 0};
    score = 0;
    speed = 120;
    isGameOver = false;
    scoreEl.textContent = "0";
    if (gameOverOverlay) {
        gameOverOverlay.className = "";
        gameOverOverlay.style.display = "none";
    }
    spawnFood();
}

function spawnFood() {
    let pos;
    do {
        pos = {x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS)};
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    food = pos;
}

document.addEventListener("keydown", e => {
    if (isGameOver) {
        // Allow Enter or Space to restart on game over
        if (e.key === "Enter" || e.key === " ") {
            restartGame();
        }
        return;
    }

    switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
            if (direction.y !== 1) {
                nextDirection = {x: 0, y: -1};
                e.preventDefault();
            }
            break;
        case "ArrowDown":
        case "s":
        case "S":
            if (direction.y !== -1) {
                nextDirection = {x: 0, y: 1};
                e.preventDefault();
            }
            break;
        case "ArrowLeft":
        case "a":
        case "A":
            if (direction.x !== 1) {
                nextDirection = {x: -1, y: 0};
                e.preventDefault();
            }
            break;
        case "ArrowRight":
        case "d":
        case "D":
            if (direction.x !== -1) {
                nextDirection = {x: 1, y: 0};
                e.preventDefault();
            }
            break;
    }
});

function restartGame() {
    clearInterval(gameLoop);
    init();
    gameLoop = setInterval(update, speed);
}

restartBtn.addEventListener("click", () => {
    restartGame();
});

function update() {
    if (isGameOver) return;
    
    direction = {...nextDirection};
    let head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

    // Wrap around walls (Pac-Man style)
    if (head.x < 0) head.x = COLS - 1;
    else if (head.x >= COLS) head.x = 0;
    if (head.y < 0) head.y = ROWS - 1;
    else if (head.y >= ROWS) head.y = 0;

    // Self collision - don't check the tail since it will be removed
    const bodyWithoutTail = snake.slice(1); // Skip last segment (tail)
    if (bodyWithoutTail.some(s => s.x === head.x && s.y === head.y)) {
        endGame();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreEl.textContent = score;
        spawnFood();
        // Fix: increase speed every 5 points, but cap at 60ms
        if (score % 5 === 0 && speed > 60) {
            speed -= 2;
            clearInterval(gameLoop);
            gameLoop = setInterval(update, speed);
        }
    } else {
        snake.pop();
    }
    
    draw();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((s, i) => {
        const r = i === 0 ? "#00ff88" : i === 1 ? "#33ffaa" : "#00cc6a";
        ctx.fillStyle = r;
        ctx.fillRect(s.x * GRID + 1, s.y * GRID + 1, GRID - 2, GRID - 2);
    });

    // Draw food
    ctx.fillStyle = "#ff4d6a";
    ctx.beginPath();
    ctx.arc(food.x * GRID + GRID / 2, food.y * GRID + GRID / 2, GRID / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
}

function endGame() {
    isGameOver = true;
    clearInterval(gameLoop);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("snakeHigh", String(highScore));
        highScoreEl.textContent = highScore;
    }

    if (gameOverOverlay) {
        gameOverOverlay.textContent = score + " — Game Over!";
        gameOverOverlay.classList.add("show");
    }
}

init();
gameLoop = setInterval(update, speed);