const fs = require('fs');
// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline character
const input = fs.readFileSync('../data', 'utf8').split('\n');

// ------------------------------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/1
// ------------------------------------------------------------------------------------------------

// Map elves with their calorie sums
let elfSums = generateElfCalorieSums(input);

// ---------------------------------------------------------------------------------------------
// The answer to part 1
console.log(`The answer to part 1 is: ${solve(elfSums, 1)}`);

// ---------------------------------------------------------------------------------------------
// The answer to part 2
console.log(`The answer to part 2 is: ${solve(elfSums, 3)}`);

// ---------------------------------------------------------------------------------------------
// fn: Solve challenge with variable number of elves
function solve(sumsMap, numberOfElves) {
    // Sort the elves by their calorie sums in descending order
    let relevantElves = [...sumsMap.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, numberOfElves) // Return only the specified number of elves

    // Sum the calories of the relevant elves and return the result
    return relevantElves.reduce((a, b) => a + b[1], 0);
}

// ---------------------------------------------------------------------------------------------
// fn: Generate a map of calorie sums for each elf
function generateElfCalorieSums(input) {
    let elfSums = new Map();
    // Number the elves and map them to their Calorie sums
    let currElf = 1;

    // Iterate through the input data and sum the calories for each elf
    for (let i = 0; i < input.length; i++) {
        // If the input is an empty string, this marks the end of the current elf's data
        // so increment the elf number and move on to the next elf
        if (input[i] === '') currElf++

        // If the elf is not in the map, add them and set their calorie sum to the current input
        // Otherwise, add the current input to the elf's calorie sum
        else elfSums.set(currElf, elfSums.get(currElf) + Number(input[i]) || Number(input[i]));
    }
    return elfSums;
}