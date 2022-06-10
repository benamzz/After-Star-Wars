let imgHeight = 20;
class Obstacles {
    constructor(x, y) {
        this.width = 90;
        this.height = 70; //100 / imgRatio;  // use ratio to compute `carHeight`
        this.x = x;
        this.y = y;
        this.color = "white"

        let img = document.createElement('img');
        img.onload = () => {
            this.img = img;

            // const imgRatio = img.naturalWidth / img.naturalHeight;
            // imgHeight = Math.floor(this.width / imgRatio); // use ratio to compute `carHeight`      
        }
        img.src = "https://res.cloudinary.com/dxwvgsbzq/image/upload/v1654543455/bird/flappy%20monkey/asteroide_dujnk7.png";

    }

    update() {
        // ctx.fillStyle = this.color;
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        if (!this.img) return; // if `this.img` is not loaded yet => don't draw

        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
}













