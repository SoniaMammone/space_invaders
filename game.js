//MATRICE
let tileSize = 32;
let rows = 16;
let columns = 16;
let board;
let boardWidth = tileSize * columns; 
let boardHeight = tileSize * rows;
//DEFINISCE IL CODICE 2D 
let context;
//DEFINISCE LE SHIP
let shipWidth = tileSize*2;
let shipHeight = tileSize;
let shipX = tileSize * columns/2 - tileSize;
let shipY = tileSize * rows - tileSize*2;
let ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight
}

let shipImg;
let shipVelocityX = tileSize;
//ALIENS
let alienArray = [];
let alienWidth = tileSize*2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;
let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; 
let alienVelocityX = 1; 
//this.alienVelocity = 1; sta puntanto all'oggetto globale window
//PLAYER
let bulletArray = [];
let bulletVelocityY = -10; 
let score = 0;
let gameOver = false;
//il costruttore va scritto con la maiuscola
// function Alien(alienWidth, alienHeight, alienX, alienY, alienImg, alienRows, alienColumns, alienVelocityX, alive){
//     this.alienWidth = alienWidth;
//     this.alienHeight = alienHeight;
//     this.alienX = alienX;
//     this.alienY = alienY;
//     this.alienImg = alienImg;
//     this.alienRows = alienRows;
//     this.alienColumns = alienColumns;
//     this.alienVelocityX = alienVelocityX;
//     this.alive = alive;
//     this.die = function(){
//         console.log("Boom");
//         this.alive = false;
//     }
// }
//quando invoco un costruttore 1) viene creato un nuovo object vuoto 2) il puntatore this viene fatto puntare a 
//questo oggetto vuoto appena creato 3) viene eseguito il codice del costruttore vongono create le variabile e
//inizializzate con i parametri passati nel costruttore 4) ritorna l'indirizzo dell'oggetto che ha creato
// let al = new Alien(tileSize*2, tileSize);
// al.die();
// let alWrong = Alien(tileSize*2, tileSize);

window.onload = function(){
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    shipImg = new Image();
    shipImg.src = "./ship.png";
    shipImg.onload = function(){
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    alienImg = new Image();
    alienImg.src = "./alien.png";
    createAliens();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);

}

function update() {
    requestAnimationFrame(update);
//TODO: implementare gameOver
    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        //da chiedere a Gian per l'alive perchè non è definita
        if (alien.alive) {
            alien.x += alienVelocityX;

            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX*2;

                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= ship.y) {
                gameOver = true;
            }
        }
    }

    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle="white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
            }
        }
    }
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); 
    }

    if (alienCount == 0) {
        score += alienColumns * alienRows * 100;
        alienColumns = Math.min(alienColumns + 1, columns/2 -2);
        alienRows = Math.min(alienRows + 1, rows-4);
        if (alienVelocityX > 0) {
            alienVelocityX += 0.2; 
        }
        else {
            alienVelocityX -= 0.2; 
        }
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    context.fillStyle="white"; //colore del testo
    context.font="16px courier";
    context.fillText(score, 5, 20);
}
//TODO: fai si che se la ship arrivi al limite x = 0 || board.width 
//invece che non muoversi più si ritrova al fine opposto
function moveShip(e) {
    if (gameOver) {
        return;
    }
    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        //se ci spostiamo a sinistra e abbiamo ancora spazio a sinistra
        //allora ci sposteremo a sinistra
        //ship.x è il bordo della nave
        ship.x -= shipVelocityX; 
    }
    else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX; 
    }
}

function createAliens(){

    for(let i = 0; i < alienColumns; i++){
        for(let j = 0; j < alienRows; j++){
            let alien = {
                alienWidth : tileSize*2,
                alienHeight : tileSize,
                alienX : tileSize,
                alienY : tileSize,
                alienImg,
                alienRows : 2,
                alienColumns : 3, 
                alienVelocityX : 1,
                alive : true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}
//TODO: scrivere funzione in cui in HARD si hanno meno bullet e 
//e quando finiscono bisogna fare un reload e aspettare qualche secondo
function shoot(e) {
    if (gameOver) {
        return;
    }
    if (e.code == "Space") {
        let bullet = {
            x : ship.x + shipWidth*15/32,
            y : ship.y, //esce fuori dal bordo della nave
            width : tileSize/8,
            height : tileSize/2,
            used : false
        }
        bulletArray.push(bullet);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   
           a.x + a.width > b.x &&   
           a.y < b.y + b.height &&  
           a.y + a.height > b.y;    
}

switch(difficulty){
    case 'easy':
        alienColumns = 3;
        alienRows = 2;
        alienVelocityX = 1;
        break;
    case 'medium':
        alienColumns = 4;
        alienRows = 3;
        alienVelocityX = 1.5;
    case 'hard':
        alienColumns = 7;
        alienRows = 6;
        alienVelocityX = 20;
    default:
        alienColumns = 3;
        alienRows = 2;
        alienVelocityX = 1;  
}


