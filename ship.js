class Ship {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const ship = new Ship(450, 700);

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

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    ctx.drawImage(ship_img, ship.x, ship.y, 50, 50);
    for(let i=0; i<Arrayalieni.length; i++){
        let alieno=Arrayalieni[i]
        if(alieno.alive){
            alieno.x=alieno.x+alienVelocityX;
            if(alieno.x + alieno.width >=920 || alieno.x <=0){
                alienVelocityX=alienVelocityX*-1;
                alieno.x=alieno.x+alienVelocityX*2;
                for(let j=0; j<Arrayalieni.length; j++){
                    Arrayalieni[j].y=Arrayalieni[j].y+alienHeight
                }
            }
            ctx.drawImage(alienImg, alieno.x, alieno.y, alieno.width, alieno.height)
        }
    }
    requestAnimationFrame(loop);
}

function right(){
    if(ship.x<950){
        ship.x++
        ship.x++
        ship.x++
        ship.x++
    }
}

function left(){
    if(ship.x>0){
        ship.x--
        ship.x--
        ship.x--
        ship.x--
    }
}

document.addEventListener("keydown", function (e) {
    if (e.code === "ArrowLeft") left();
    if (e.code === "ArrowRight") right();
});
let tilesize=32;
let Arrayalieni = []
let alienWidth= tilesize*2
let alienHeight= tilesize;
let alienX= tilesize;
let alienY= tilesize;
let alienImg;
let alienRows=5;
let alienColumns=9;
let alienCount=0;
let alienVelocityX=1;
alienImg = new Image();
alienImg.src="./alien.png";
creaAlieni()
function creaAlieni(){
    for(let i=0; i<alienColumns; i++){
        for(let j=0; j<alienRows; j++){
            let alieno = {
                img: alienImg,
                x: alienX + i*alienWidth,
                y: alienY + j*alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true
            }
            Arrayalieni.push(alieno)
        }
    }
    alienCount=Arrayalieni.length
}
