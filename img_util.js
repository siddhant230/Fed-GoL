// base image utils
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
            if (patch[i - sx][j - sy] == 0) {
                continue;
            }
            grid[i][j] = patch[i - sx][j - sy];
        }
    }
}

function image_state(stick_image, N) {

    stick_image.resize(N, N);
    stick_image.filter(GRAY);

    // edge_image = make_edge_map(stick_image);
    edge_image = makeDithered(stick_image, 1);

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