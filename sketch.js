// Game of Life
// cleaner code, only dithering based

let stick_image;
files = ["rembg_cube.png", "rembg_chair.png", "rembg_rocket.png", "rembg_kitten.png", "rembg_ferrari.png"]
let all_images = []
let uploaded_image;
let generation = 0;

let grid;
let cols;
let rows;
let resolution = 5;
let N = 100; //patch image size
let frame_rate = 5;
let CANVAS_SIZE = 2500;
const generationTxt = document.getElementById('generation');
const aliveTxt = document.getElementById('alive');
const deathsTxt = document.getElementById('death');
const birthsTxt = document.getElementById('birth');
const buttons = document.getElementById('buttons');
const selected_mode = document.getElementById('color-mode');

function preload() {
    for (let i = 0; i < files.length; i++) {
        all_images.push(loadImage('images/' + files[i]));
    }
}

function mousePressed() {
    if (isMouseOverButton()) {
        return;
    }

    let sx = int(mouseX / resolution);
    let sy = int(mouseY / resolution);

    if (uploaded_image) {
        stick_image = uploaded_image
    }
    else {
        stick_image = random(all_images);
    }
    induct_state(stick_image, sx - N / 2, sy - N / 2); // from centre
}


function isMouseOverButton() {
    let rect = buttons.getBoundingClientRect();
    let canvasRect = canvas.getBoundingClientRect();
    let adjustedMouseX = mouseX + canvasRect.left;
    let adjustedMouseY = mouseY + canvasRect.top;

    if (
        adjustedMouseX >= rect.left &&
        adjustedMouseX <= rect.right &&
        adjustedMouseY >= rect.top &&
        adjustedMouseY <= rect.bottom
    ) {
        return true;
    }
    return false;
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            loadImage(e.target.result, function (img) {
                uploaded_image = img;
                console.log("Image uploaded successfully");
            });
        }
        reader.readAsDataURL(file);
        document.getElementById('fileName').textContent = file.name;
    }
}

function init_canvas() {
    createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    cols = width / resolution;
    rows = height / resolution;

    grid = make2DArray(cols, rows);
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = 0;//floor(random(2));
        }
    }
}

function restart(event) {
    console.log("Restarting..");
    clear();

    init_canvas();
}


function clear_upload(event) {
    console.log("Clearing image");
    uploaded_image = NaN
    document.getElementById('fileName').textContent = 'No file chosen';
}

function assign_color(num_neighbors) {
    let mode = selected_mode.value;
    document.getElementById('current-mode').textContent = "running in " + mode + " mode";

    if (mode == "matrix") {
        return [0, 255 / num_neighbors, 0];
    }
    else if (mode == "white-fade") {
        return [255 / num_neighbors, 255 / num_neighbors, 255 / num_neighbors];
    }
    else if (mode == "color") {
        if (num_neighbors == 0 || num_neighbors == 1) {
            return [0, 255, 0];
        }
        else if (num_neighbors == 2) {
            return [255, 255, 0];
        }
        else if (num_neighbors == 3) {
            return [255, 0, 0];
        }
        else {
            return [0, 0, 0];
        }
    }
}

function setup() {
    init_canvas()

    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', handleFileUpload);

    const clearBtn = document.getElementById('clearUpload')
    clearBtn.addEventListener('click', clear_upload);

    const restartBtn = document.getElementById('restart')
    restartBtn.addEventListener('click', restart);

    const increaseBtn = document.getElementById('increaseSpeed')
    increaseBtn.addEventListener('click', increase_speed);

    const decreaseBtn = document.getElementById('decreaseSpeed')
    decreaseBtn.addEventListener('click', decrease_speed);
}

function draw() {
    background(0);

    let deaths = 0;
    let births = 0;
    let alive = 0;

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let x = i * resolution;
            let y = j * resolution;
            let num_neighbors = countNeighbors(grid, i, j);

            let r = 0;
            let g = 0;
            let b = 0;
            if (grid[i][j] == 1) {
                let [r, g, b] = assign_color(num_neighbors);
                fill(r, g, b);
                alive++;
                rect(x, y, resolution - 1, resolution - 1);
            }
        }
    }

    let next = make2DArray(cols, rows);
    let sum = 0;
    // Compute next based on grid
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let state = grid[i][j];
            // Count live neighbors!

            sum = sum + state;
            let neighbors = countNeighbors(grid, i, j);

            if (state == 0 && neighbors == 3) {
                next[i][j] = 1;
                births++;
            } else if (state == 1 && (neighbors < 2 || neighbors > 3)) {
                next[i][j] = 0;
                deaths++;
            } else {
                next[i][j] = state;
            }

        }
    }

    grid = next;
    if (sum != 0) {
        generation++;
    }

    generationTxt.textContent = str(generation) + " Generations";
    aliveTxt.textContent = str(alive) + " Alive";
    deathsTxt.textContent = str(deaths) + " Deaths";
    birthsTxt.textContent = str(births) + " Births";

    frameRate(frame_rate);
}

function increase_speed() {
    if (frame_rate < 15) {
        frame_rate++;
    }
}

function decrease_speed() {
    if (frame_rate > 1) {
        frame_rate--;
    }
}
