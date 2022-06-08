const $canvas = document.querySelector('canvas');
const ctx = $canvas.getContext('2d');

const W = $canvas.width;
const H = $canvas.height;

let randomW = Math.floor(Math.random() * W) + 1;
let randomH = Math.floor(Math.random() * H) + 1;

const MAXSPEED = 8;
let raf;

let frames = 0;
let myObstacles = []
let score = 0;

const music = new Audio('https://res.cloudinary.com/dxwvgsbzq/video/upload/v1654704842/bird/flappy%20monkey/04_Chill_yebpvf.mp3');

class Vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;

    }
    add(vec) {
        this.x += vec.x;
        this.y += vec.y;
    }
    mult(num) {
        this.x *= num;
        this.y *= num;
    }
    limit(MAXI) {
        this.x = Math.min(Math.max(this.x, -MAXI), MAXI);
        this.y = Math.min(Math.max(this.y, -MAXI), MAXI);
    }
}

class Particule {
    constructor(x, y) {
        this.acc = new Vec(0, 0);
        this.vel = new Vec(0, 0);
        this.pos = new Vec(x, y);

    }
    applyForce(force) {
        this.acc.add(force);
    }
    update() {
        // 1. add acceleration to velocity
        this.vel.add(this.acc);
        // 1.2 limit velocity
        this.vel.limit(MAXSPEED);

        // 2. add velocity to position
        this.pos.add(this.vel);
    }
}

class Thing extends Particule {
    constructor(x, y) {
        super(x, y);
        this.w = 50;
        this.h = 40;
        let img = document.createElement('img');
        img.onload = () => {
            this.img = img;

            // const imgRatio = img.naturalWidth / img.naturalHeight;
            // imgHeight = Math.floor(this.width / imgRatio); // use ratio to compute `carHeight`      
        }
        img.src = "https://res.cloudinary.com/dxwvgsbzq/image/upload/v1654713018/bird/flappy%20monkey/player_zyfl6w.png";
    }
    up(strength = 6) {
        this.applyForce(new Vec(0, -strength));
    }
    left(strength = 0.5) {
        this.applyForce(new Vec(-strength, 0));
    }
    right(strength = 0.5) {
        this.applyForce(new Vec(strength, 0));
    }

    update() {
        super.update()

        // limit y
        if (this.pos.y >= H - this.h) {
            this.pos.y = H - this.h; // max
            this.vel.mult(0); // stop
        }
        // limit x on the right
        if (this.pos.x >= W - this.w) {
            this.pos.x = W - this.w; // max
            this.vel.mult(0); // stop
        }
        // // limit x on the left
        if (this.pos.x < 0) {
            this.pos.x = 0; // max
            this.vel.mult(0); // stop

        }

        this.acc.mult(0); // do not accumulate

    }
    paint() {
        // ctx.fillRect(this.pos.x, this.pos.y, this.w, this.h);
        if (!this.img) return; // if `this.img` is not loaded yet => don't draw

        ctx.drawImage(this.img, this.pos.x, this.pos.y, this.w, this.h);

    }

    crashWith(obstacle) {
        // console.log('hey', obstacle.x, obstacle.y, obstacle.width, obstacle.height)
        return (
            this.pos.y + 20 > obstacle.y &&
            this.pos.y < obstacle.y + obstacle.height &&
            this.pos.x + 20 > obstacle.x &&
            this.pos.x < obstacle.x + obstacle.width
        );
    }
}


let player = new Thing(300, 0);



function updateObstacles() {
    // console.log('coucou updateObstacles')

    // On fait descendre les obstacles d'un cran vers le bas
    for (i = 0; i < myObstacles.length; i++) {
        myObstacles[i].y += 1;
        myObstacles[i].update();
    }





}

function draw() {
    ctx.clearRect(0, 0, W, H);

    //ctx.translate(player.x, 0)

    // Apply gravity
    player.applyForce(new Vec(0, .2));

    if (interactions.arrowleft) {
        player.left();
    }
    if (interactions.arrowright) {
        player.right();
    }

    // maj de la player
    player.update();
    player.paint();


    // creation d'un obstacle toutes les 150 frames
    if (frames % 150 === 0) {
        createObstacle()
    }
    updateObstacles(); // les obstacles descendent + creation
    checkGameOver();
    if (myObstacles.length > 10) {
        frames++
    } else if (myObstacles.length > 20) {
        frames++
    } else if (myObstacles.length > 40) {
        frames++
    } else if (myObstacles.length > 60) {
        frames++
    }
}

function createObstacle() {
    // limitation de la width d'un obstacle


    randomX = Math.floor(Math.random() * W + 1);
    // randomX2 = Math.floor(Math.random() * (W / 3) + (W / 3));

    let obstacle = new Obstacles(randomX, 0)
    // let obstacle2 = new Obstacles(randomX2, -120)

    myObstacles.push(obstacle);
    score = "score : " + (myObstacles.length - 1) * 10;

}

//
// interactions
//

// An state-object of each keys
const interactions = {
    arrowleft: false,
    arrowright: false,
    arrowup: false
};

document.onkeydown = function (e) {
    switch (e.key) {
        case 'ArrowLeft':
            if (interactions.arrowleft) return; // if already pressed => skip
            interactions.arrowleft = true;      // set to `true` to skip next time
            break;
        case 'ArrowRight':
            if (interactions.arrowright) return;
            interactions.arrowright = true;
            break;
        case 'ArrowUp':
            if (interactions.arrowup) return;
            interactions.arrowup = true;
            player.up(); // impulse
            break;
    }
}
document.onkeyup = function (e) {
    switch (e.key) {
        case 'ArrowLeft':
            interactions.arrowleft = false;    // release our state
            break;
        case 'ArrowRight':
            interactions.arrowright = false;
            break;
        case 'ArrowUp':
            interactions.arrowup = false;
            break;
    }
}

document.body.onclick = function (e) {
    player.up();

}


//
// animloop
//
function startGame() {
    if (raf) {
        cancelAnimationFrame(raf);
    }

    gameover = false;
    points = 0;
    myObstacles = []; // reset ton tab des obtstacles
    score = "score : " + 0;
    player;
    player.pos.y = 0;
    player.pos.x = W / 2;
    player.acc = new Vec(0, 0);
    player.vel = new Vec(0, 0);
    music.play();
    music.loop = true;

    raf = requestAnimationFrame(animLoop);
}

function checkGameOver() {

    //
    // player touche les bords ?
    //

    if (player.pos.y >= H - player.h) {
        player.pos.y = H - player.h; // max
        player.vel.mult(0); // stop
        // console.log("gameover", player.pos.y, player.pos.x)
        gameover = true;
    }

    // limit x on the right
    if (player.pos.x >= W - player.w) {
        player.pos.x = W - player.w; // max
        player.vel.mult(0); // stop
        // console.log("gameover", player.pos.y, player.pos.x)
        gameover = true;
    }

    // // limit x on the left
    if (player.pos.x <= 0) {
        player.pos.x = 0; // max
        player.vel.mult(0); // stop
        // console.log("gameover", player.pos.x, player.pos.y)
        gameover = true;
    }

    //
    // player touche un des obstacles ?
    //

    // TODO parcours toutes tes obstacles (myObstacles)
    //   pour chacun d'eux:
    //     - si player est en collision avec lui => gameover
    //     - sinon: rien
    // player.crashWith(obs)

    const crashed = myObstacles.some(function (obstacle) {
        return player.crashWith(obstacle);
    });

    if (crashed) {
        gameover = true;
    }
}


function animLoop() {
    frames++;

    draw();
    ctx.font = '20px serif';
    ctx.fillText(score, 30, 30)
    ctx.fillStyle = 'white'
    ctx.arc(0, 570, Math.PI, 1, 5 * Math.PI, true);
    if (!gameover) {
        raf = requestAnimationFrame(animLoop);
        ctx.font = '20px serif';
        ctx.fillText(score, 30, 30)
    } else {
        ctx.clearRect(0, 0, W, H)
        ctx.font = '50px serif';
        ctx.fillStyle = 'white'
        ctx.fillText('GAME OVER', 150, 300);
        ctx.font = '20px serif';
        ctx.fillStyle = 'white'
        ctx.fillText(score, 270, 330)
        music.pause();
    }

}



document.getElementById("button-start").onclick = function () {
    startGame();

};




// setInterval(draw, 16)