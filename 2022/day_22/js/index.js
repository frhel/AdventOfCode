// ----------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/22
// Solution by: https://github.com/frhel (Fry)
// ----------------------------------------------------------------------------

// -------------------------------- Imports -----------------------------------
const fs = require('fs');

// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline
// character
const file_data = '../data';
const _input = fs.readFileSync(file_data, 'utf-8')
   .replace(/\r/g, "").trim().split('\n');

// ------------------------------ Setup ---------------------------------------
const input = parse_input(_input);


// ----------------------------- Helper functions ----------------------------
// Parse the input data into a more convenient format
function parse_input(input) {
   let output = [];
   
   return output;
}