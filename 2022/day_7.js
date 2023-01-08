const fs = require('fs');
// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline character
const input = fs.readFileSync('./data/day_7', 'utf8').split('\r\n').reverse();

// ------------------------------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/7
// ------------------------------------------------------------------------------------------------

// ------------------------------------------------------------------------------------------------
// Build a tree structure from the input data
let file_tree = build_tree(input);

// Calculate the total size of all files recursively including the size of all subdirectories
file_tree = calc_recursive_dir_sizes(file_tree);


// ------------------------------------------------------------------------------------------------
// Part 1: Find all directories with a size less than 100000 and sum their sizes
let max_directory_size = 100000;
let dir_size_list = find_all_paths_with_size(file_tree, max_directory_size, false);

// Total size of all directories with a size less than max_directory_size
let total_result_size = dir_size_list.reduce((acc, val) => acc + val[1], 0);
console.log('Part 1 Solution: ' + total_result_size);


// ------------------------------------------------------------------------------------------------
// Part 2: Find the directory with the minimum required size to free up enough space for the update
// Define the file system size, update size, and free space
let [file_system_size, update_size] = [70000000, 30000000];
let free_space = file_system_size - file_tree.total_size;

// Find how much space we need to free up to make room for the update
let space_needed = update_size - free_space;

// Find the directory with the minimum required size to free up enough space for the update
// Sort the returned list by ascending size and return the first element
let dir_to_delete = find_all_paths_with_size(file_tree, space_needed)
                    .sort((a, b) => a[1] - b[1])
                    .at(0);
console.log(`Part 2 Solution: ${dir_to_delete[1]}`);


// ------------------------------------------------------------------------------------------------
// fn: find_all_paths_with_size() - Find all directories with a size greater or less than the size
//     depending on the value of the min parameter and return a list of all paths and their sizes
function find_all_paths_with_size(dir, size, min = true, path = []) {
    let dir_size_list = [];
    // loop through all keys in the current directory
    for (let key in dir) {
        if (key === 'total_size' && compare_size(dir[key], size, min)) {
            // if the key is 'total_size' and the size condition is met, add the path and size to the list
            dir_size_list.push([path.join('/'), dir[key]]);
        } else if (typeof dir[key] === 'object') {
            // if the key is a directory, recursively call the function to find all paths that meet
            // the size condition
            dir_size_list = dir_size_list.concat(find_all_paths_with_size(dir[key], size, min, path.concat(key)));
        }
    }
    return dir_size_list;
}


// ------------------------------------------------------------------------------------------------
// fn: compare_size() - Compare two numbers and return comparison based on the value of the min
//     parameter
function compare_size(size1, size2, min) {
    return min ? size1 > size2 : size1 < size2;
}


// ------------------------------------------------------------------------------------------------
// fn: calc_recursive_dir_sizes() - Calculate the total size of all files recursively including the 
//     size of all subdirectories and save the result as a 'total_size' property of each directory
function calc_recursive_dir_sizes(dir) {
    let dir_size = 0;
    // loop through all keys in the current directory
    for (let key in dir) {
        if (!isNaN(dir[key])) { // if the key is a file, add the size to the total size
            dir_size += Number(dir[key]);
        } else if (typeof dir[key] === 'object') {
            // if the key is a directory, recursively call the function to calculate the total size
            // of all files in the subdirectory and add the child directory size to the total size
            dir[key] = calc_recursive_dir_sizes(dir[key]);
            dir_size += dir[key]['total_size'];
        }
    }
    dir['total_size'] = dir_size;
    return dir
}


// ------------------------------------------------------------------------------------------------
// fn: build_tree() - Build a tree structure from the input data
//    The tree structure is a nested object where each directory is a key in the object and the
//    value is either an object representing a subdirectory or a number representing the size of
//    a file
function build_tree(input, tree = {}, path = []) {
    // Get the current directory object from the tree by following the absolute path we are
    // currently on
    let current_dir = get_current_dir_object(path, tree);

    // Grab the next line of input and split it on the space character 
    let line = input.pop().split(' ');

    if (line[0] === '$' && line[1] === 'cd') { // If the line is a cd command
        // Update the absolute path array
        path = update_path(path, line[2]);

        // Grab the new directory object from the tree by following the new absolute path
        current_dir = get_current_dir_object(path, tree);

    } else if (line[0] === '$' && line[1] === 'ls') { // If the line is an ls command
        // We're entering a loop to process all the files and directories for the current directory.
        // The loop will end when we reach the end of the input or we reach a new command.
        // In order for us start the loop, we need to grab the next line of input so the loop
        // condition will be true for the first iteration.
        line = input.pop().split(' ');
        while (input.length > 0 && line[0] !== '$') {
            if (line[0] === 'dir') {                
                // If the line is a directory, add the directory name as a key to the current directory
                // object and set the value to an empty object. If the directory already exists, we
                // don't want to overwrite it.
                current_dir[line[1]] = line[1] in current_dir ? _ : {};
            } else {
                // If the line is a file, add the file name as a key to the current directory object
                // and set the value to the file size. If the file already exists, we don't want to
                // overwrite it.
                current_dir[line[1]] = line[1] in current_dir ? _ : line[0];
            }
            // Grab the next line of input
            line = input.pop().split(' ');
        }
        // If we reached the end of the input, we need to push the last line back onto the input
        // array so we can process it in the next iteration of the outer loop.
        if (line[0] === '$') {
            input.push(line.join(' '));
        }
    }

    // If we still have input, recursively call the function to process the next line of input
    if (input.length === 0) return tree;
    else return build_tree(input, tree, path);
}


// ------------------------------------------------------------------------------------------------
// fn: get_current_dir_object() - Get the object representing the current directory from the tree
//     structure by following the absolute path from the root directory
function get_current_dir_object(path, tree) {
    let current_dir = tree;
    // Loop through the absolute path and follow the path to get the current directory object
    for (let dir of path) {
        if (!(dir in current_dir)) {
            // If the directory doesn't exist, create it
            current_dir[dir] = {};
        }
        current_dir = current_dir[dir];
    }
    return current_dir;
}


// ------------------------------------------------------------------------------------------------
// fn: update_path() - Keep track of the current directory by updating the path array depending on
//     the current command
function update_path(path, dir) {
    if (dir === '..') {
        path.pop();
    } else {
        path.push(dir);
    }
    return path;
}