const fs = require('fs');
// Read in the contents of the data file and store it as a string
let input = fs.readFileSync('./data/day_6', 'utf8')

// ---------------------------------------------------------------------------------------------
// Part 1 solution
let part1_marker_length = 4;
console.log(`Part 1, start of packet: ${findInputMarker(input, part1_marker_length)}`);

// ---------------------------------------------------------------------------------------------
// Part 2 solution
let part2_marker_length = 14;
console.log(`Part 2, start of message: ${findInputMarker(input, part2_marker_length)}`);

// ---------------------------------------------------------------------------------------------
// fn: findInputMarker() - find the input marker of a given length
function findInputMarker(input, marker_length) {
    // Use a set to track unique characters in the input.
    let hash = new Set();
    // Iterator to track the current position in the input string
    let i = 0;

    // Loop until the set contains the marker length or we reach the end of the input string
    while (hash.size < marker_length && i < input.length) {
        // Call purgeNonContiguousValuesFromSet(); to remove characters from the set based on the
        // current character in the input string.  This will ensure that the set only contains
        // unique, contiguous characters. Then confidently add the current character to the returned
        // set because we know for sure that it is unique and contiguous with the rest of the set.
        hash = purgeNonContiguousValuesFromSet(hash, input[i])
            .add(input[i]);     
        i++;
    }
    
    // Return the index of the first character after the marker. We get this by always incrementing
    // the iterator at the end of the loop, after the marker has been found.
    return i;
}

// ---------------------------------------------------------------------------------------------
// fn: purgeNonContiguousValuesFromSet() - remove non-contiguous values from the beginning of a set 
//     based on the presence of a given value in the set
function purgeNonContiguousValuesFromSet(hash, value) {
    // Iterate over the set and remove any values up to the existing instance of the current value to
    // ensure that the set only contains unique, contiguous characters.
    for (let char of hash) {
        // As soon as the current value is no longer in the set, we can stop deleting values and
        // break the loop.
        if (!hash.has(value)) break;

        // Remove the currently iterated character from the set if the input value still exists
        hash.delete(char);
    }
    return hash;
}