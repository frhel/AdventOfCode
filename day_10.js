// -----------------------------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/10
// Solution by: https://github.com/frhel (Fry)
// -----------------------------------------------------------------------------------------------

// ---------------------------------------Imports-------------------------------------------------
const fs = require('fs');
// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline character
const input = fs.readFileSync('./data/day_10', 'utf8').split('\r\n');


// ---------------------------------------Constants-----------------------------------------------
// Parse the input commands into cycles instructions. Each node in the array is one instruction.
const cycle_instructions = parse_input_into_cycle_instructions(input);

// Define cycles for checking signal strength and generating pixel data.
const cycle_check_points = new Map([['start', 20], ['step', 40], ['end', 220]]);

// ---------------------------------------Solution------------------------------------------------
// ----------------------------------------Part 1-------------------------------------------------
// The last parameter of the execute_program function determines what the function returns.
let part_1_answer = execute_program(cycle_instructions, cycle_check_points, 'signal strength');
console.log(`Part 1 answer: ${part_1_answer}`)

// ----------------------------------------Part 2-------------------------------------------------
// The last parameter of the execute_program function determines what the function returns.
let part_2_answer = execute_program(cycle_instructions, cycle_check_points, 'pixel data');
console.log(`Part 2 answer: \r\n${part_2_answer}`)


// ---------------------------------------Functions-----------------------------------------------

// -----------------------------------------------------------------------------------------------
// Execute the program by iterating over the cycles list and executing the commands in succession.
function execute_program(cycle_instructions, cycle_check_points, output_type) {
    // x_reg_val starts at 1 as per the problem description.
    // signal_strength_list is a list of the signal strength at each cycle.
    // CRT_pixelmap is a 2D array of pixels that will be drawn to the screen.
    let [cycle_count, x_reg_val, signal_strength_list, CRT_pixelmap] = [0, 1, [], [[]]];
    let next_cycle_checkpoint = cycle_check_points.get('start');

    for (let cycle of cycle_instructions) {
        let [command_name, command_value] = cycle;
        cycle_count++; // We could start at 1 and increment at the end of the loop too..

        // Each cycle we draw 1 more pixel to the screen.
        CRT_pixelmap = draw_pixel(CRT_pixelmap, cycle_count, x_reg_val, cycle_check_points.get('step'));
        
        // Need to check if we are at a cycle checkpoint before we execute the command for current cycle.
        if (cycle_count === next_cycle_checkpoint && cycle_count <= cycle_check_points.get('end')) {
            signal_strength_list.push(cycle_count * x_reg_val);
            next_cycle_checkpoint += cycle_check_points.get('step');
        }

        if (command_name === 'addx')
            x_reg_val = x_reg_val + command_value;
    }

    let return_string = ''; // Both returns are strings so we can use the same variable.
    if (output_type === 'signal strength')
        // Sum all the signal strengths in the list to the return string.
        return_string = signal_strength_list.reduce((a, b) => a + b, 0);
    else if (output_type === 'pixel data')
        // Convert the pixel map to a line separated string to make it easier to read.
        return_string = CRT_pixelmap.map((line) => line.join('')).join('\r\n');
    
    return return_string; // Returns whichever string we have built up.
}

// -----------------------------------------------------------------------------------------------
// Draws one pixel to the screen. Each pixel is drawn in succession from left to right.
// until the end of the line is reached. Then the next line is drawn - represented by
// a new 0-indexed array in the CRT_pixelmap array.
function draw_pixel(CRT_pixelmap, cycle_count, x_reg_val, CRT_line_length) {   
    // Need to subtract 1 from the cycle count as the pixel_nr starts at 0, not 1 like the cycle count.
    let [sprite, pixel_nr] = [x_reg_val, cycle_count % CRT_line_length - 1];
    
    // If the sprite overlaps the pixel, draw a #, otherwise draw a .
    if (sprite === pixel_nr || sprite === pixel_nr - 1 || sprite === pixel_nr + 1)
        CRT_pixelmap.at(-1).push('#')
    else
        CRT_pixelmap.at(-1).push('.');

    // We check if we have reached the end of the line after adding the pixel so we
    // are utilising the full line length before starting a new line.
    if (cycle_count % CRT_line_length === 0)
        CRT_pixelmap.push([])

    return CRT_pixelmap;
}

// -----------------------------------------------------------------------------------------------


// ----------------------------------------Helpers------------------------------------------------
// Convert the commands into a list of cycles. Each node in the array is one instruction.
function parse_input_into_cycle_instructions(input) {
    let commands = input.map((line) => line.split(' '))
    let translated = [];
    for (let command of commands) {
        if (command[0] === 'addx')
            // Because addx covers 2 cycles, we need to add an extra node to the list
            // and 0 out the value for the first cycle.
            translated.push(['addx', 0]);
        translated.push([command[0], parseInt(command[1])]);
    }
    return translated;
}