// -----------------------------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/9
// Solution by: https://github.com/frhel (Fry)
// -----------------------------------------------------------------------------------------------

// ---------------------------------------Imports-------------------------------------------------
const { time } = require('console');
const fs = require('fs');
const { PassThrough } = require('stream');
// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline character
const input = fs.readFileSync('./data/day_9', 'utf8').split('\r\n');


// ---------------------------------------Constants-----------------------------------------------
// Map the directions to their corresponding coordinate increments (x, y) for easier parsing
// of the input data
const MOVE_DIR = new Map([['L', [0, -1]],['R', [0, 1]],['U', [1, 0]],['D', [-1, 0]]]);

// Split each move into a direction and a distance and translate them into an array of
// coordinates (x, y) for easy recursive tracking of link positions for larger chains
// ex: ['R', 3] -> [[0, 1], [0, 2], [0, 3]]
const MOVES = translate_input_moves(input.map((move) => move.split(' ')));


// ---------------------------------------Solution------------------------------------------------
// ----------------------------------------Part 1-------------------------------------------------
let part_1_tail_moves = log_tail_moves(2);
// Convert the tail moves array into a Set of strings to remove duplicates
let part_1_unique_tail_moves = new Set(part_1_tail_moves.map((move) => move.join(',')));
console.log(`Part 1 Solution: ${part_1_unique_tail_moves.size}`); // 6376

// ----------------------------------------Part 2-------------------------------------------------
let part_2_tail_moves = log_tail_moves(10);
// Convert the tail moves array into a Set of strings to remove duplicates
let part_2_unique_tail_moves = new Set(part_2_tail_moves.map((move) => move.join(',')));
console.log(`Part 2 Solution: ${part_2_unique_tail_moves.size}`); // 2607


// ---------------------------------------Functions-----------------------------------------------

// -----------------------------------------------------------------------------------------------
// Recursively calculate the link positions for a chain of the given size.
function log_tail_moves(chain_size, instructions = MOVES) {
    if (chain_size < 2) throw new Error('Chain size must be greater than 1');
    let link_pos_history = [instructions[0]]; // All links start at the head position

    // for each move of the current head, update and log the next link's position in relation
    // to the new head position
    for (let move of instructions)
        link_pos_history = move_link(link_pos_history, move);

    // If the chain size is greater than 2, use the the last link as the new head and recursively
    // calculate the position of the next link in the chain until we reach the tail of the 
    // chain (chain_size = 2)
    if (chain_size > 2) 
        link_pos_history = log_tail_moves(chain_size - 1, link_pos_history);

    return link_pos_history;
} 

// -----------------------------------------------------------------------------------------------
// Move the current link to the next position in relation to the head and log the new position
// to the link_pos_history array.
function move_link(link_pos_history, move) {
    let [hx, hy] = move; // The current head position (the last move in the instructions)
    let [lx, ly] = link_pos_history.at(-1); // The last known position of the link

    // Return early if the link is already 1 unit away from the head in any direction
    if (Math.abs(hx - lx) <= 1 && Math.abs(hy - ly) <= 1) 
        return link_pos_history;

    // If the link is more than 1 unit in any direction away from the head, move it 1 unit
    // in the direction of the head(2 units if the link is diagonal from where it needs to move)
    if (hx !== lx) lx += (hx > lx) ? 1 : -1;
    if (hy !== ly) ly += (hy > ly) ? 1 : -1;

    return link_pos_history.push([lx, ly]), link_pos_history;
}


// -----------------------------------------------------------------------------------------------
// Translate the moves into a map of coordinates. Doing this beforehand makes it easier to
// write a recursive function to calculate the link positions as we can just pass the link
// positions back into the function to calculate the next link positions
// ex: ['R', 3] -> [[0, 1], [0, 2], [0, 3]]
// ex: ['U', 2] -> [[1, 0], [2, 0]]
function translate_input_moves(moves) {
    let translated_moves = [[0, 0]]; // Head starting position
    for (let move of moves) {
        let [dir, dist] = move;
        // Get the x and y increments for the given direction
        let [x, y] = MOVE_DIR.get(dir);
        for (let i = 0; i < dist; i++)
            // Add the next coordinate to the list of moves by incrementing the previous coordinate
            // by 1 in the direction of the move
            translated_moves.push([translated_moves.at(-1)[0] + x, translated_moves.at(-1)[1] + y]);
    }
    return translated_moves;
}