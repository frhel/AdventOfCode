// ----------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/20
// Solution by: https://github.com/frhel (Fry)
// ----------------------------------------------------------------------------

// -------------------------------- Imports -----------------------------------
const fs = require('fs');

// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline
// character
const file_data = '../data';
let _input = fs.readFileSync(file_data, 'utf-8')
   .replace(/\r/g, "").trim().split('\n').map((x) => Number(x));

// ---------------------------- Solution -------------------------------------
const _size = _input.length;

const solution_start = performance.now();
// -------------------------------- Part 1 -----------------------------------
const part1_start = performance.now();
const part1_input = prep_input(_input.slice());
const part1_answer = find_answer(shuffle_arr(part1_input));
console.log(`Part 1 answer: ${part1_answer} in ${(performance.now() - part1_start).toFixed(2)}ms`);
// Answer: 14526

// -------------------------------- Part 2 -----------------------------------
const part2_start = performance.now();
const decryption_key = 811589153;
const no_of_shuffles = 10;
const part2_input = prep_input(_input.slice(), decryption_key);
const part2_answer = find_answer(shuffle_arr(part2_input, no_of_shuffles));
console.log(`Part 2 answer: ${part2_answer} in ${(performance.now() - part2_start).toFixed(2)}ms`);
// Answer: 9738258246847

console.log(`Solution completed in ${(performance.now() - solution_start).toFixed(2)}ms`);

// ------------------------------ Main logic ----------------------------------
// Shuffle the array according to the instructions in the input array
function shuffle_arr(input, no_of_shuffles = 1) {
    // Make a copy of the input array so that we don't mutate the original
    // array because we need it for reference to move the numbers around
    // in the right order
    let shuffled = input.slice();

    // Shuffle inside a loop for part to. Defaults to 1 for part 1
    while (no_of_shuffles > 0) {
        for (let i = 0; i < _size; i++) {
            let [index, instruction] = input[i];

            // find the index of the sub-array in shuffled with the same index as the current
            // instruction
            const index_of_instruction = shuffled.findIndex((element) => element[0] === index);
            
            // Instead of actually moving the number billions of times, we can just
            // calculate the final index of the number by taking the modulus of the
            // size of the array. This is because the array is circular. But we need
            // to make sure that we account for the fact that the number we are moving
            // doesn't count as a step and therefore we need to subtract 1 from array size
            // before taking the modulus.
            instruction = (instruction % (_size -1))            
            
            // Find the new index with some simple arithmetic
            let new_index = index_of_instruction + instruction;
            new_index = new_index;
            if (new_index >= _size) {
                // Since the first and last index are effectively the same, we need to
                // add 1 to the new index if we are _ON_ the last index or outside of upper
                // bounds
                new_index = new_index - _size + 1;
            } else if (new_index <= 0) {
                // Same as above, but we need to subtract 1 from the new index if we are
                // _ON_ the first index or out of lower bounds               
                new_index = _size + new_index - 1;
            }

            // Lift item from array
            let [removed] = shuffled.splice(index_of_instruction, 1);
            // Splice it back in at the new index
            shuffled.splice(new_index, 0, removed);
        }
        no_of_shuffles--;
    }
    return shuffled;
}

// Multiply the numbers in the array at index 1000, 2000 and 3000 after the
// index of the number 0, wrapping around if necessary. Modulus to wrap around.
function find_answer(arr) {
    let index_of_0 = arr.findIndex((element) => element[1] === 0);
    return arr[(index_of_0 + 1000) % _size][1] 
        + arr[(index_of_0 + 2000) % _size][1] 
        + arr[(index_of_0 + 3000) % _size][1];
}

// ----------------------------- Helper functions ----------------------------
// Create an array of sub-arrays where each sub-array contains the original
// index of the number in the input array and the number itself multiplied by
// the decryption key (Default to 1 for part 1)
function prep_input(input, decryption_key = 1) {
    let acc = [];
    for (let i = 0; i < _size; i++) {
        acc.push([i, input[i]*decryption_key]);
    }
    return acc;
}