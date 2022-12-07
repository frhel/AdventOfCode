const fs = require('fs');
// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline character
const input = fs.readFileSync('./data/day_4', 'utf8').split('\r\n');

// ------------------------------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/4
// ------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------
// Enter the main loop to solve both parts at the same time
let [part1, part2] = solveParts(input);

// --------------------------------------------------------------------------------------------
// Print the solution for Part 1 to the console
console.log(`The solution for Part 1 is: ${part1}`);

// --------------------------------------------------------------------------------------------
// Print the solution for Part 2 to the console
console.log(`The solution for Part 2 is: ${part2}`);

// --------------------------------------------------------------------------------------------
// fn: Iterate through the schedule pairs and determine if one is fully or partially
//     contained by the other. If either or both are, increment the appropriate
//     accumulators. This function solves both parts. We reduce the number of
//     iterations by only looping through the input once for both parts of the
//     problem.
function solveParts(schedule) {
    // Create a map to store the solution for both parts
    let solution = new Map([['part1', 0], ['part2', 0]]);

    for (let i = 0; i < schedule.length; i++) {
        // Convert the current schedule string into an array of number arrays
        let [left, right] = getNumberArraysFromScheduleString(schedule[i]);
        
        // Increment the accumulator for Part 1 if one schedule is
        // fully contained by the other.
        solution.set('part1', solution.get('part1') + setFullyContainsOtherSet(left, right));

        // Increment the accumulator for Part 2 if one schedule is
        // partially contained by the other.
        solution.set('part2', solution.get('part2') + setPartiallyContainsOtherSet(left, right));
        
        /* 
            ** We can use the function return values directly as iterator values
            because the return values are boolean(TRUE or FALSE) that become 
            implicitly converted to 0 or 1 when used as iterator values. 
        */
    }

    return [...solution.values()];
}

// --------------------------------------------------------------------------------------------
// fn: Check if one schedule is partially contained by the other
function setPartiallyContainsOtherSet(left, right) {
    // We only need to check if the lower bound of the either schedule
    // is contained within the bounds of the other schedule
    return (left[0] >= right[0] && left[0] <= right[1])
        || (right[0] >= left[0] && right[0] <= left[1]);
}

// --------------------------------------------------------------------------------------------
// fn: Check if one schedule is fully contained by the other
function setFullyContainsOtherSet(left, right) {
    // We need to check if both the lower and upper bounds of the either schedule
    // are contained within the bounds of the other schedule    
    return (left[0] >= right[0] && left[1] <= right[1])
        || (left[0] <= right[0] && left[1] >= right[1]);
}

// --------------------------------------------------------------------------------------------
// fn: Take a schedule string and convert it into an array of number arrays
function getNumberArraysFromScheduleString(schedule) {
    // Split the combined schedule string into two separate schedule strings
    let [left, right] = schedule.split(',');

    // Convert each schedule string into an array of numbers that represent
    // the lower and upper bounds of each schedule. Return the arrays as a tuple
    return [left.split('-').map(Number), right.split('-').map(Number)];
}