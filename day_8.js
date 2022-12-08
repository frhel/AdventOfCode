// -----------------------------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/8
// Solution by: frhel (Fry)
// -----------------------------------------------------------------------------------------------

// ---------------------------------------Imports-------------------------------------------------
const fs = require('fs');
// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline character
const input = fs.readFileSync('./data/day_8', 'utf8').split('\r\n').reverse();


// ---------------------------------------Constants-----------------------------------------------
// Save the grid as a 2D array of integers
const grid = input.map((line) => line.split('').map((char) => parseInt(char)));
// Define the edge bounds of the grid
const bounds = new Map([
    ['row', [0, grid[0].length - 1]],
    ['col', [0, grid.length - 1]]
]);
// Count the number of trees on the edges of the grid
const edge_tree_count = [...bounds.values()].reduce((acc, val) => acc + val[1] * 2, 0);
// Find the number of trees that are visible from outside the forest
const visible_trees = find_visible_trees();


// ---------------------------------------Solutions-----------------------------------------------
// ----------------------------------------Part 1-------------------------------------------------
// Part 1 Solution Output. Find the number of visible trees from outside the forest
let part_1_solution = visible_trees.size + edge_tree_count;
console.log(`Part 1 Solution: ${part_1_solution}`);

// ----------------------------------------Part 2-------------------------------------------------
// Part 2 Solution Output. Find the coordinates of the tree with the best scenic score
let part_2_solution = find_best_tree()[1];
console.log(`Part 2 Solution: ${part_2_solution}`);



// ----------------------------------------Functions-----------------------------------------------
// fn find_best_tree(): Array ---------------------------------------------------------------------
//
// # Description
// Loops through the set of visible trees and gets the scenic score for each tree. The tree with the
// highest scenic score is returned along with its coordinates.
//
// # Returns
// Array of the coordinates of the tree with the highest scenic score and the scenic score
function find_best_tree() {
    let best_tree = [[], 0]; // Initialize the best tree to an empty array and a score of 0

    // Only loop through the trees that we have already determined are visible from outside the forest
    // by fetching the set of visible trees from the visible_trees constant
    for (let tree of visible_trees) {
        // Grab the scenic score for the current tree and update the best_tree variable if the current
        // tree has a higher scenic score than the current best tree
        let scenic_score = calc_scenic_score(tree);
        if (scenic_score > best_tree[1]) best_tree = [tree, scenic_score];
    }
    return best_tree;
}

// fn calc_scenic_score([row, col]): int ----------------------------------------------------------
//
// # Description
// Calculates the scenic score of a tree by multiplying the number of trees visible in each 
// direction from the tree.
//
// # Returns
// Integer representing the scenic score of the tree
//
// # Parameters
// tree: Array - The coordinates of the tree to calculate the scenic score for
function calc_scenic_score(tree) {
    // Initialize the score to 1 since we will be multiplying the number of trees visible in each
    // direction by the accumulated score and if we start with 0, the score will always be 0
    let score = 1;

    // Define the directions to crawl through the grid as a matrix of row and column iterators
    const crawl_directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    // Loop through the directions and multiply the number of trees visible in each direction by 
    // the accumulated score
    for (let [row_iter, col_iter] of crawl_directions) {
        score *= calc_direction_score(row_iter, col_iter, tree);
    }
    return score;
}

// fn calc_direction_score(row_iter, col_iter, [row, col]): int -----------------------------------
//
// # Description
// Calculates the number of trees visible in a given direction from a given tree.
//
// # Returns
// Integer representing the number of trees visible in a given direction from a given tree
//
// # Parameters
// row_iter: int - The row iterator to use when crawling through the grid
// col_iter: int - The column iterator to use when crawling through the grid
// tree: Array - The coordinates of the tree to calculate the number of visible trees from
function calc_direction_score(row_iter, col_iter, [row, col]) {
    // Grab the current tree height and initialize the score to 0
    let [curr, score] = [grid[row][col], 0];

    // Loop through the grid in the given direction until we reach the edge of the grid or a tree
    // that is taller or same height as the current tree
    while (true) {
        // Increment the row and column by the row and column iterators and to get the next cell
        // in the grid
        row += row_iter, col += col_iter;

        // Break out of the loop early if we have reached the edge of the grid or if we have 
        // reached a tree that is taller than the current tree
        if (outside_bounds(row, col)) break;

        // Increment the score before checking if the current tree is smaller or equal to the
        // because we want to count the current tree as visible regardless of its height before
        // breaking out of the loop
        score++;

        if (curr <= grid[row][col]) break;
    }
    return score;
}

// fn find_visible_trees(): Set -------------------------------------------------------------------
//
// # Description
// Loops through the grid, excluding the edges, and checks the visibility of each tree as seen from
// the edges of the grid. If the tree is visible from outside the forest, it is added to a set of
// visible trees.
//
// # Returns
// Set of coordinates for visible trees
function find_visible_trees() {
    let trees = new Set();
    for (let row = 1; row < grid.length - 1; row++) {
        for (let col = 1; col < grid[0].length - 1; col++) {
            // Start by only checking the size of the tree against the trees on the edges of the grid
            let edge_visibility = check_border([row, col]);

            // Feed the results of the edge check into the tree_visibility function to process the
            // visibility of the tree within the grid. 
            // Return bool true if the tree is visible from outside
            let visible = tree_visibility(edge_visibility, [row, col]);

            // If the tree is visible from outside, add it to the set of visible trees
            if (visible) trees.add([row, col]);
        }
    }
    return trees;
}


// fn tree_visibility(edge_visibility, [row, col], visible = false): bool -------------------------
// 
// # Description
// The function iterates through the edge_visibility map and checks the visibility of the tree
// in the direction of any edge that the tree is visible from. If the tree is visible from any
// edge, the function returns true. Otherwise, it returns false.
//
// # Returns
// Boolean to indicate whether the tree is visible from outside the forest or not
//
// # Parameters
// edge_visibility: Map - A map of the edges of the grid and the visibility of the tree from that edge 
// [row, col]: Array - The coordinates of the tree to check
function tree_visibility(edge_visibility, [row, col]) {
    // Iterate through the edge_visibility map and check the visibility of the tree in the direction
    for (let [key, value] of edge_visibility) {
        // If the tree is not visible from the current edge, skip to the next edge
        if (value === 0) continue;
        
        // If the tree is visible from the current edge, set the row and column iterators to the 
        // value of the edge visibility(1 or -1) and set the visibility to true
        let [row_iter, col_iter] = [0, 0];
        if (key === 'left' || key === 'right')
            row_iter = value;
        else if (key === 'up' || key === 'down')
            col_iter = value;

        // Check the visibility of the tree in the direction of the edge.
        // If the tree is visible from the edge, return true
        if (crawl_direction(row_iter, col_iter, [row, col]))
            return true;
    }
    return false;
}


// fn crawl_direction(row_iter, col_iter, [row, col]): bool ---------------------------------------
//
// # Description
// The function iterates through the grid in the direction specified by the row_iter and col_iter
// parameters. If the tree is visible from the edge, the function returns true. Otherwise, it returns
// false.
//
// # Returns
// Boolean to indicate whether the tree is visible from the edge or not
//
// # Parameters
// row_iter: int - The row iterator to use when iterating through the grid
// col_iter: int - The column iterator to use when iterating through the grid
// [row, col]: Array - The coordinates of the tree to check
function crawl_direction(row_iter, col_iter, [row, col]) {
    // Grab the value of the current tree
    let curr = grid[row][col];

    // Iterate through the grid in the direction specified by the row_iter and col_iter parameters
    while (true) {
        // Increment the row and column iterators with iteration step size and direction specified
        // by the row_iter and col_iter parameters
        row += row_iter, col += col_iter;

        // If the tree we are checking against is out of bounds, break out of the loop
        if (!within_bounds(row, col)) break;

        // If the tree we are checking against is larger than the current tree, return false
        if (grid[row][col] >= curr) return false;
    }
    return true;
}


// fn check_border([row, col]): Map ---------------------------------------------------------------
//
// # Description
// The function checks the visibility of the tree at the coordinates specified by the [row, col]
// parameter against the trees on the edges of the grid. It returns a map of the potential 
// visibility of the tree from each edge.
function check_border([row, col]) {
    // Create a map with the directions in the grid as keys and the visibility of the tree against
    // the trees on the edges of the grid as values
    // 0 = not visible,
    // -1 or 1 = direction to iterate through the grid to check the visibility of the tree later
    let results = new Map([['left', 0],['right', 0],['up', 0],['down', 0]]);
    let curr = grid[row][col];

    // Iterate through the bounds map and check the visibility of the tree against the trees on the
    // edges of the grid.
    for (let [key, [min,max]] of bounds) {
        if (key === 'col') {
            if (grid[row][min] < curr) results.set('up', -1);
            if (grid[row][max] < curr) results.set('down', 1);
        } else if (key === 'row') {
            if (grid[min][col] < curr) results.set('left', -1);
            if (grid[max][col] < curr) results.set('right', 1);
        }
    }
    return results;
}


// fn within_bounds(row, col): bool ---------------------------------------------------------------
//
// # Description
// The function checks whether the coordinates specified by the row and col parameters are within
// the bounds of the grid.
// 
// # Returns
// Boolean to indicate whether the coordinates are within the bounds of the grid or not
//
// # Parameters
// row: int - The row coordinate to check
// col: int - The column coordinate to check
function within_bounds(row, col) {
    if (row > bounds.get('row')[0] && row < bounds.get('row')[1] && 
        col > bounds.get('col')[0] && col < bounds.get('col')[1])
        return true;
    return false;
}


// fn outside_bounds(row, col): bool --------------------------------------------------------------
// 
// # Description
// The function checks whether the coordinates specified by the row and col parameters are outside
// the bounds of the grid.
//
// # Returns
// Boolean to indicate whether the coordinates are outside the bounds of the grid or not
//
// # Parameters
// row: int - The row coordinate to check
// col: int - The column coordinate to check
function outside_bounds(row, col) {
    if (row < bounds.get('row')[0] || row > bounds.get('row')[1] || 
        col < bounds.get('col')[0] || col > bounds.get('col')[1])
        return true;
    return false;
}
