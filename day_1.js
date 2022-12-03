// Read in the contents of the data file
const fs = require('fs');
const input = fs.readFileSync('./data/day_1', 'utf8').split('\r\n');

// Number the elves and map them to their Calorie sums
let elfSums = new Map();
let currElf = 1;
// Iterate through the input data and sum the calories for each elf
for (let i = 0; i < input.length; i++) {
    if (input[i] === '') currElf++
    else elfSums.set(currElf, elfSums.get(currElf) + parseInt(input[i]) || parseInt(input[i]));
}

// Sort the elves by their calorie sums in descending order
elfSums = [...elfSums.entries()].sort((a, b) => b[1] - a[1]);

// The answer to part 1
console.log(elfSums[0][1]);

// Extract the first 3 elves
let top3Elves = elfSums.slice(0, 3);
// Sum the calories of the top 3 elves
let top3ElvesCalories = top3Elves.reduce((a, b) => a + b[1], 0);

// The answer to part 2
console.log(top3ElvesCalories);