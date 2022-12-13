// ----------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/13
// Solution by: https://github.com/frhel (Fry)
// ----------------------------------------------------------------------------

/*
    This is the messiest so far. It's late and I'm tired. This took way too long
    to solve and I really can't be bothered to clean it up.
    It works, but it's not pretty.
    At least I managed to get it working without looking at solutions.
    
    Yay.
*/

// -------------------------------- Imports -----------------------------------
const fs = require('fs');
// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline 
// character
const packets = fs.readFileSync('./data/day_13', 'utf8').split('\r\n');

// --------------------------------- Setup ------------------------------------

// ------------------------------- Solution -----------------------------------
// -------------------------------- Part 1 ------------------------------------
let part_1_indecies = process_packets(packets);
let part_1_answer = part_1_indecies.reduce((a, b) => a + b, 0);
console.log(`Part 1: ${part_1_answer}`);

// -------------------------------- Part 2 ------------------------------------



// ------------------------------ Functions -----------------------------------
// ----------------------------------------------------------------------------
function process_packets(packets) {
    const tuples = convert_pacekts_into_tuples(packets);
    const indecies = [];
    let count = 0;
    for (let tuple of tuples) {
        count++;
        // reverse the arrays here because we don't want to reverse the
        // order of the input arrays. Reversing them to get acccess
        // to pop() to treat them as stacks
        let [left, right] = [reverse_array(tuple[0]), reverse_array(tuple[1])];
       
        result = compare_packets(left, right);
        if (result) {
            indecies.push(count);
        }
    }
    return indecies;
}

function compare_packets(left, right) {
    while (left !== undefined && right !== undefined) {
        let [left_item, right_item] = [left.pop(), right.pop()];
        if (Array.isArray(left_item) && Array.isArray(right_item)) {
            if (array_contains_values(left_item) && array_contains_values(right_item)) {
                let result = compare_packets(left_item, right_item)
                if (!result) {
                    return false;
                }
            } else if (!array_contains_values(left_item) && !array_contains_values(right_item)) {
                if (count_empty_arrays(left_item) > count_empty_arrays(right_item)) {
                    return false;
                } else {
                    return true;
                }
            } else if (!array_contains_values(left_item) && array_contains_values(right_item)) {
                return true;
            } else {
                return false;
            }
        }
        else if (left_item === undefined && right_item === undefined) {
            return true;
        } else if (left_item === undefined && right_item !== undefined) {
            return true;
        } else if (left_item !== undefined && right_item === undefined) {
            return false
        } else if (Array.isArray(left_item) && !Array.isArray(right_item)) {
            result = compare_packets(left_item, [right]);
        } else if (!Array.isArray(left_item) && Array.isArray(right_item)) {
            result = compare_packets([left], right_item);
        }
        
        if (left_item > right_item) {
            return false;
        }
    }
    return true;        
}

// Recursively count the number of empty arrays in an array
function count_empty_arrays(array) {
    let count = 0;
    for (let item of array) {
        if (Array.isArray(item))
            count += count_empty_arrays(item);
        count++;
    }
    return count;
}

// Recursively check if array contains any values other than
// empty arrays
function array_contains_values(array) {
    for (let item of array) {
        if (Array.isArray(item)) {
            if (array_contains_values(item)) {
                return true;
            }
        } else {
            return true;
        }
    }
    return false;
}


// Recursively reverse array and all sub-arrays
function reverse_array(array) {
    if (array.length === 0) {
        return [];
    }
    array = array.reverse();
    for (let item of array) {
        if (Array.isArray(item)) {
            item = reverse_array(item);
        }
    }
    return array;
}


// --------------------------- Setup Functions --------------------------------
// ----------------------------------------------------------------------------
function convert_pacekts_into_tuples(input) {
    const tuples = [];
    let tuple = [];
    for (let line of input) {
        if (line !== '') {   
            tuple.push(line);
            continue;
        }              
        tuples.push(tuple.map(line => eval(line)));
        tuple = [];
    }
    tuples.push(tuple.map(line => eval(line)));
    return tuples
}