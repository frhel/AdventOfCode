const fs = require('fs');
// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline character
const input = fs.readFileSync('../data', 'utf8').split('\n');

// ------------------------------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/3
// ------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------
// Map characters to their priority value and save the result to a new Map instance.
let priorityMap = new Map(generatePriorityMapFromCharCodes());

// ---------------------------------------------------------------------------------------------
// Part 1 answer output
console.log(solve_part_1());

// ---------------------------------------------------------------------------------------------
// Part 2 answer output
console.log(solve_part_2());

// ---------------------------------------------------------------------------------------------
// fn: Solve part 1
function solve_part_1() {
    let solution = 0;
    for (let i = 0; i < input.length; i++) {
        // Split the string in two halves
        let [left, right] = splitStringInHalf(input[i]);

        // Find the common item in the two halves
        let commonItem = findCommonItem(left, right);

        // Add the priority value of the common item to the total
        solution += priorityMap.get(commonItem.values().next().value);
    }
    return solution;
}

// ---------------------------------------------------------------------------------------------
// fn: Solve part 2
function solve_part_2() {
    let solution = 0;
    while (input.length > 0) {
        // Pop the last 3 items off the input array and find the common item
        let badge = findBadge([input.pop(), input.pop(), input.pop()]);

        // Add the priority value of the common item to the total answer
        solution += priorityMap.get(badge);
    }
    return solution;
}


// ---------------------------------------------------------------------------------------------
// fn: Go through multiple strings and find the common item
function findBadge(sacks) {
    // Sets have a quicker lookup time than arrays but slower insertion time
    let set = new Set(sacks.pop());

    while (sacks.length > 0) {
        // Loop through all the sacks and find the common item, reducing the
        // set each time to only contain the common items
        set = findCommonItem(set, [...sacks.pop()]);
    }

    // The common item will be the only item in the set so we can just return the first value from the set
    return set.values().next().value;
}

// ---------------------------------------------------------------------------------------------
// fn: Compare an array of string to a set of characters and return a set of the common items
function findCommonItem(left, right) {
    let set = new Set(left);
    let returnSet = new Set();

    while(right.length > 0) {
        // pop the last item off the right array and check if it's in the set
        // if it is, add it to the return set
        let char = right.pop();
        if (set.has(char)) returnSet.add(char, 1);
    }

    return returnSet;
}

// ---------------------------------------------------------------------------------------------
// fn: Split a string in two halves and return them as an array of arrays
function splitStringInHalf(str) {
    let half = Math.floor(str.length / 2);
    return [[...str.slice(0, half)], [...str.slice(half)]];
}

// ---------------------------------------------------------------------------------------------
// fn: Generate a map where the keys are the ASCII characters a-z and A-Z with score values
//     from 1 to 52. The map is returned as an array of arrays that we can feed into the Map
//     constructor directly.
function generatePriorityMapFromCharCodes() {
    let arrOut = [['', 0]];
    count = 1;

    // Loop through the ASCII codes for a-z and A-Z and add them to the map
    // using a running counter as the priority value
    for (i = 97; i <= 122; i++) arrOut.push([String.fromCharCode(i), count++]);
    for (i = 65; i <= 90; i++) arrOut.push([String.fromCharCode(i), count++]) ;

    return arrOut;
}