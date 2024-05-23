let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns;
let boardHeight = tileSize * rows;
let context;

let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = tileSize * columns / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

let ship = {
    x: shipX,
    y: shipY,
    width: shipWidth,
    height: shipHeight
}

let shipImg;
let shipVelocityX = tileSize;

let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0;
let alienVelocityX = 1;

let bulletArray = [];
let bulletVelocityY = -10;

let score = 0;
let gameOver = false;

window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const difficulty = urlParams.get('difficulty') || 'easy';
    // let myVar = s != null && s.toLowerCase();
    // let z = true && false;

    switch (difficulty) {
        case 'easy':
            alienColumns = 6;
            alienRows = 2;
            alienVelocityX = 1;
            break;
        case 'medium':
            alienColumns = 4;
            alienRows = 3;
            alienVelocityX = 1.5;
            break;
        case 'hard':
            alienColumns = 7;
            alienRows = 6;
            alienVelocityX = 3;
            break;
        default:
            alienColumns = 3;
            alienRows = 2;
            alienVelocityX = 1;
    }

    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    shipImg = new Image();
    shipImg.src = "./ship.png";
    shipImg.onload = function () {
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
    if (gameOver) {
        return;
    }
    // for (let i = 0; i < alienArray.length; i++) {
    //     let alien = alienArray[i];
    //     if (alien.alive) {
    //         alien.x += alienVelocityX;

    //         if (alien.x + alien.width >= board.width || alien.x <= 0) {
    //             console.log("alien sfora " + i);
    //             console.log(alienArray[2].x - alienArray[0].x);
    //             console.log(alienArray[11].x - alienArray[9].x);
    //             alienVelocityX *= -1;
    //             //alien.x += alienVelocityX;

    //             for (let j = 0; j < alienArray.length; j++) {
    //                 alienArray[j].y += alienHeight;
    //             }           
    //         }
    //         context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

    //         if (alien.y >= ship.y) {
    //             gameOver = true;
    //         }
    //     }
    // }
    // move all aliens and check for collision with walls
    let hit = false;
    for (const alien of alienArray) {
        alien.x += alienVelocityX;
        if (alien.x + alien.width >= board.width || alien.x <= 0) {
            hit = true;
        }
    }
    // if there was a callision move all down and invert velocity
    if (hit) {
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            alien.y += alienHeight;
        }
        alienVelocityX *= -1;
    }

    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
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
        alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
        alienRows = Math.min(alienRows + 1, rows - 4);
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
    context.clearRect(0, 0, board.width, board.height);
    for (const alien of alienArray) {
        if (alien.alive) {
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);
        }
    }
    for (const bullet of bulletArray) {
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    context.fillStyle = "white";
    context.font = "16px courier";
    context.fillText(score, 5, 20);
    if(alienArray[alienArray.length-1].y >= ship.y) {
        gameOver = true;
    }
}

function moveShip(e) {
    if(gameOver){
        return isGameOver(alien, ship, score);
    }

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX;
    }
    else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX;
    }
}

// function createAliens() {
//     for (let c = 0; c < alienColumns; c++) {
//         for (let r = 0; r < alienRows; r++) {
//             let alien = {
//                 img: alienImg,
//                 x: alienX + c * alienWidth,
//                 y: alienY + r * alienHeight,
//                 width: alienWidth,
//                 height: alienHeight,
//                 alive: true
//             }
//             alienArray.push(alien);
//         }
//     }
//     alienCount = alienArray.length;
// }

function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {

            let alien = {
                img: alienImg,
                x: alienX + c * alienWidth,
                y: alienY + r * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    if(gameOver){
        return isGameOver(alien, ship, score);
    }

    if (e.code == "Space") {
        let bullet = {
            x: ship.x + shipWidth * 15 / 32,
            y: ship.y,
            width: tileSize / 8,
            height: tileSize / 2,
            used: false
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

function isGameOver(){
    if (alien.y >= ship.y) {
        gameOver = true;
        window.alert("Game Over!\n" + "Your score: " + score);
    }
    return gameOver;
}

