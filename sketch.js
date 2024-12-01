// Game of Life
// cleaner code, only dithering based

let stick_image;
files = ["cube.jpg", "chair.jpg", "rocket.jpg", "kitten.jpg", "ferrari.jpg"]
let all_images = []

let grid;
let cols;
let rows;
let resolution = 5;
let N = 100; //patch image size
let frame_rate = 10;

function preload() {
    for (let i = 0; i < files.length; i++) {
        all_images.push(loadImage('images/' + files[i]));
    }
}

function mousePressed() {
    let sx = int(mouseX / resolution);
    let sy = int(mouseY / resolution);
    stick_image = random(all_images);
    induct_state(stick_image, sx - N / 2, sy - N / 2); // from centre
}

function setup() {
    createCanvas(2000, 2000);
    cols = width / resolution;
    rows = height / resolution;

    grid = make2DArray(cols, rows);
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = 0;//floor(random(2));
        }
    }
}

function draw() {
    background(0);


    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let x = i * resolution;
            let y = j * resolution;
            if (grid[i][j] == 1) {
                fill(255);
                stroke(0);
                rect(x, y, resolution - 1, resolution - 1);
            }
        }
    }

    let next = make2DArray(cols, rows);

    // Compute next based on grid
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let state = grid[i][j];
            // Count live neighbors!
            let sum = 0;
            let neighbors = countNeighbors(grid, i, j);

            if (state == 0 && neighbors == 3) {
                next[i][j] = 1;
            } else if (state == 1 && (neighbors < 2 || neighbors > 3)) {
                next[i][j] = 0;
            } else {
                next[i][j] = state;
            }

        }
    }

    grid = next;
    frameRate(frame_rate);
}
