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
        ctx.fillStyle = "white";
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

const ship = new Ship(450, 720);

const bg = new Image();
const ship_img = new Image();
const alienImg = new Image();
let gameOver = false;
let returnToMenuScheduled = false;

let assetsLoaded = 0;
const totalAssets = 3;

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

bg.src = "starfield.png";
ship_img.src = "ship.png";
alienImg.src = "alien.png";

const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

document.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
        keys[e.code] = true;
    }

    if (e.code === "Space" && !keys.Space && !gameOver) {
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

const shipSpeed = 4;

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
let alienY = tilesize;
let alienRows = 5;
let alienColumns = 8;
let alienCount = 0;
let alienVelocityX = 1;
const alienProjectiles = [];
const shipProjectiles = [];

let levelCount = 1;
let waveCount = 1;

function creaAlieni() {
    Arrayalieni = [];

    for (let i = 0; i < alienColumns; i++) {
        for (let j = 0; j < alienRows; j++) {
            let alieno = {
                img: alienImg,
                x: alienX + i * alienWidth,
                y: alienY + j * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true,
                shoot: function () {
                    alienProjectiles.push(
                        new AlienProjectile({
                            position: {
                                x: this.x + this.width / 2,
                                y: this.y + this.height
                            },
                            velocity: {
                                x: 0,
                                y: 5
                            }
                        })
                    );
                }
            };

            Arrayalieni.push(alieno);
        }
    }

    alienCount = Arrayalieni.length;
    aggiornaHUD();
}

function aggiornaHUD() {
    const h2 = document.getElementById("h2");
    if (h2) {
        h2.innerText = "Livello: " + levelCount + " Ondata: " + waveCount;
    }
}

function updateAliens() {
    let leftMost = Infinity;
    let rightMost = -Infinity;

    for (let i = 0; i < Arrayalieni.length; i++) {
        let alieno = Arrayalieni[i];
        if (!alieno.alive) continue;

        if (alieno.x < leftMost) leftMost = alieno.x;
        if (alieno.x + alieno.width > rightMost) {
            rightMost = alieno.x + alieno.width;
        }
    }

    if (leftMost === Infinity) return;

    if (rightMost + alienVelocityX >= canvas.width || leftMost + alienVelocityX <= 0) {
        alienVelocityX *= -1;

        for (let i = 0; i < Arrayalieni.length; i++) {
            if (Arrayalieni[i].alive) {
                Arrayalieni[i].y += alienHeight;
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
            ctx.drawImage(alienImg, alieno.x, alieno.y, alieno.width, alieno.height);
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
            gameOver = true;
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
    shipProjectiles.push(
        new ShipProjectile(
            ship.x + ship.width / 2 - 2,
            ship.y
        )
    );
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

            if (
                alieno.alive &&
                p.x < alieno.x + alieno.width &&
                p.x + p.width > alieno.x &&
                p.y < alieno.y + alieno.height &&
                p.y + p.height > alieno.y
            ) {
                alieno.alive = false;
                shipProjectiles.splice(i, 1);
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
    let vivi = 0;

    for (let i = 0; i < Arrayalieni.length; i++) {
        if (Arrayalieni[i].alive) vivi++;
    }

    alienCount = vivi;

    if (alienCount === 0) {
        waveCount++;

        if (waveCount === 3) {
            waveCount = 1;
            levelCount++;
            alienColumns = Math.min(alienColumns + 1, 15);
            alienRows = Math.min(alienRows + 1, 10);
            alienVelocityX = alienVelocityX > 0 ? alienVelocityX + 0.5 : alienVelocityX - 0.5;
        }

        creaAlieni();
    }
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        updateShip();
        updateAliens();
        updateProjectiles();
        updateShipProjectiles();

        for (let i = 0; i < Arrayalieni.length; i++) {
            let alieno = Arrayalieni[i];

            if (alieno.alive && alieno.y + alieno.height >= ship.y) {
                gameOver = true;
                break;
            }
        }

        controllaNuovaOndata();
    }

    drawAliens();
    ctx.drawImage(ship_img, ship.x, ship.y, ship.width, ship.height);
    drawShipProjectiles();
    drawProjectiles();

    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.82)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = "center";

        ctx.fillStyle = "#ff2d55";
        ctx.font = "48px 'Press Start 2P'";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 60);

        ctx.fillStyle = "#ffffff";
        ctx.font = "16px 'Press Start 2P'";
        ctx.fillText("GLI ALIENI HANNO RAGGIUNTO LA TERRA", canvas.width / 2, canvas.height / 2);

        ctx.fillStyle = "#00ffcc";
        ctx.font = "12px 'Press Start 2P'";
        ctx.fillText("RIAVVIO TRA 5 SECONDI", canvas.width / 2, canvas.height / 2 + 40);

        if (!returnToMenuScheduled) {
            returnToMenuScheduled = true;
            setTimeout(() => {
                location.reload();
            }, 5000);
        }

        return;
    }

    requestAnimationFrame(loop);
}




function avviaSparoAlieni() {
    setInterval(() => {
        const alieniVivi = Arrayalieni.filter(a => a.alive);

        if (alieniVivi.length > 0) {
            const randomAlien = alieniVivi[Math.floor(Math.random() * alieniVivi.length)];
            randomAlien.shoot();
        }
    }, 750);
}

avviaSparoAlieni();



function checkGameOverByAliens() {
    for (let i = 0; i < Arrayalieni.length; i++) {
        let alieno = Arrayalieni[i];

        if (alieno.alive && alieno.y + alieno.height >= ship.y) {
            gameOver = true;
            return;
        }
    }
}
