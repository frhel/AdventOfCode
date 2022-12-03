// Read in the contents of the data file
const fs = require('fs');
const input = fs.readFileSync('./data/day_3', 'utf8').split('\r\n');

// Generate a map of characters to their priority value
// for quick lookup
let priorityMap = new Map(generatePriorityMapFromCharCodes());

let part_1_answer = 0;
for (let i = 0; i < input.length; i++) {
    // Split the string in two halves
    let [left, right] = splitStringInHalf(input[i]);
    // Find the common item in the two halves
    let commonItem = findCommonItem(left, right);
    // Add the priority value of the common item to the total
    part_1_answer += priorityMap.get(commonItem.values().next().value);
}
// Part 1 answer output
console.log(part_1_answer);


let part_2_answer = 0;
while (input.length > 0) {
    // Pop the last 3 items off the input array and find the common item
    let badge = findBadge([input.pop(), input.pop(), input.pop()]);
    // Add the priority value of the common item to the total answer
    part_2_answer += priorityMap.get(badge);
}
// Part 2 answer output
console.log(part_2_answer);



// fn: Go through multiple strings and find the common item
function findBadge(sacks) {
    // Sets have a quicker lookup time than arrays
    let set = new Set(sacks.pop());
    while (sacks.length > 0) {
        // Loop through all the sacks and find the common item
        set = findCommonItem(set, [...sacks.pop()]);
    }
    // The common item is the only item in the set
    // so we can just return the first item
    return set.values().next().value;
}

// fn: Compare an array of string to a set of characters
//     and return a set of the common items
function findCommonItem(left, right) {
    let set = new Set(left);
    let returnSet = new Set();
    while(right.length > 0) {
        // pop the last item off the right array
        // and check if it's in the set
        // if it is, add it to the return set
        let char = right.pop();
        if (set.has(char)) returnSet.add(char, 1);
    }
    return returnSet;
}

// fn: Split a string in two halves and return them
//     as an array of arrays
function splitStringInHalf(str) {
    let half = Math.floor(str.length / 2);
    return [[...str.slice(0, half)], [...str.slice(half)]];
}

// fn: Generate a map of characters to their priority value according to
//     the instructions for the challenge
function generatePriorityMapFromCharCodes() {
    let arrOut = [['', 0]];
    count = 1;
    // Loop through the ASCII codes for a-z and A-Z and add them to the map
    // using a running counter as the priority value
    for (i = 97; i <= 122; i++) arrOut.push([String.fromCharCode(i), count++]);
    for (i = 65; i <= 90; i++) arrOut.push([String.fromCharCode(i), count++]) ;
    return arrOut;
}