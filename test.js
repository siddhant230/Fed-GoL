// Daniel Shiffman
// Game of Life

let stick_image;
files = ["bh.jpg", "chair.jpg", "en.jpg", "kitten.jpg"]
let resolution = 1;


function preload() {
    stick_image = load_random_image();
    console.log("loaded image")
}

function load_random_image() {
    filename = "images/" + random(files);
    stick_image = loadImage(filename);
    console.log("loaded image", filename);
    return stick_image;
}

function setup() {
    createCanvas(2000, 2000);
    background(0);
}

function mousePressed() {
    stick_image = load_random_image();
    background(0);
}

function draw() {
    image(stick_image, 0, 0);
}
