class Ship {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const ship = new Ship(375, 500);

const bg = new Image();
const ship_img = new Image();

bg.src = "starfield.png";
ship_img.src = "ship.png";

let assetsLoaded = 0;

function startIfReady() {
    assetsLoaded++;
    if (assetsLoaded === 2) {
        requestAnimationFrame(loop);
    }
}

bg.onload = startIfReady;
ship_img.onload = startIfReady;

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // sfondo
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // nave
    ctx.drawImage(ship_img, ship.x, ship.y, 50, 50);

    requestAnimationFrame(loop);
}

function right(){
    if(ship.x<750){
        ship.x++
    }
}