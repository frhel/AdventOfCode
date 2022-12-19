// ----------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/18
// Solution by: https://github.com/frhel (Fry)
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// -------------------------------- Imports -----------------------------------
// ----------------------------------------------------------------------------
const fs = require('fs');
// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline 
// character.
const input = fs.readFileSync('./data/day_18', 'utf-8')
    .replace(/\r/g, "").trim().split('\n');

// ----------------------------------------------------------------------------
// --------------------------------- Setup ------------------------------------
// ----------------------------------------------------------------------------
// Start by defining the relative positions of the adjacent voxels
let edges = [
    [0, -1, 0],
    [0, 0, -1],
    [0, 0, 1],
    [0, 1, 0],
    [1, 0, 0],
    [-1, 0, 0]
];

// No fancy parsing this time around since we're gonna be using strings a lot
// anyways. Wrote a utility function to parse on the fly.
let coords_list = new Set(input)
let grid_bounds = find_grid_bounds(coords_list);

// ----------------------------------------------------------------------------
// ------------------------------- Solution -----------------------------------
// ----------------------------------------------------------------------------
// -------------------------------- Part 1 ------------------------------------
// ----------------------------------------------------------------------------
let edgecount = count_edges(coords_list, edges);
console.log(`Part 1: ${edgecount} exposed faces`);

// ----------------------------------------------------------------------------
// -------------------------------- Part 2 ------------------------------------
// ----------------------------------------------------------------------------
let outside_edge_count = count_outside_edges(coords_list, edges, grid_bounds);
console.log(`Part 2: ${outside_edge_count} exposed faces`);


// ----------------------------------------------------------------------------
// ------------------------------ Functions -----------------------------------
// ----------------------------------------------------------------------------
// Part 1 solution. It's pretty simple. Just run through the list of coordinates
// and count the number of edges that are exposed to air. That means both
// outside of the structure and inside of the structure.
function count_edges(coords_list, edges) {
    let visible_edges = 0;
    for (let coords of coords_list) {
        for (let edge of edges) {
            let joined = join_coords(coords, edge);
            if (!coords_list.has(joined)) {
                visible_edges++;
            }
        }
    }
    return visible_edges;
}

// ----------------------------------------------------------------------------
// Just run through the list of coordinates and count the number of edges
// that are exposed to the outside of the structure.
function count_outside_edges(coords_list, edges) {
    let outside = map_exterior_air(coords_list, edges, grid_bounds);
    let edge_count = 0;
    for (let coords of outside) {
        for (let edge of edges) {
            let joined = join_coords(coords, edge);
            if (coords_list.has(joined)) {
                edge_count++;
            }
        }
    }
    return edge_count;
}

// ----------------------------------------------------------------------------
// This function is used to map the outside of the structure. It uses a BFS
// to find all of the voxels that are outside of the structure. It returns
// a set of coordinates that are outside of the structure. At the moment
// it's returning every single voxel that is outside of the structure, but
// I'm tired and I don't care enough to return only the voxels that are
// adjacent to the structure.
function map_exterior_air(coords_list, edges, grid_bounds) {
    let start = [0, 0, 01].join(',');
    let outside = new Set();
    let queue = [start];
    while (queue.length > 0) {
        let current = queue.shift();
        if (outside.has(current)) continue;
        outside.add(current);
        for (let edge of edges) {
            let joined = join_coords(current, edge);
            if (coords_list.has(joined)
                || outside.has(joined)
                || outside.has(joined)
                || !inside_bounds(joined, grid_bounds)) continue;
            queue.push(joined);
        }
    }
    return outside;
}

// ----------------------------------------------------------------------------
// ------------------------------- Utilities ----------------------------------
// ----------------------------------------------------------------------------
// A function to check if a given coordinate is inside the bounds of the grid
// that we're using to map the outside of the structure or not. It just
// looks nicer than the if statement that I was using before. Also, I'm
// subtracting 1 from the min values and adding 1 to the max values because
// I want to be able to hit the edges of the structure from the outside.
function inside_bounds(coords, bounds) {
    bounds = bounds.map(Number).map((x, i) => i % 2 === 0 ? x - 1 : x + 1)
    let [min_x, max_x, min_y, max_y, min_z, max_z] = bounds;
    let [x, y, z] = coords.split(',').map(Number);
    if (x < min_x || x > max_x || y < min_y || y > max_y || z < min_z || z > max_z) {
        return false;
    }
    return true;
}

// ----------------------------------------------------------------------------
// Just a little utility to simplify all the coordinate joining that I'm
// doing. Makes using those Sets() for quick lookups a lot easier.
function join_coords(coords, edge) {
    let [x2, y2, z2] = edge.map(Number);
    let [x, y, z] = coords.split(',').map(Number);
    return [x + x2, y + y2, z + z2].join(',');
}


// ----------------------------------------------------------------------------
// --------------------------- Setup Functions --------------------------------
// ----------------------------------------------------------------------------
// Pretty much the only setup function this time around. It's used to find the
// bounding cube of the input data. This is used to determine the size of the
// grid that we'll be using to map the outside of the structure.
function find_grid_bounds(coords_list) {
    coords_list = [...coords_list.values()].map(c => c.split(',').map(Number));
    let [min_x, max_x, min_y, max_y, min_z, max_z]
        = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity];
    for (let [x, y, z] of coords_list) {
        if (x < min_x) min_x = x;
        if (x > max_x) max_x = x;
        if (y < min_y) min_y = y;
        if (y > max_y) max_y = y;
        if (z < min_z) min_z = z;
        if (x > max_z) max_z = z;
    }
    return [min_x, max_x, min_y, max_y, min_z, max_z];
}