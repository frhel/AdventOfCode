// ----------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/12
// Solution by: https://github.com/frhel (Fry)
// ----------------------------------------------------------------------------

/*
    This is the messiest so far. It's late and I'm tired. This took way too long
    to solve and I really can't be bothered to clean it up.
    It works, but it's not pretty.
    At least I managed to get it working without looking at solutions.
    
    Yay.
*/

// -------------------------------- Imports -----------------------------------
const fs = require('fs');
const { start } = require('repl');
// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline 
// character
const input = fs.readFileSync('./data/day_12', 'utf8').split('\r\n');

// --------------------------------- Setup ------------------------------------
const start_pos = find_pos('S', input);
const goal_pos = find_pos('E', input);
// This whole thing is a mess. I start by making a grid of objects where each
// object has a state property that corresponds to the character in the input
const obj_grid = make_grid(input);
// Then I convert all the letters to numbers for easier processing
const nr_grid = convert_letters_to_numbers(obj_grid);
// Then I calculate the distance from each point to the start and goal and 
// store it in the grid
let grid = calc_all_distances(nr_grid);
// Then I make a deep copy of the grid so I can reset it later without 
// any funny business
const grid__copy = JSON.parse(JSON.stringify(grid));
// These are just the row/col max values for easy access
const row = grid.length;
const col = grid[0].length;
let starting_points = get_sorted_starting_points();


// ------------------------------- Solution -----------------------------------
// -------------------------------- Part 1 ------------------------------------
let path = find_path(start_pos, goal_pos);
let path_length = resolve_path(path).length - 1;
console.log(`Part 1: Shortest path length is ${path_length}`);

// -------------------------------- Part 2 ------------------------------------
// This is just messy. I can't be bothered to tidy it up
let paths = [];
for (let i = 0; i < starting_points.length; i++) {
    // Reset the grid
    grid = JSON.parse(JSON.stringify(grid__copy));
    // Find and push all the paths to the paths array
    let path = find_path(starting_points[i], goal_pos);
    if(path) {
        paths.push(resolve_path(path));
    }    
}
// Sort the paths by length and print the shortest one
// Need sleep. Brute force will have to do
let shortest = paths.sort((a, b) => {
    return a.length - b.length;
});
console.log(`Part 2: Shortest path length is ${shortest[0].length - 1}`);


// ------------------------------ Functions -----------------------------------
// ----------------------------------------------------------------------------
function find_path(start, goal) {
    let location = {r: start[0], c: start[1]};

    // Took me most of the day of banging head against wall before
    // realising that my original implementation was failing because
    // I wasn't using a queue...
    let queue = [];

    // Presave all the edges for each location on the grid itself
    find_all_valid_edges();
    queue.push(location);

    // Loop through the queue until it's empty or we find the goal
    while(queue.length > 0){
        // Actually didn't know about shift() before this. I've been using
        // splice(0, 1) for ages. No clue which is faster though.
        let current_location = queue.shift();

        // If we've found the goal, return the path
        if(current_location.r == goal[0] && current_location.c == goal[1])
            return current_location;
        grid[current_location.r][current_location.c].state = 'visited'    
        
        // Get the edges for the current location and add them to the queue
        let edges = grid[current_location.r][current_location.c].edges.reverse();
        while (edges.length > 0) {
            // Use up the edges by popping them off the array so we don't
            // go through them again. This had me stumped for a while
            // doing infinite loops galore...
            let edge = edges.pop();
            if(grid[edge.r][edge.c].state !== 'visited') {
                queue.push(edge);
                // Store the parent so we can resolve the path back to origin later
                grid[edge.r][edge.c]['parent'] = current_location;
            }
        }
    }
    return false;
}

// Aggregate all the possible starting points for part 2 into an array
// for brute forcing
function get_sorted_starting_points() {
    let starting_points = [];
    for (let r = 0; r < row; r++) {
        for (let c = 0; c < col; c++) {
            if (grid[r][c].state == 'start' || grid[r][c].state == '0')
                starting_points.push([r, c]);
        }
    }
    // Don't need to sort them because we're brute forcing anyway
    // but I did it anyway cause I wasn't planning on brute forcing
    return starting_points.sort((a, b) => {
        return grid[a[0]][a[1]].dist - grid[b[0]][b[1]].dist;
    });
}

// Follow the path back to the start, log each step and return the path
function resolve_path(path){
    let paths = [path];
    while(true){
        let r = path.r;
        let c = path.c;
        let parent = grid[r][c].parent;
        if(parent == undefined)
            break;
        paths.push(parent);
        path = {r:parent.r,c:parent.c};
    }
    return paths;
}

// Iterate through the grid and log all the valid edges for each location in the grid
// Save the edges on the node in the grid itself
function find_all_valid_edges() {
    let row = grid.length;
    let col = grid[0].length;    
    let edges = []; 
    for (let r = 0; r < row; r++) {
        for (let c = 0; c < col; c++) {
            let edges = explore_location({r: r, c: c});
            grid[r][c].edges = edges;
        }
    }
}

// Loop through the grid and calculate the distance from each point to the start and goal
// Save the ratio of the two distances as the distance for each point straight onto
// the grid itself
function calc_all_distances(input_grid) {
    let row = input_grid.length;
    let col = input_grid[0].length;
    for (let r = 0; r < row; r++) {
        for (let c = 0; c < col; c++) {
            if (input_grid[r][c].state == 'start') continue;
            if (input_grid[r][c].state == 'goal') continue;
            input_grid[r][c] = {
                state: input_grid[r][c].state,
                dist: find_distance([c, r], start_pos) / find_distance([c, r], goal_pos)
                
            };
        }
    }
    return input_grid;
}

// Find and validate all the edges for a given node
function explore_location (location){
    let r = location.r;
    let c = location.c;
    let edges = [];
    if (safe_neighbour(r, c - 1, location)) edges.push({ r: r, c: c - 1 });
    if (safe_neighbour(r, c + 1, location)) edges.push({ r: r, c: c + 1 });
    if (safe_neighbour(r - 1, c, location)) edges.push({ r: r - 1, c: c });
    if (safe_neighbour(r + 1, c, location)) edges.push({ r: r + 1, c: c });
    edges = edges.sort((a, b) => {
        (grid[b.r][b.c].dist - grid[a.r][a.c].dist)
    });  
    return edges;
}

// Make sure that we're not out of bounds
function safe_neighbour(r, c, l) {
    if (r < 0 || r >= row) return false;
    if (c < 0 || c >= col) return false;
    if (grid[r][c].state > grid[l.r][l.c].state + 1) return false;
    return true;
};

function find_distance(pos1, pos2) {
    return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
}

// --------------------------- Setup Functions --------------------------------
// ----------------------------------------------------------------------------
// Create a grid from the input file with objects for each node in the grid
// saving the 'start', 'goal' and the height of the node as state property
function make_grid(input) {
    let grid = [];
    for (let line of input) {
        let row = [];
        for (let char of line) {
            if (char == 'S')
                row.push({state: 'start'});
            else if (char == 'E')
                row.push({state: 'goal'})
            else
                row.push({state: char});
        }
        grid.push(row);
    }
    return grid;
}

// Convert all the state values to numbers for easier comparison when finding
// valid edges
function convert_letters_to_numbers(in_grid) {
    let grid = [];
    for (let line of in_grid) {
        let row = [];
        for (let char of line) {
            if (char.state == 'start')
                row.push({state: 0});
            else if (char.state == 'goal')
                row.push({state: 25})
            else
                row.push({state: char.state.charCodeAt(0) - 97})
        }
        grid.push(row);
    }
    return grid;
}

// Just a helper function to find the position of the start and goal
function find_pos(symbol) {
    let pos = [];
    for (let x = 0; x < input.length; x++)
        for (let y = 0; y < input[x].length; y++)
            if (input[x][y] === symbol)
                pos = [x, y];
    return pos;
}