const $canvas = document.querySelector('canvas');
const ctx = $canvas.getContext('2d');

const W = $canvas.width;
const H = $canvas.height;

let randomW = Math.floor(Math.random() * W) + 1;
let randomH = Math.floor(Math.random() * H) + 1;

// function randomW() {
//     return Math.floor(Math.random() * W) + 1;
// }
const MAXSPEED = 8;
let raf;

let frames = 0;

let myObstacles = []
let score = 0;

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
    constructor(x, y, w, h) {
        super(x, y);
        this.w = w;
        this.h = h;
        this.color = "white";
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
        ctx.fillRect(this.pos.x, this.pos.y, this.w, this.h);

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


let thing = new Thing(300, 0, 20, 20);



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

    //ctx.translate(thing.x, 0)

    // Apply gravity
    thing.applyForce(new Vec(0, .2));

    if (interactions.arrowleft) {
        thing.left();
    }
    if (interactions.arrowright) {
        thing.right();
    }

    // maj de la thing
    thing.update();
    thing.paint();

    // creation d'un obstacle toutes les 150 frames
    if (frames % 150 === 0) {
        createObstacle()
    }
    updateObstacles(); // les obstacles descendent + creation
    checkGameOver();
    if (myObstacles.length > 5) {
        frames++
    } else if (myObstacles.length > 10) {
        frames++
    } else if (myObstacles.length > 20) {
        frames++
    } else if (myObstacles.length > 50) {
        frames++
    }
}

function createObstacle() {
    // limitation de la width d'un obstacle
    let minWidth = 200;
    let maxWidth = 400;
    width = Math.floor(Math.random() * (maxWidth - minWidth + 1) + minWidth);
    randomX = Math.floor(Math.random() * (W + 1));

    let obstacle = new Obstacles(width, imgHeight, randomX, 0)
    console.log("heeeeey : ", imgHeight)
    console.log("coucou : ", randomX)
    console.log("bonjour : ", width)
    console.log(obstacle)

    myObstacles.push(obstacle);
    score = "score : " + myObstacles.length * 10;
    console.log(myObstacles.length)

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
            thing.up(); // impulse
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
    thing.up()
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
    thing;
    thing.pos.y = 0;
    thing.pos.x = W / 2;
    thing.acc = new Vec(0, 0);
    thing.vel = new Vec(0, 0);


    raf = requestAnimationFrame(animLoop);
}

function checkGameOver() {

    //
    // thing touche les bords ?
    //

    if (thing.pos.y >= H - thing.h) {
        thing.pos.y = H - thing.h; // max
        thing.vel.mult(0); // stop
        console.log("gameover", thing.pos.y, thing.pos.x)
        gameover = true;
    }

    // limit x on the right
    if (thing.pos.x >= W - thing.w) {
        thing.pos.x = W - thing.w; // max
        thing.vel.mult(0); // stop
        console.log("gameover", thing.pos.y, thing.pos.x)
        gameover = true;
    }

    // // limit x on the left
    if (thing.pos.x <= 0) {
        thing.pos.x = 0; // max
        thing.vel.mult(0); // stop
        console.log("gameover", thing.pos.x, thing.pos.y)
        gameover = true;
    }

    //
    // thing touche un des obstacles ?
    //

    // TODO parcours toutes tes obstacles (myObstacles)
    //   pour chacun d'eux:
    //     - si thing est en collision avec lui => gameover
    //     - sinon: rien
    // thing.crashWith(obs)

    const crashed = myObstacles.some(function (obstacle) {
        return thing.crashWith(obstacle);
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

    if (!gameover) {
        raf = requestAnimationFrame(animLoop);
        ctx.font = '20px serif';
        ctx.fillText(score, 30, 30)
    } else {
        ctx.clearRect(0, 0, W, H)
        ctx.font = '50px serif';
        ctx.fillText('GAME OVER', 150, 300);
        ctx.font = '20px serif';
        ctx.fillText(score, 30, 30)
    }

}



document.getElementById("button-start").onclick = function () {
    startGame();

};




// setInterval(draw, 16)