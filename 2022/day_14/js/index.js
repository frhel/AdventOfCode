// ----------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/14
// Solution by: https://github.com/frhel (Fry)
// ----------------------------------------------------------------------------

// -------------------------------- Imports -----------------------------------
const fs = require('fs');
// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline 
// character
const input = fs.readFileSync('../data', 'utf-8')
    .replace(/\r/g, "").trim().split('\n')
    .map(line => line.split(' -> '))
    .map(line => line.map(x => x.split(',').map(x => parseInt(x))));

// --------------------------------- Setup ------------------------------------
let walls = convert_input_to_zero_indexed_pairs(input);
let sand_entry = [500 - find_bounds(input)[0][0], 0];
let bounds = find_bounds(walls);
let grid = build_grid(walls, bounds, sand_entry);


// ------------------------------- Solution -----------------------------------
// -------------------------------- Part 1 ------------------------------------
let sand_pile_count = simulate_sand_flow(grid, sand_entry);
console.log(`Part 1: ${sand_pile_count} grains of sand in the pile.`)
// 823

// -------------------------------- Part 2 ------------------------------------
bounds = redeclare_bounds(bounds);
walls = convert_input_to_middle_indexed_pairs(input, bounds);
let min_x_inner = ~~(bounds[0][1] / 4) + 1;
sand_entry = [sand_entry[0] + min_x_inner, 0];
grid = build_grid(walls, bounds, sand_entry);
grid[grid.length - 1] = grid.at(-1).map(x => x = '#');
let sand_pile_count_2 = simulate_sand_flow(grid, sand_entry);
console.log(`Part 2: ${sand_pile_count_2} grains of sand in the pile.`)



// ------------------------------ Functions -----------------------------------
// ----------------------------------------------------------------------------
function simulate_sand_flow(grid, sand_entry) {
    let pile = [];
    let inside_bounds = true;
    let count = 0
    while (true) {
        let grain = [sand_entry[0], sand_entry[1]].slice();
        let inside_bounds = propagate_grain(grid, grain);
        if (inside_bounds === -1) return count;
        count++;
        if (inside_bounds === 1) {
            count++;
            return count;
        }
    }
    return count;
}

function propagate_grain(grid, grain) {
    let start_point = grain.slice();
    while (true) {
        let [x, y] = grain
        if (outside_bounds(grid, grain, 'left') || outside_bounds(grid, grain, 'right')) {
            return -1;
        }
        if (grid[y + 1][x] === ',') {
            grain[1]++;
        } else if (grid[y + 1][x] === 'o' || grid[y + 1][x] === '#') {
            if (grid[y + 1][x - 1] === ',') {
                grain[0]--, grain[1]++;
                if (outside_bounds(grid, grain, 'left')) {
                    return -1;
                }
            } else if (grid[y + 1][x + 1] === ',') {
                grain[0]++, grain[1]++;
                if (outside_bounds(grid, grain, 'right')) {
                    return -1;
                }
            } else if (grid[start_point[1] + 1][start_point[0] + 1] === 'o'
                && grid[start_point[1] + 1][start_point[0] + 1] === 'o') {
                grid[start_point[1]][start_point[0]] = 'o';
                return 1;
            } else {
                return true;
            }
        }
        grid[y][x] = ',';
        [x, y] = grain
        grid[y][x] = 'o';
        grid[sand_entry[1]][sand_entry[0]] = '+';
    }
}

function outside_bounds(grid, grain, left) {
    let [x, y] = grain;
    if (left) {
        x--, y++;
    } else {
        x++, y++;
    }
    if (y >= grid.length) return true;
    if (x < 0 || x >= grid[0].length) return true;
    return false;
}


function print_grid(grid) {
    let i = 0;
    for (let row of grid) {
        let spacer = (i < 10) ? ' ' : '';
        console.log(spacer + i++ + ' ' + row.join(''));
    }
}

// --------------------------- Setup Functions --------------------------------
// ----------------------------------------------------------------------------
function redeclare_bounds(bounds) {
    let [min_x, max_x] = bounds[0];
    let [min_y, max_y] = bounds[1];
    return [[min_x, (max_y + 4) * 7], [min_y, max_y + 2]];
}

function build_grid(input, bounds, sand_entry) {
    let [min_x, max_x] = bounds[0];
    let [min_y, max_y] = bounds[1];
    let grid = [];
    for (let y = min_y; y <= max_y; y++) {
        let row = [];
        for (let x = min_x; x <= max_x; x++) {
            if (x == sand_entry[0] && y == sand_entry[1]) {
                row.push('+');
                continue;
            }
            row.push(',');
        }
        grid.push(row);
    }
    grid = draw_walls(input, grid);
    return grid;
}

function draw_walls(input, grid) {
    for (let wall of input) {
        for (let i = 1; i < wall.length; i++) {
            let [x_start, y_start] = wall[i - 1];
            let [x_end, y_end] = wall[i];
            if (y_end < y_start) [y_start, y_end] = [y_end, y_start];
            if (x_end < x_start) [x_start, x_end] = [x_end, x_start];
            for (let y = y_start; y <= y_end; y++) {
                for (let x = x_start; x <= x_end; x++) {
                    grid[y][x] = '#';
                }
            }
        }
    }
    return grid;
}

function convert_input_to_zero_indexed_pairs(input) {
    let output = [];
    let min_x = find_bounds(input)[0][0];
    for (let wall of input) {
        let row = []
        for (let i = 0; i < wall.length; i++) {
            let [x, y] = wall[i]
            x -= min_x;
            row.push([x, y])
        }
        output.push(row);
    }
    return output;
}

function convert_input_to_middle_indexed_pairs(input, bounds) {
    let output = [];
    let min_x = find_bounds(input)[0][0];
    let min_x_inner = ~~(bounds[0][1] / 4) + 1;
    for (let wall of input) {
        let row = []
        for (let i = 0; i < wall.length; i++) {
            let [x, y] = wall[i]
            x -= min_x;
            x += min_x_inner;
            row.push([x, y])
        }
        output.push(row);
    }
    return output;
}

function find_bounds(input) {
    let [x_min, x_max] = [Infinity, 0];
    let [y_min, y_max] = [0, 0];
    for (let wall of input) {
        for (let point of wall) {
            point[0]
            let x = point[0]
            let y = point[1]

            if (x < x_min) x_min = x;
            else if (x > x_max) x_max = x;
            if (y > y_max) y_max = y;
        }
    }
    return [[x_min, x_max], [y_min, y_max]];
}