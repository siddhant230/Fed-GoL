// Game of Life
// cleaner code, only dithering based

let stick_image;
files = ["bh.jpg", "chair.jpg", "en.jpg", "kitten.jpg"]
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

function make2DArray(cols, rows) {
    let arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows);
    }
    return arr;
}

function induct_state(stick_image, sx = -1, sy = -1) {

    patch = image_state(stick_image, N);
    if (sx < 0) {
        let sx = rows / 4;
    }

    if (sy < 0) {
        let sy = cols / 4;
    }
    for (let i = sx; i < sx + N; i++) {
        for (let j = sy; j < sy + N; j++) {
            grid[i][j] = patch[i - sx][j - sy];
        }
    }
}

function image_state(stick_image, N) {

    stick_image.resize(N, N);
    stick_image.filter(GRAY);

    // edge_image = make_edge_map(stick_image);
    edge_image = makeDithered(stick_image, 2);

    image_matrix = make2DArray(N, N);
    // Iterate over the image pixels as a matrix
    for (let y = 0; y < edge_image.height; y++) {
        for (let x = 0; x < edge_image.width; x++) {
            let index = (x + y * edge_image.width) * 4; // Calculate the 1D index
            let r = edge_image.pixels[index];     // Red value
            let g = edge_image.pixels[index + 1]; // Green value
            let b = edge_image.pixels[index + 2]; // Blue value
            let a = edge_image.pixels[index + 3]; // Alpha value
            let gray = (r + g + b) / 3;
            let pix = 0;
            if (gray > 250) {
                pix = 1;
            }
            image_matrix[x][y] = pix;
        }
    }

    return image_matrix;
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

// dithering helper functions
function countNeighbors(grid, x, y) {
    let sum = 0;
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            let col = (x + i + cols) % cols;
            let row = (y + j + rows) % rows;
            sum += grid[col][row];
        }
    }
    sum -= grid[x][y];
    return sum;
}

function imageIndex(img, x, y) {
    return 4 * (x + y * img.width);
}

function getColorAtindex(img, x, y) {
    let idx = imageIndex(img, x, y);
    let pix = img.pixels;
    let red = pix[idx];
    let green = pix[idx + 1];
    let blue = pix[idx + 2];
    let alpha = pix[idx + 3];
    return color(red, green, blue, alpha);
}

function closestStep(max, steps, value) {
    return round(steps * value / 255) * floor(255 / steps);
}

function setColorAtIndex(img, x, y, clr) {
    let idx = imageIndex(img, x, y);

    let pix = img.pixels;
    pix[idx] = red(clr);
    pix[idx + 1] = green(clr);
    pix[idx + 2] = blue(clr);
    pix[idx + 3] = alpha(clr);
}

function makeDithered(img, steps) {
    img.loadPixels();

    for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
            let clr = getColorAtindex(img, x, y);
            let oldR = red(clr);
            let oldG = green(clr);
            let oldB = blue(clr);
            let newR = closestStep(255, steps, oldR);
            let newG = closestStep(255, steps, oldG);
            let newB = closestStep(255, steps, oldB);

            let newClr = color(newR, newG, newB);
            setColorAtIndex(img, x, y, newClr);

            let errR = oldR - newR;
            let errG = oldG - newG;
            let errB = oldB - newB;

            distributeError(img, x, y, errR, errG, errB);
        }
    }

    img.updatePixels();
    return img;
}

function distributeError(img, x, y, errR, errG, errB) {
    addError(img, 7 / 16.0, x + 1, y, errR, errG, errB);
    addError(img, 3 / 16.0, x - 1, y + 1, errR, errG, errB);
    addError(img, 5 / 16.0, x, y + 1, errR, errG, errB);
    addError(img, 1 / 16.0, x + 1, y + 1, errR, errG, errB);
}

function addError(img, factor, x, y, errR, errG, errB) {
    if (x < 0 || x >= img.width || y < 0 || y >= img.height) return;
    let clr = getColorAtindex(img, x, y);
    let r = red(clr);
    let g = green(clr);
    let b = blue(clr);
    clr.setRed(r + errR * factor);
    clr.setGreen(g + errG * factor);
    clr.setBlue(b + errB * factor);

    setColorAtIndex(img, x, y, clr);
}