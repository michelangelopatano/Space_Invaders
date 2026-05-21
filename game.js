class Ship {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
    }
}

class AlienProjectile {
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 4;
    }

    update() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#ff00ff"; // Proiettili alieni fucsia neon
        ctx.fill();
        ctx.closePath();
    }
}

class ShipProjectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 18;
        this.speed = 7;
    }

    update() {
        this.y -= this.speed;
    }

    draw() {
        ctx.fillStyle = "#00ffcc";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const retroFont = "'Silkscreen', 'Courier New', monospace";

// Recupero dati giocatore dal Menu
const playerName = sessionStorage.getItem('currentPlayer') || "Player 1";

const ship = new Ship(450, 720);

const bg = new Image();
const ship_img = new Image();
const alienImg = new Image();
const alienImg2 = new Image();
let gameOver = false;
let returnToMenuScheduled = false;
let levelTransition = false;
let transitionMessage = "";

let assetsLoaded = 0;
const totalAssets = 4;

// Nuove variabili di stato per il giocatore
let score = 0;
let lives = 3;

function startIfReady() {
    assetsLoaded++;
    if (assetsLoaded === totalAssets) {
        creaAlieni();
        requestAnimationFrame(loop);
    }
}

bg.onload = startIfReady;
ship_img.onload = startIfReady;
alienImg.onload = startIfReady;
alienImg2.onload = startIfReady;

bg.src = "img/starfield.png";
ship_img.src = "img/ship.png";
alienImg.src = "img/alien.png";
alienImg2.src = "img/pngwing.com.png";

const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
        keys[e.code] = true;
    }

    if (e.code === "Space" && !keys.Space && !gameOver && !levelTransition) {
        keys.Space = true;
        sparaShip();
    }
});

document.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
        keys[e.code] = false;
    }

    if (e.code === "Space") {
        keys.Space = false;
    }
});

window.addEventListener("blur", () => {
    keys.ArrowLeft = false;
    keys.ArrowRight = false;
    keys.Space = false;
});

const shipSpeed = 6;

function updateShip() {
    if (keys.ArrowLeft && ship.x > 0) {
        ship.x -= shipSpeed;
    }
    if (keys.ArrowRight && ship.x < canvas.width - ship.width) {
        ship.x += shipSpeed;
    }
}

let tilesize = 32;
let Arrayalieni = [];
let alienWidth = tilesize * 2;
let alienHeight = tilesize;
let alienX = tilesize;
let alienY = 90; // Abbassato per fare spazio all'HUD grafico
let alienRows = 5;
let alienColumns = 8;
let alienCount = 0;
let alienVelocityX = 1;
const alienProjectiles = [];
const shipProjectiles = [];

let levelCount = 1;
let waveCount = 1;

function getAlienSize(img) {
    if (img === alienImg) {
        return { width: alienWidth, height: alienHeight };
    }
    const ratio = img.naturalWidth / img.naturalHeight;
    const maxWidth = alienWidth * 1.2;
    const maxHeight = alienHeight * 1.7;
    let width = maxWidth;
    let height = width / ratio;

    if (height > maxHeight) {
        height = maxHeight;
        width = height * ratio;
    }
    return { width: width, height: height };
}

function getAlienHitboxRect(alieno) {
    return {
        x: alieno.x + alieno.hitbox.offsetX,
        y: alieno.y + alieno.hitbox.offsetY,
        width: alieno.hitbox.width,
        height: alieno.hitbox.height
    };
}

function creaAlieni() {
    Arrayalieni = [];

    for (let i = 0; i < alienColumns; i++) {
        for (let j = 0; j < alienRows; j++) {
            let img = j % 2 === 0 ? alienImg : alienImg2;
            let size = getAlienSize(img);
            
            let alieno = {
                img: img,
                x: alienX + i * alienWidth + (alienWidth - size.width) / 2,
                y: alienY + j * alienHeight + (alienHeight - size.height) / 2,
                width: size.width,
                height: size.height,
                hitbox: { offsetX: 0, offsetY: 0, width: size.width, height: size.height },
                alive: true,
                shoot: function () {
                    const rect = getAlienHitboxRect(this);
                    alienProjectiles.push(
                        new AlienProjectile({
                            position: { x: rect.x + rect.width / 2, y: rect.y + rect.height },
                            velocity: { x: 0, y: 4 + levelCount * 0.5 } // I proiettili accelerano con i livelli
                        })
                    );
                }
            };
            Arrayalieni.push(alieno);
        }
    }
    alienCount = Arrayalieni.length;
}

// Disegna l'HUD in-game sul canvas
function drawHUD() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, canvas.width, 60);
    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 60);
    ctx.lineTo(canvas.width, 60);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "16px " + retroFont;
    ctx.textAlign = "left";
    ctx.fillText(`PILOTA: ${playerName.toUpperCase()}`, 20, 38);

    ctx.textAlign = "center";
    ctx.fillText(`LIVELLO: ${levelCount} - ONDATA: ${waveCount}`, canvas.width / 2, 38);

    ctx.textAlign = "right";
    ctx.fillStyle = "#ffff00";
    ctx.fillText(`SCORE: ${score}`, canvas.width - 200, 38);

    // Cuori per le vite residune
    ctx.fillStyle = "#ff2d55";
    ctx.fillText(`VITE: ${"♥ ".repeat(lives)}`, canvas.width - 20, 38);
}

function updateAliens() {
    let leftMost = Infinity;
    let rightMost = -Infinity;

    for (let i = 0; i < Arrayalieni.length; i++) {
        let alieno = Arrayalieni[i];
        if (!alieno.alive) continue;

        if (alieno.x < leftMost) leftMost = alieno.x;
        if (alieno.x + alieno.width > rightMost) rightMost = alieno.x + alieno.width;
    }

    if (leftMost === Infinity) return;

    if (rightMost + alienVelocityX >= canvas.width || leftMost + alienVelocityX <= 0) {
        alienVelocityX *= -1;
        for (let i = 0; i < Arrayalieni.length; i++) {
            if (Arrayalieni[i].alive) {
                Arrayalieni[i].y += 20; // Velocità di discesa costante controllata
            }
        }
    } else {
        for (let i = 0; i < Arrayalieni.length; i++) {
            if (Arrayalieni[i].alive) {
                Arrayalieni[i].x += alienVelocityX;
            }
        }
    }
}

function drawAliens() {
    for (let i = 0; i < Arrayalieni.length; i++) {
        let alieno = Arrayalieni[i];
        if (alieno.alive) {
            ctx.drawImage(alieno.img, alieno.x, alieno.y, alieno.width, alieno.height);
        }
    }
}

function updateProjectiles() {
    for (let i = alienProjectiles.length - 1; i >= 0; i--) {
        let p = alienProjectiles[i];
        p.update();

        if (
            p.position.x + p.radius >= ship.x &&
            p.position.x - p.radius <= ship.x + ship.width &&
            p.position.y + p.radius >= ship.y &&
            p.position.y - p.radius <= ship.y + ship.height
        ) {
            alienProjectiles.splice(i, 1);
            lives--; // Perdi una vita
            if (lives <= 0) {
                gameOver = true;
                salvaInClassifica();
            }
            continue;
        }

        if (p.position.y - p.radius > canvas.height) {
            alienProjectiles.splice(i, 1);
        }
    }
}

function drawProjectiles() {
    for (let i = 0; i < alienProjectiles.length; i++) {
        alienProjectiles[i].draw();
    }
}

function sparaShip() {
    shipProjectiles.push(new ShipProjectile(ship.x + ship.width / 2 - 2, ship.y));
}

function updateShipProjectiles() {
    for (let i = shipProjectiles.length - 1; i >= 0; i--) {
        let p = shipProjectiles[i];
        p.update();

        if (p.y + p.height < 0) {
            shipProjectiles.splice(i, 1);
            continue;
        }

        for (let j = 0; j < Arrayalieni.length; j++) {
            let alieno = Arrayalieni[j];
            let rect = getAlienHitboxRect(alieno);

            if (
                alieno.alive &&
                p.x < rect.x + rect.width &&
                p.x + p.width > rect.x &&
                p.y < rect.y + rect.height &&
                p.y + p.height > rect.y
            ) {
                alieno.alive = false;
                shipProjectiles.splice(i, 1);
                score += 100 * levelCount; // Il punteggio scala col livello
                break;
            }
        }
    }
}

function drawShipProjectiles() {
    for (let i = 0; i < shipProjectiles.length; i++) {
        shipProjectiles[i].draw();
    }
}

function controllaNuovaOndata() {
    if (levelTransition) return;

    let vivi = 0;
    for (let i = 0; i < Arrayalieni.length; i++) {
        if (Arrayalieni[i].alive) vivi++;
    }

    alienCount = vivi;

    if (alienCount === 0) {
        levelTransition = true;
        waveCount++;

        if (waveCount === 3) {
            waveCount = 1;
            levelCount++;
            alienColumns = Math.min(alienColumns + 1, 12);
            alienRows = Math.min(alienRows + 1, 7);
            alienVelocityX = alienVelocityX > 0 ? alienVelocityX + 0.3 : alienVelocityX - 0.3;
        }

        transitionMessage = "LIVELLO " + levelCount + " - ONDATA " + waveCount;
        alienProjectiles.length = 0;
        shipProjectiles.length = 0;

        setTimeout(() => {
            creaAlieni();
            levelTransition = false;
            transitionMessage = "";
        }, 2000);
    }
}

function drawLevelTransition() {
    if (!levelTransition) return;

    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";
    ctx.fillStyle = "#00ffcc";
    ctx.font = "700 42px " + retroFont;
    ctx.fillText(transitionMessage, canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = "#ffffff";
    ctx.font = "400 24px " + retroFont;
    ctx.fillText("PREPARATI ALL'INGAGGIO", canvas.width / 2, canvas.height / 2 + 35);
}

// Salva i dati localmente per la classifica
function salvaInClassifica() {
    let leaderboard = JSON.parse(localStorage.getItem('space_invaders_leaderboard')) || [];
    leaderboard.push({ name: playerName, score: score });
    localStorage.setItem('space_invaders_leaderboard', JSON.stringify(leaderboard));
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    if (!gameOver && !levelTransition) {
        updateShip();
        updateAliens();
        updateProjectiles();
        updateShipProjectiles();

        for (let i = 0; i < Arrayalieni.length; i++) {
            let alieno = Arrayalieni[i];
            let rect = getAlienHitboxRect(alieno);

            if (alieno.alive && rect.y + rect.height >= ship.y) {
                gameOver = true;
                salvaInClassifica();
                break;
            }
        }
        controllaNuovaOndata();
    }

    drawAliens();
    ctx.drawImage(ship_img, ship.x, ship.y, ship.width, ship.height);
    drawShipProjectiles();
    drawProjectiles();
    drawHUD();
    drawLevelTransition();

    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = "center";
        ctx.fillStyle = "#ff2d55";
        ctx.font = "700 64px " + retroFont;
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 60);

        ctx.fillStyle = "#ffffff";
        ctx.font = "400 24px " + retroFont;
        ctx.fillText(`PUNTEGGIO FINALE: ${score}`, canvas.width / 2, canvas.height / 2 + 10);

        ctx.fillStyle = "#00ffcc";
        ctx.font = "400 20px " + retroFont;
        ctx.fillText("RITORNO AL MENU TRA 5 SECONDI", canvas.width / 2, canvas.height / 2 + 70);

        if (!returnToMenuScheduled) {
            returnToMenuScheduled = true;
            setTimeout(() => {
                window.location.href = './index.html';
            }, 5000);
        }
        return;
    }

    requestAnimationFrame(loop);
}

function avviaSparoAlieni() {
    setInterval(() => {
        if (gameOver || levelTransition) return;

        const alieniVivi = Arrayalieni.filter(a => a.alive);
        if (alieniVivi.length > 0) {
            const randomAlien = alieniVivi[Math.floor(Math.random() * alieniVivi.length)];
            randomAlien.shoot();
        }
    }, 800 - (levelCount * 50)); // Gli alieni sparano più velocemente salendo di livello
}

avviaSparoAlieni();