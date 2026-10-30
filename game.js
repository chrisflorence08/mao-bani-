const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const startButton = document.getElementById("start");
const menu = document.getElementById("menu");
const winScreen = document.getElementById("win");
const loseScreen = document.getElementById("lose");

const scoreText = document.getElementById("score");
const lifeText = document.getElementById("life");

let playing = false;
let isPaused = false;
let score = 0;
let lives = 3;
let shake = 0;
let difficulty = 1;
let gameTime = 0;
let currentLevel = 1;
let frame = 0;
let levelFrames = 0;
let levelEnding = false;
let levelComplete = false;
let coinsCollected = 0;
let finished = false;
let animationId = null;
let lastRockTime = 0;
let lastCoinTime = 0;

const levelDuration = 600;
const gravity = 0.8;
const floor = 380;

let keys = {};
let obstacles = [];
let rocks = [];
let coins = [];

// PLAYER SPRITES

const playerImages = [];

for (let i = 1; i <= 8; i++) {
    const img = new Image();
    img.src = `images/player/brown_side_${i}.png`;
    playerImages.push(img);
}

// PLAYER

const player = {
    x: 200,
    y: floor,
    width: 70,
    height: 70,
    speed: 6,
    velocityY: 0,
    jumping: false,
    crouching: false
};

// ENEMY

const enemy = {
    x: -150,
    y: floor,
    width: 70,
    height: 70,
    speed: 1
};

// CAVE

const cave = {
    x: canvas.width + 250,
    y: 280,
    width: 200,
    height: 170
};

const companions = {
    x: 5150,
    y: 370,
    width: 80,
    height: 80
};

const stone = {
    x: 2000,
    y: 300,
    width: 120,
    height: 120
};

// OBSTACLES

const obstacleCatalog = {
    fire: {
        type: "fire",
        x: 900,
        y: 380,
        width: 65,
        height: 60
    },
    tree: {
        type: "tree",
        x: 1100,
        y: 330,
        width: 150,
        height: 80
    }
};

// LEVEL COMPLETE SCREEN

const levelScreen = document.createElement("div");
levelScreen.id = "levelCompleteScreen";

Object.assign(levelScreen.style, {
    display: "none",
    position: "fixed",
    inset: "0",
    background: "rgba(0,0,0,0.88)",
    color: "white",
    zIndex: "9999",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    boxSizing: "border-box"
});

levelScreen.innerHTML = `
    <div style="
        background:#202020;
        border:3px solid #8b0000;
        border-radius:18px;
        padding:30px;
        width:min(450px, 100%);
        box-sizing:border-box;
    ">
        <h1 id="levelMessage" style="color:#ffcf40">
            You Escaped the Grasp of the Devil!
        </h1>

        <h2 id="completedLevel"></h2>
        <p id="finalScore"></p>
        <p id="finalCoins"></p>

        <button id="backMenu"
            style="display:block;width:100%;padding:12px;margin:10px 0;cursor:pointer">
            Back to Main Menu
        </button>

        <button id="nextLevel"
            style="display:block;width:100%;padding:12px;margin:10px 0;background:#4caf50;color:white;cursor:pointer">
            Next Level
        </button>

        <button id="quitGame"
            style="display:block;width:100%;padding:12px;margin:10px 0;background:#8b0000;color:white;cursor:pointer">
            Quit
        </button>
    </div>
`;

document.body.appendChild(levelScreen);

const levelMessage = document.getElementById("levelMessage");
const completedLevelText = document.getElementById("completedLevel");
const finalScoreText = document.getElementById("finalScore");
const finalCoinsText = document.getElementById("finalCoins");
const backMenuButton = document.getElementById("backMenu");
const nextLevelButton = document.getElementById("nextLevel");
const quitGameButton = document.getElementById("quitGame");

// PAUSE MENU
// IMPORTANT: This belongs OUTSIDE setupLevel().

const pauseScreen = document.createElement("div");
pauseScreen.id = "pauseScreen";

Object.assign(pauseScreen.style, {
    display: "none",
    position: "fixed",
    inset: "0",
    background: "rgba(0, 0, 0, 0.85)",
    color: "white",
    zIndex: "10000",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    boxSizing: "border-box"
});

pauseScreen.innerHTML = `
    <div style="
        background: #202020;
        border: 3px solid #8b0000;
        border-radius: 18px;
        padding: 30px;
        width: min(350px, 100%);
        box-sizing: border-box;
    ">
        <h1 style="color: #ffcf40;">PAUSED</h1>
        <p>Take a break, survivor!</p>

        <button id="resumeGame"
            style="width:100%;padding:12px;margin:8px 0;cursor:pointer">
            Resume Game
        </button>

        <button id="restartLevel"
            style="width:100%;padding:12px;margin:8px 0;cursor:pointer">
            Restart Level
        </button>

        <button id="pauseMainMenu"
            style="width:100%;padding:12px;margin:8px 0;background:#8b0000;color:white;cursor:pointer">
            Main Menu
        </button>

        <p style="font-size:13px;color:#ccc;">
            Press ESC to resume
        </p>
    </div>
`;

document.body.appendChild(pauseScreen);

const resumeButton = document.getElementById("resumeGame");
const restartLevelButton = document.getElementById("restartLevel");
const pauseMainMenuButton = document.getElementById("pauseMainMenu");

// SET UP LEVEL

function setupLevel(level) {
    currentLevel = level;

    obstacles = [];
    rocks = [];
    coins = [];

    levelFrames = 0;
    levelEnding = false;
    levelComplete = false;
    finished = false;

    isPaused = false;
    pauseScreen.style.display = "none";
    keys = {};

    player.x = 200;
    player.y = floor;
    player.velocityY = 0;
    player.jumping = false;
    player.crouching = false;

    cave.x = canvas.width + 250;
    companions.x = canvas.width + 500;
    stone.x = canvas.width + 350;

    enemy.width = level === 4 ? 110 : 70;
    enemy.height = level === 4 ? 110 : 70;
    enemy.speed = level === 4 ? 2.0 : 0.8 + level * 0.15;
    enemy.x = canvas.width + 100;
    enemy.y = floor + player.height - enemy.height;

    if (level === 1) {
        obstacles.push({ ...obstacleCatalog.fire });
    } else if (level === 2) {
        obstacles.push({ ...obstacleCatalog.tree });
    } else if (level === 4) {
        obstacles.push({ ...obstacleCatalog.fire });
        obstacles.push({ ...obstacleCatalog.tree });
    }

    lastRockTime = gameTime;
    lastCoinTime = gameTime;

    scoreText.textContent = `Score: ${score}`;
    lifeText.textContent = `❤️ Lives: ${lives}`;

    console.log(`Level ${level} started`);
}

// CONTROLS
// A = Left | D = Right
// W / SPACE = Jump
// Hold S = Crouch
// ESC = Pause / Resume

document.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    if (key === "escape") {
        event.preventDefault();

        if (event.repeat || !playing || levelComplete) {
            return;
        }

        isPaused = !isPaused;
        keys = {};
        player.crouching = false;

        pauseScreen.style.display = isPaused ? "flex" : "none";

        if (isPaused) {
            if (animationId !== null) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        } else {
            gameLoop();
        }

        return;
    }

    if (isPaused || !playing) {
        return;
    }

    if (["w", "a", "s", "d", " "].includes(key)) {
        event.preventDefault();
    }

    keys[key] = true;
});

document.addEventListener("keyup", event => {
    keys[event.key.toLowerCase()] = false;
});

window.addEventListener("blur", () => {
    keys = {};
    player.crouching = false;
});

// UPDATE PLAYER

function updatePlayer() {
    player.crouching = Boolean(keys["s"]) && !player.jumping;

    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;

    if (
        (keys["w"] || keys[" "]) &&
        !player.jumping &&
        !player.crouching
    ) {
        player.velocityY = -15;
        player.jumping = true;
    }

    player.x = Math.max(
        0,
        Math.min(canvas.width - player.width, player.x)
    );

    player.velocityY += gravity;
    player.y += player.velocityY;

    if (player.y >= floor) {
        player.y = floor;
        player.velocityY = 0;
        player.jumping = false;
    }
}

// COLLISION DETECTION

function hit(a, b) {
    const crouching = Boolean(a.crouching);

    const hitboxWidth = a.width - 30;
    const hitboxX = a.x + 15;
    const hitboxHeight = crouching ? 25 : 50;
    const hitboxY = a.y + a.height - hitboxHeight;

    const bx = b.x;
    const by = b.y;
    const bw = b.size !== undefined ? b.size : b.width;
    const bh = b.size !== undefined ? b.size : b.height;

    if (b.type === "tree" && crouching) {
        return (
            hitboxX < bx + bw &&
            hitboxX + hitboxWidth > bx &&
            hitboxY < by + 35 &&
            hitboxY + hitboxHeight > by
        );
    }

    return (
        hitboxX < bx + bw &&
        hitboxX + hitboxWidth > bx &&
        hitboxY < by + bh &&
        hitboxY + hitboxHeight > by
    );
}

// DAMAGE

function damage() {
    if (!playing) return;

    lives--;
    shake = 12;

    lifeText.textContent = `❤️ Lives: ${lives}`;

    if (lives <= 0) {
        lives = 0;
        playing = false;

        lifeText.textContent = "❤️ Lives: 0";
        loseScreen.style.display = "flex";

        if (animationId !== null) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }
}

// UPDATE OBSTACLES

function updateObstacles() {
    for (const obstacle of obstacles) {
        obstacle.x -= 7 * difficulty;

        if (obstacle.x + obstacle.width < 0) {
            obstacle.x = canvas.width + Math.random() * 300 + 150;
            score += 20;
        }

        if (hit(player, obstacle)) {
            damage();

            if (!playing) return;

            obstacle.x = canvas.width + Math.random() * 300 + 150;
        }
    }
}

// ROCKS

function spawnRocks() {
    if (currentLevel < 3 || levelEnding) return;

    if (gameTime - lastRockTime >= 100) {
        lastRockTime = gameTime;

        rocks.push({
            x: Math.random() * (canvas.width - 35),
            y: -40,
            size: 35,
            speed: currentLevel === 4 ? 7 : 5
        });
    }
}

function updateRocks() {
    for (let i = rocks.length - 1; i >= 0; i--) {
        const rock = rocks[i];

        rock.y += rock.speed;

        if (rock.y > canvas.height + 50) {
            rocks.splice(i, 1);
            continue;
        }

        if (hit(player, rock)) {
            rocks.splice(i, 1);
            damage();

            if (!playing) return;
        }
    }
}

// COINS

function updateCoins() {
    if (gameTime - lastCoinTime >= 75) {
        lastCoinTime = gameTime;

        coins.push({
            x: canvas.width + 20,
            y: 250 + Math.random() * 120,
            size: 22
        });
    }

    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];

        coin.x -= 5;

        if (coin.x + coin.size < 0) {
            coins.splice(i, 1);
            continue;
        }

        if (hit(player, coin)) {
            coins.splice(i, 1);
            coinsCollected++;
            score += 10;
        }
    }
}

// ENEMY — CHASES PLAYER IN EVERY LEVEL

function updateEnemy() {
    if (levelEnding) return;

    const targetX = player.x + player.width + 80;
    const targetY = player.y + player.height - enemy.height;

    if (enemy.x > targetX) {
        enemy.x -= enemy.speed;
    } else {
        enemy.x = targetX;
    }

    if (enemy.y < targetY) {
        enemy.y += Math.min(2, targetY - enemy.y);
    } else if (enemy.y > targetY) {
        enemy.y -= Math.min(2, enemy.y - targetY);
    }

    if (hit(player, enemy)) {
        damage();

        if (playing) {
            enemy.x = canvas.width + 100;
        }
    }
}

// CAVE / LEVEL ENDING

function updateEnding() {
    if (!levelEnding) {
        levelFrames++;

        if (levelFrames >= levelDuration) {
            levelEnding = true;
        }
    }

    if (levelEnding) {
        cave.x -= 7;

        if (cave.x <= player.x + player.width + 20) {
            completeLevel();
        }
    }
}

function completeLevel() {
    if (levelComplete) return;

    levelComplete = true;
    finished = true;
    playing = false;
    isPaused = false;

    pauseScreen.style.display = "none";

    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    levelScreen.style.display = "flex";

    levelMessage.textContent = "You Escaped the Grasp of the Devil!";
    completedLevelText.textContent = `Level ${currentLevel} Complete!`;
    finalScoreText.textContent = `Score: ${score}`;
    finalCoinsText.textContent = `Coins Collected: ${coinsCollected}`;

    nextLevelButton.textContent =
        currentLevel === 4 ? "Finish Game" : "Next Level";
}

// DRAW BACKGROUND

function drawBackground() {
    ctx.fillStyle = "#74c365";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < canvas.width; i += 150) {
        ctx.fillStyle = "#145214";
        ctx.fillRect(i, 200, 70, 200);

        ctx.fillStyle = "#754c24";
        ctx.fillRect(i + 30, 300, 15, 100);
    }

    ctx.fillStyle = "#3b7d32";
    ctx.fillRect(0, 450, canvas.width, 50);
}

// DRAW PLAYER

function drawPlayer() {
    const image = playerImages[
        Math.floor(frame / 8) % playerImages.length
    ];

    ctx.save();

    if (player.crouching) {
        ctx.translate(player.x, player.y + 35);
        ctx.scale(1, 0.55);

        if (image.complete && image.naturalWidth > 0) {
            ctx.drawImage(image, 0, 0, 70, 70);
        } else {
            ctx.fillStyle = "#8b4513";
            ctx.fillRect(0, 0, 70, 70);
        }
    } else {
        ctx.translate(player.x + player.width, player.y);
        ctx.scale(-1, 1);

        if (image.complete && image.naturalWidth > 0) {
            ctx.drawImage(image, 0, 0, 70, 70);
        } else {
            ctx.fillStyle = "#8b4513";
            ctx.fillRect(0, 0, 70, 70);
        }
    }

    ctx.restore();
    frame++;
}

// DRAW ENEMY

function drawEnemy() {
    const size = enemy.width;

    ctx.fillStyle = currentLevel === 4 ? "#d9e6ff" : "#8b0000";

    ctx.beginPath();

    ctx.arc(
        enemy.x + size / 2,
        enemy.y + size / 2,
        size / 2,
        Math.PI,
        0
    );

    ctx.lineTo(enemy.x + size, enemy.y + size);

    for (let i = 4; i >= 0; i--) {
        ctx.lineTo(
            enemy.x + i * size / 5,
            enemy.y + size - (i % 2 === 0 ? 0 : 10)
        );
    }

    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = currentLevel === 4 ? "#ff2222" : "yellow";

    ctx.beginPath();

    ctx.arc(
        enemy.x + size * 0.35,
        enemy.y + size * 0.4,
        size * 0.07,
        0,
        Math.PI * 2
    );

    ctx.arc(
        enemy.x + size * 0.65,
        enemy.y + size * 0.4,
        size * 0.07,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "#222";

    ctx.beginPath();

    ctx.ellipse(
        enemy.x + size / 2,
        enemy.y + size * 0.65,
        size * 0.1,
        size * 0.15,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();
}

// DRAW OBSTACLES

function drawObstacles() {
    obstacles.forEach(obstacle => {
        if (obstacle.type === "fire") {
            ctx.fillStyle = "#ff8c00";
            ctx.fillRect(obstacle.x, obstacle.y + 25, 65, 20);

            ctx.fillStyle = "red";

            ctx.beginPath();
            ctx.moveTo(obstacle.x + 10, obstacle.y + 30);
            ctx.lineTo(obstacle.x + 25, obstacle.y);
            ctx.lineTo(obstacle.x + 40, obstacle.y + 30);
            ctx.lineTo(obstacle.x + 55, obstacle.y + 5);
            ctx.lineTo(obstacle.x + 65, obstacle.y + 45);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "yellow";
            ctx.fillRect(obstacle.x + 25, obstacle.y + 20, 15, 25);
        }

        if (obstacle.type === "tree") {
            ctx.save();

            ctx.translate(obstacle.x, obstacle.y);
            ctx.rotate(-0.25);

            ctx.fillStyle = "#5b3214";
            ctx.fillRect(0, 0, 150, 35);

            ctx.fillStyle = "#3b210d";
            ctx.fillRect(30, 5, 8, 25);
            ctx.fillRect(80, 5, 8, 25);

            ctx.fillStyle = "#228B22";

            ctx.beginPath();
            ctx.arc(150, 15, 45, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    });
}

// DRAW ROCKS

function drawRocks() {
    rocks.forEach(rock => {
        ctx.fillStyle = "#444";

        ctx.beginPath();
        ctx.arc(
            rock.x + rock.size / 2,
            rock.y + rock.size / 2,
            rock.size / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = "#888";
        ctx.fillRect(rock.x + 8, rock.y + 8, 15, 10);
    });
}

// DRAW COINS

function drawCoins() {
    coins.forEach(coin => {
        ctx.fillStyle = "#ffd700";

        ctx.beginPath();
        ctx.arc(
            coin.x + coin.size / 2,
            coin.y + coin.size / 2,
            coin.size / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.strokeStyle = "#b8860b";
        ctx.lineWidth = 3;
        ctx.stroke();
    });
}

// DRAW CAVE

function drawCave() {
    ctx.fillStyle = "#555";
    ctx.fillRect(cave.x - 20, cave.y + 80, 40, 80);
    ctx.fillRect(cave.x + 180, cave.y + 80, 40, 80);

    ctx.fillStyle = "#4b3621";
    ctx.fillRect(cave.x, cave.y, cave.width, cave.height);

    ctx.fillStyle = "#050505";

    ctx.beginPath();
    ctx.arc(
        cave.x + cave.width / 2,
        cave.y + 120,
        75,
        Math.PI,
        Math.PI * 2
    );
    ctx.fill();
}

// DRAW ENDING OBJECTS

function drawEnding() {
    if (!finished) return;

    ctx.fillStyle = "yellow";
    ctx.fillRect(
        companions.x,
        companions.y,
        companions.width,
        companions.height
    );

    ctx.fillStyle = "gray";
    ctx.fillRect(
        stone.x,
        stone.y,
        stone.width,
        stone.height
    );
}

// START GAME

startButton.onclick = () => {
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    score = 0;
    lives = 3;
    coinsCollected = 0;
    gameTime = 0;
    difficulty = 1;
    shake = 0;
    keys = {};
    isPaused = false;

    pauseScreen.style.display = "none";
    menu.style.display = "none";
    winScreen.style.display = "none";
    loseScreen.style.display = "none";
    levelScreen.style.display = "none";

    setupLevel(1);

    scoreText.textContent = "Score: 0";
    lifeText.textContent = "❤️ Lives: 3";

    playing = true;
    gameLoop();
};

// RESUME GAME

resumeButton.onclick = () => {
    if (!playing || !isPaused) return;

    isPaused = false;
    pauseScreen.style.display = "none";
    keys = {};

    gameLoop();
};

// RESTART CURRENT LEVEL

restartLevelButton.onclick = () => {
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    isPaused = false;
    pauseScreen.style.display = "none";
    keys = {};

    setupLevel(currentLevel);

    playing = true;
    gameLoop();
};

// PAUSE MENU: MAIN MENU

pauseMainMenuButton.onclick = () => {
    playing = false;
    isPaused = false;
    keys = {};

    pauseScreen.style.display = "none";
    levelScreen.style.display = "none";
    winScreen.style.display = "none";
    loseScreen.style.display = "none";
    menu.style.display = "flex";

    score = 0;
    lives = 3;
    coinsCollected = 0;
    gameTime = 0;
    difficulty = 1;

    scoreText.textContent = "Score: 0";
    lifeText.textContent = "❤️ Lives: 3";

    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
};

// BACK TO MAIN MENU

backMenuButton.onclick = () => {
    playing = false;
    isPaused = false;
    keys = {};

    pauseScreen.style.display = "none";
    levelScreen.style.display = "none";
    winScreen.style.display = "none";
    loseScreen.style.display = "none";
    menu.style.display = "flex";

    score = 0;
    lives = 3;
    coinsCollected = 0;
    gameTime = 0;
    difficulty = 1;

    scoreText.textContent = "Score: 0";
    lifeText.textContent = "❤️ Lives: 3";

    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
};

// NEXT LEVEL / FINISH

nextLevelButton.onclick = () => {
    levelScreen.style.display = "none";
    isPaused = false;
    pauseScreen.style.display = "none";

    if (currentLevel >= 4) {
        playing = false;
        winScreen.style.display = "flex";
        return;
    }

    setupLevel(currentLevel + 1);

    playing = true;
    gameLoop();
};

// QUIT

quitGameButton.onclick = () => {
    playing = false;
    isPaused = false;
    keys = {};

    pauseScreen.style.display = "none";
    levelScreen.style.display = "none";
    winScreen.style.display = "none";
    loseScreen.style.display = "none";
    menu.style.display = "flex";

    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
};

// GAME LOOP

function gameLoop() {
    if (!playing || isPaused) return;

    // Clear the previous animation ID before drawing the next frame.
    animationId = null;

    gameTime++;

    ctx.save();

    if (shake > 0) {
        ctx.translate(
            Math.random() * 10 - 5,
            Math.random() * 10 - 5
        );

        shake--;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    updatePlayer();

    if (!levelEnding) {
        updateEnemy();
        updateObstacles();
        updateRocks();
        spawnRocks();
        updateCoins();
    }

    updateEnding();

    drawCave();
    drawCoins();
    drawPlayer();
    drawEnemy();
    drawObstacles();
    drawRocks();
    drawEnding();

    score++;
    scoreText.textContent = `Score: ${score}`;

    ctx.restore();

    if (playing && !isPaused) {
        animationId = requestAnimationFrame(gameLoop);
    }
}