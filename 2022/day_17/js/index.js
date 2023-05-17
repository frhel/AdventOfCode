// ----------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/17
// Solution by: https://github.com/frhel (Fry)
// ----------------------------------------------------------------------------

// -------------------------------- Imports -----------------------------------
const fs = require('fs');

// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline
// character
const file_data = '../data';
const file_ex = './data/example'; // Keeping the example data in a separate file
const input = fs.readFileSync(file_data, 'utf-8')
    .replace(/\r/g, "").trim().split('');

// ----------------------------------------------------------------------------
// Setup the rocks array
const _rocks = [
    [
        ['@', '@', '@', '@']
    ],
    [
        ['', '@', ''], 
        ['@', '@', '@'], 
        ['', '@', '']
    ],    
    [
        ['@', '@', '@'], 
        ['', '', '@'], 
        ['', '', '@']
    ],
    [
        ['@'],
        ['@'],
        ['@'],
        ['@']
    ],
    [
        ['@', '@'], 
        ['@', '@']
    ]
]

// Cause it's easy to just plus 1 or -1 to increment / decrement
// appropriately
const _dirs = {
    left: -1,
    right: 1
}

// Just some basic info about the grid
let _grid = {
    width: 7,
    spawn_left: 2,
    spawn_top: 3,
}

// Global tracking variables
let _move = -1;
let _rock_counter = -1;
let _total_rock_count = 0;
let _across = new Map();

console.time('Total time');
// ----------------------------------------------------------------------------
// Part 1 - 3055
console.time('Part 1');
let rock_count = 2022;
let result_1 = move_rocks(rock_count);
console.log(`Part 1: ${result_1.length - 1}`);
console.timeEnd('Part 1');

// ----------------------------------------------------------------------------
// Part 2
rock_count = 1000000000000;
console.time('Part 2');
let result_2 = find_cycle(rock_count);
console.log(`Part 2: ${result_2}`);
console.timeEnd('Part 2');

console.timeEnd('Total time');


// ----------------------------------------------------------------------------
// Move the rocks
function move_rocks(rounds, cycle_tracker = false, chamber_seed = null) {
    let chamber = [];
    if (chamber_seed === null) {
        // Initialize the chamber and tracking variables
        chamber = [new Array(_grid.width).fill('#')];
        _move = -1;
        _rock_counter = -1;
        _total_rock_count = 0;
    } else {
        chamber = chamber_seed;
    }
    let i = 1;
    while (i <= rounds) {
        // Track the number of rocks that have fallen so we can 
        // cycle back to the first rock when we finish the last one
        if (_rock_counter == _rocks.length-1) _rock_counter = -1;
        let next_rock = _rocks[++_rock_counter];
        
        // Save the chamber so we can send it back to the let_rock_fall function
        // to receive more rocks
        chamber = let_rock_fall(chamber, next_rock, cycle_tracker);
        i++;
    }

    return chamber
}

// ----------------------------------------------------------------------------
// Find cycle
function find_cycle(rounds) {
    _move = -1;    
    _rock_counter = -1;
    _total_rock_count = 0;
    _across = new Map();
    let cycle_peek_rounds = 5000;
    // Peek the first 5000 rocks to find a pattern
    // with the cycle_tracker switch on
    move_rocks(cycle_peek_rounds, true);

    // grab the 1st pattern for comparison
    let pattern = [..._across][1];
    
    // Go through _across map and find all the matching patterns
    // and store the n of rocks and n of chamber height in the
    // cycles array along with the difference between the two
    // at each cycle
    let cycles = [[pattern[1][2], pattern[1][1], 0, 0]];
    for ([key, value] of _across) {
        if (value[0] === pattern[1][0] && key !== pattern[0]) {
            if (cycles.length < 2) {
                cycles.push([value[2], value[1], value[2] - pattern[1][2], value[1] - pattern[1][1]]);
            } else if (value[1] - cycles.at(-1)[1] === cycles.at(-1)[3]) {
                cycles.push([value[2], value[1], value[2] - cycles.at(-1)[0], value[1] - cycles.at(-1)[1]]);
            }
        }
    }

    // Now we have the cycles, we can calculate the height of the chamber
    // We start by emulating the first cycle and storing the chamber
    let simulate_cycle = Number(cycles[1][1]);
    let chamber_seed = move_rocks(simulate_cycle);
    
    // Now we can calculate the height of the chamber
    // First we calculate how many full cycles we can fit in
    let cycle_rounds = Math.floor((rounds - cycles[0][1]) / cycles[1][3]);//~~(rounds / cycles[1][3]);
    // Then we calculate how many rocks are left over
    let rounds_left = (rounds - cycles[0][1]) % cycles[1][3];//rounds % cycles[1][3];

    // Now we can multiply the number of full cycles by the height of the cycle
    let chamber_height = Number(cycles[1][2]) * cycle_rounds;
    
    // Now we simulate the remaining rocks falling into the chamber
    remaining_chamber = move_rocks(rounds_left, false, chamber_seed);

    // And add the height of the remaining chamber, minus the first cycle height
    // and re-adding the height up to the first cycle starting point.
    chamber_height += remaining_chamber.length - cycles[1][0] + cycles[0][0]  - 1;

    // Return the answer
    return chamber_height;
}

// ----------------------------------------------------------------------------
// Let a rock fall
function let_rock_fall(chamber, rock, cycle_tracker = false) {
    _total_rock_count++;
    // Initialize the next segment of the chamber according to the rock size
    for (let i = 0; i < _grid.spawn_top + rock.length; i++) {
        chamber.push(new Array(_grid.width).fill('.'));
    }

    // Now we have a chamber that's big enough to hold the rock
    // so we can start dropping it
    let falling = true;
    
    // Save the rock's starting x and y anchor coordinates (lower left corner)
    let rock_anchor = {x: _grid.spawn_left, y: chamber.length - rock.length};
    while (falling) {
        // Grab the next move from the input and reset the move counter
        // if we've reached the end of the input
        _move = ++_move;
        if (_move >= input.length) _move = 0;

        // Decide which direction the rock is moving
        let dir = input[_move] === '<' ? _dirs.left : _dirs.right;  

        // Start by incrementing or decrementing the rock's x anchor
        let next_x = rock_anchor.x + dir;
        // We have to track if the rock is hitting something on the x-axis
        let x_hit = false;
        
        // Start by checking if the rock is hitting the left or right wall
        if (next_x < 0 || next_x + rock[0].length > _grid.width) x_hit = true;

        // Check if the rock is hitting something on the x-axis if it hasn't
        // already hit the wall
        if (x_hit === false) {
            for (let i = 0; i < rock.length; i++) {
                for (let j = 0; j < rock[i].length; j++) {
                    if (rock[i][j] === '@' &&
                        chamber[rock_anchor.y + i][next_x + j] === '#') {
                            x_hit = true;
                            break;
                    }
                }
                if (x_hit === true) break;
            }
        }
        // Actually update the rock's x anchor if it hasn't hit anything
        if (x_hit === false) rock_anchor.x = next_x;

        // Check if we can move the rock down without hitting another rock
        // or the bottom of the chamber after dealing with the x-axis
        for (let i = 0; i < rock.length; i++) {
            for (let j = 0; j < rock[i].length; j++) {
                if (rock[i][j] === '@' && 
                    chamber[rock_anchor.y + i - 1][rock_anchor.x + j] === '#') {
                    falling = false;
                    break;
                }
            }
            if (falling === false) break;
        }

        // If the rock is not allowed to fall any further, we're done
        if (falling === false) break;
        
        // Otherwise, we can move the rock down
        rock_anchor.y--;

        // remove the top row of the chamber
        let pop = true;
        for (let i = 0; i < _grid.width; i++) {
            // Just go through the top line and see if it contains a rock
            if (chamber[chamber.length - 1][i] === '#') {
                pop = false;
                break;
            }
        }
        if (pop === true) chamber.pop();
    }   
    
    // Bake the rock into the chamber at its final resting place, flipping the '@' to '#'
    // And keeping the existing '.' and '#' as is
    for (let i = 0; i < rock.length; i++) {
        for (let j = 0; j < rock[i].length; j++) {
            chamber[rock_anchor.y + i][rock_anchor.x + j] = rock[i][j] === '@' 
                ? '#' : chamber[rock_anchor.y + i][rock_anchor.x + j];
        }
    }

    // Log any repeating patterns when the cycle_tracking is enabled
    // We're using a line with 6 #'s in a row as the seed pattern
    // and going back 2 lines and forward 2 lines, combining those 5
    // lines into a string and using that as the key to unlock the pattern
    if (cycle_tracker === true) {
        let across = false;
        let row = chamber.length - 1;
        for (let i = chamber.length - 1; i > 0; i--) {
            let unbroken = true;
            // Check if the line is unbroken except for the first character
            for (let j = 1; j < _grid.width; j++) {
                if (chamber[i][j] === '.') {
                    unbroken = false;
                    break;
                }
            }
            if (unbroken === true) {
                row = i;
                across = true;
                break;
            }

        }

        // If we found a line with 6 #'s in a row, we can combine it with
        // the 2 lines above and below it to form the pattern to track.
        if (across === true) {
            let pattern = [chamber[row - 2], chamber[row - 1], chamber[row], chamber[row + 1], chamber[row + 2]].join('');
            _across.set(''+row, [pattern, _total_rock_count, chamber.length - 1]);
        }
    }
    
    return chamber;
}    
