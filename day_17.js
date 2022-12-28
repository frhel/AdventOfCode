// ----------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/17
// Solution by: https://github.com/frhel (Fry)
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// -------------------------------- Imports -----------------------------------
// ----------------------------------------------------------------------------
const fs = require('fs');
// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline
// character.
const file_data = './data/day_17';
const file_ex = './data/example';
const input = fs.readFileSync(file_ex, 'utf-8')
    .replace(/\r/g, "").trim().split('\n');

// ----------------------------------------------------------------------------
// --------------------------------- Setup ------------------------------------
// ----------------------------------------------------------------------------
let shapes = [
    [
        [1,1,1,1],
    ],
    [
        [0,1,0],
        [1,1,1],
        [0,1,0],
    ],
    [
        [0,0,1],
        [0,0,1],
        [1,1,1],
    ],
    [
        [1],
        [1],
        [1],
        [1],
    ],
    [
        [1,1],
        [1,1],
    ]
]


// ----------------------------------------------------------------------------
// ------------------------------- Solution -----------------------------------
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// -------------------------------- Part 1 ------------------------------------
let max_rocks = 2022;
let tower_height = build_tower(input, shapes, max_rocks);

// ----------------------------------------------------------------------------
// -------------------------------- Part 2 ------------------------------------



// ----------------------------------------------------------------------------
// ------------------------------ Functions -----------------------------------
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
function build_tower(input, shapes, max_rocks) {
    let chamber_width = 7;
    let entry_v_dist = 3;
    let entry_h_dist = 2;

    let tower_line_base = Array(chamber_width).fill(0);
    let tower = [Array(chamber_width).fill(1)];
    draw_tower(tower);
    let rocks = 0;
    max_rocks = 0
    while (rocks <= max_rocks) {
        let shape = shapes.shift().reverse();
        shapes.push(shape);

        // Scaffold the new rock entry by adding the vertical distance of 3
        // lines, plus the height of the new shape
        for (let i = 0; i < entry_v_dist + shape.length; i++) {
            tower.push(tower_line_base.slice());
        }

        // // Draw the new shape's starting position
        // for (let i = 0; i < shape.length; i++) {
        //     let line = tower[tower.length - 1 - i];
        //     for (let j = 0; j < shape[i].length; j++) {
        //         line[entry_h_dist + j] = shape[i][j];
        //     }
        // }

        // Save the shape's anchor point within the tower [x, y]
        let shape_anchor = [entry_h_dist, (tower.length - shape.length)];
        console.log(shape_anchor[1])

        while (true) {
            let next_instruction = input.shift();
            input.push(next_instruction);
            // Move the shape horizontally according to the rules
            if (next_instruction === '>') {
                let valid = check_valid_move(tower, shape, shape_anchor, 'right');

            } else if (next_instruction === '<') {
                // Move left if possible
            }


            // Move the shape vertically by 1 if possible

            break;
        }

        draw_tower(tower, shape, shape_anchor);
        rocks++
    }
}

function check_valid_move(tower, shape, anchor, direction) {
    // Shift the shape to the left or right by 1

}


// ----------------------------------------------------------------------------
// ------------------------------- Utilities ----------------------------------
// ----------------------------------------------------------------------------
function draw_tower(arr, shape, anchor) {
    console.log(anchor[1])
    console.log('---------------------');
    let tower = arr.slice();
    for (let i = tower.length - 1; i >= 0; i--) {
    }
    console.log('=====================');
}

// ----------------------------------------------------------------------------


// ----------------------------------------------------------------------------
// --------------------------- Setup Functions --------------------------------
// ----------------------------------------------------------------------------
