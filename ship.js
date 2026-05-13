class Ship {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class AlienProjectile {
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 4;
    }
    draw() {
        this.position.y=this.position.y+this.velocity.y;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.closePath();
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
    alienProjectiles.forEach(p => {
        p.draw();
    })
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
let alienColumns=8;
let alienCount=0;
let alienVelocityX=1;
const alienProjectiles = [];
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
                alive: true,
                shoot: function(alienProjectiles){
                    alienProjectiles.push(new AlienProjectile({
                        position: {
                            x:this.x+this.width/2,
                            y:this.y+this.height
                        },
                        velocity: {
                            x:0,
                            y:5
                        }
                    }))
                }
            }
            Arrayalieni.push(alieno)
        }
    }
    alienCount=Arrayalieni.length
}
let levelCount=1;
let waveCount=1;
if(levelCount==1){
    setInterval(() => { 
        if(Arrayalieni.length>0){
            Arrayalieni[Math.floor(Math.random() * Arrayalieni.length)].shoot(alienProjectiles);
        }
    }, 750);
}
if(levelCount==2){
    setInterval(() => { 
        if(Arrayalieni.length>0){
            Arrayalieni[Math.floor(Math.random() * Arrayalieni.length)].shoot(alienProjectiles);
        }
    }, 500);
}
if(levelCount==3){
    setInterval(() => { 
        if(Arrayalieni.length>0){
            Arrayalieni[Math.floor(Math.random() * Arrayalieni.length)].shoot(alienProjectiles);
        }
    }, 400);
}
if(alienCount===0){
    waveCount++
    document.getElementById("h2").innerText="Livello: "+levelCount+" Ondata: "+waveCount;
    if(waveCount==3){
        waveCount=1;
        levelCount++;
        document.getElementById("h2").innerText="Livello: "+levelCount+" Ondata: "+waveCount;
        alienColumns=Math.min(alienColumns+1, 15);
        alienRows=Math.min(alienRows+1, 10);
        alienVelocityX=alienVelocityX+0.5;
    }
    creaAlieni()
}
