// ----------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/13
// Solution by: https://github.com/frhel (Fry)
// ----------------------------------------------------------------------------

// -------------------------------- Imports -----------------------------------
const fs = require('fs');
const _ = require('lodash');
// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline 
// character
const packets = fs.readFileSync('./data/day_13', 'utf8').split('\r\n');

// --------------------------------- Setup ------------------------------------
// Convert the input string into arrays using eval() and filter out any undefined
// values that result from the empty lines being eval'd
const eval_packets = packets
    .map(line => eval(line))
    .filter(line => line = line !== undefined);

let divider_packets = new Array([[2]], [[6]]);

// ------------------------------- Solution -----------------------------------
// -------------------------------- Part 1 ------------------------------------
// Ended up just getting lodash to make a deep copy of the array
// so I don't have to worry about the original array being modified
// for part 2
let correct_indices = process_packet_indices(_.cloneDeep(eval_packets));
let part_1_answer = correct_indices.reduce((a, b) => a + b, 0);
console.log(`Part 1: ${part_1_answer}`);

// -------------------------------- Part 2 ------------------------------------
let all_packets = _.cloneDeep(eval_packets).concat(divider_packets);
let organized_packets = sort_packets(all_packets);
let divider_indices_multiple = find_divider_indices(organized_packets, divider_packets);
console.log(`Part 2: ${divider_indices_multiple}`);


// ------------------------------ Functions -----------------------------------
// ----------------------------------------------------------------------------
// Take the sorted array of packets and find the indices of the divider packets
// No clue how to do this easily without stringifying the packets
function find_divider_indices(packets, divider_packets) {
    packets = packets.map(packet => JSON.stringify(packet));
    divider_packets = divider_packets.map(packet => JSON.stringify(packet));
    // First run through the packets and find the indices of the divider packets
    // and save their indices in an array. Then filter out any null values to
    // get only a list of the indices indices back.
    let indices = packets
        .map((packet, index) => (divider_packets.includes(packet)) ? index + 1 : null)
        .filter(item => item !== null);
    return indices.reduce((a, b) => a * b, 1); // Multiply together for answer
}

function sort_packets(all_packets) {
    // My compare function uses pop() to go through the packets, so I need to
    // reverse the sub_arrays. The cheeky .reverse() at the end reverses the
    // outside array back to the original order since reverse_array()
    // reverses everything in the array recursively
    all_packets = reverse_array(all_packets).reverse();
    all_packets.sort((a, b) => {
        // Use the compare_packets() function to compare the two packets
        // like in part 1. If the packets are equal. We only care about the
        // false return value, and everything else is implicitly true
        if (!compare_packets(a, b)) {
            return -1;
        }
    })
    // The packets are sorted on all levels in the array in reverse order
    // on purpose. So a recursive reverse will again put everything back
    // as it should be to grab the correct indices
    return reverse_array(all_packets);
}

function process_packet_indices(paired_packets) {
    // Convert into an array of tuples so we can iterate over them
    paired_packets = convert_packets_into_tuples(paired_packets);
    const indices = [];
    let count = 0; // Keep track of the index of the packet for the answer
    for (let pair of paired_packets) {
        count++;
        // reverse the arrays here because we don't want to reverse the
        // order of the input arrays. Reversing them to get acccess
        // to pop() to treat them as stacks
        let [left, right] = [reverse_array(pair[0]), reverse_array(pair[1])];
       
        result = compare_packets(left, right);
        if (result) {
            indices.push(count);
        }
    }
    return indices;
}

// This function took me quite a few hours and a lot of rewrites. I'm not
// happy, but it works.
function compare_packets(left, right) {
    // Starting off by just converting every single number in the current
    // array level into an array of length 1. This is so I don't have to
    // write conditions to convert the numbers into arrays later on
    left = left.map(item => item = (typeof(item) === 'number') ? [item] : item);
    right = right.map(item => item = (typeof(item) === 'number') ? [item] : item);

    // This is the main loop that will run until both arrays are empty... probably
    while (true) {
        // First check the array sizes and get that over with. If both arrays
        // contain literally anything, none of these conditions will be met
        if (left.length === 0 && right.length === 0) {
            return true
        } else if (left.length > 0 && right.length === 0) {
            return false
        } else if (left.length === 0 && right.length > 0) {
            return right
        }    

        // Since we know both arrays have at least one item, we can pop()
        // the last item off of each array and compare them
        let [left_item, right_item] = [left.pop(), right.pop()];

        // We know both items are arrays because we converted all numbers
        // into arrays of length 1 earlier. So we can just check the first
        // item in each array to see if they are numbers or not
        if (typeof(left_item[0]) === 'number' && typeof(right_item[0]) === 'number') {
            // This is the tricky part that messed me up for a while. It wasn't
            // until I realized that I needed to check the length of the arrays
            // Before I could compare the numbers that things clicked. If either of
            // the arrays have more than one item, we need to recursively call
            // compare_packets() to compare the sub-arrays.
            if (left_item.length > 1 || right_item.length > 1) {
                return compare_packets(left_item, right_item);
            // Otherwise just do the normal comparison and return the result
            } else if (left_item[0] > right_item[0]) {
                return false;
            } else if (left_item[0] < right_item[0]) {
                return true;
            }
        // Or if all else fails, just compare the sub-arrays by calling
        // compare_packets() recursively with the popped arrays
        } else {
            return compare_packets(left_item, right_item);
        }
    }
}

// -------------------------- Helper Functions --------------------------------
// ----------------------------------------------------------------------------
// Note to others. If you want to use the modulo operator to do something 
// on every other item in an array, remember to compare the product 
// against the damn remainder ... 
function convert_packets_into_tuples(input) {
    const tuples = [];
    let tuple = [];
    for (let i = 0; i < input.length; i++) {
        tuple.push(input[i]);
        if (i % 2 !== 0) {
            tuples.push(tuple);
            tuple = [];
        }
    }
    return tuples;
}

// Recursively reverse array and all sub-arrays
// Yay recursion!
function reverse_array(array) {
    if (array.length === 0) return []; 
    array = array.reverse();
    for (let item of array) {
        if (Array.isArray(item)) {
            item = reverse_array(item);
        }
    }
    return array;
}