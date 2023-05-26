// ----------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/21
// Solution by: https://github.com/frhel (Fry)
// ----------------------------------------------------------------------------

// -------------------------------- Imports -----------------------------------
const fs = require('fs');
const { rootCertificates } = require('tls');

// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline
// character
const file_data = '../data';
const _input = fs.readFileSync(file_data, 'utf-8')
   .replace(/\r/g, "").trim().split('\n');

// ------------------------------ Setup ---------------------------------------
const input = parse_input(_input);
const node_name = 'root';

_inverse = {
   '-': '+',
   '+': '-',
   '*': '/',
   '/': '*'
}

// ---------------------------- Solution -------------------------------------
const solution_start = performance.now();
// -------------------------------- Part 1 -----------------------------------
const part1_start = performance.now();
const part1_answer = solve_part1(input.slice(), node_name);
console.log(`Part 1 answer: ${part1_answer} in ${(performance.now() - part1_start).toFixed(2)}ms`);

// -------------------------------- Part 2 -----------------------------------
const part2_start = performance.now();
const part2_answer = solve_part2(input.slice(), node_name);
console.log(`Part 2 answer: ${part2_answer} in ${(performance.now() - part2_start).toFixed(2)}ms`);

console.log(`Solution completed in ${(performance.now() - solution_start).toFixed(2)}ms`);

// ------------------------------ Main logic ----------------------------------
                     /////////////////////////////////
                     ////// PROBLEM AREA BEGINS //////
                     /////////////////////////////////
// This is where we traverse the tree back to humn and reverse the operations
// to get the number that humn would have had to enter to get to the root node.
// However, something is fucky and I'm getting very wrong results back.
// It works fine for the sample input, but for some reason it just keeps returning
// very incorrect results for the main dataset.
function track_human_path(node, tracked_number) {
   // If we have reached the humn node, return the answer.
   if (node.name === 'humn') {
      console.log(tracked_number);
      return tracked_number;
   }

   // Check which node in the tree we need to evaluate next.
   let humn_side = node.left.has_human ? node.left : node.right;
   // console.log(node.left.has_human, node.left.num, node.operation, node.right.num, node.right.has_human)

   // Check which node has the human and chuck the current evaluated number
   // in to that slot for the next operation.
   node.left.num = node.left.has_human ? tracked_number : node.left.num;
   node.right.num = node.right.has_human ? tracked_number : node.right.num; 
   
   let operation = _inverse[node.operation];
   
   //console.log(node.right.num, operation, node.left.num) 
   
   // I've reversed the operation here because I'm traversing the tree backwards with
   // inverted operations. Doesn't matter for addition and multiplication, but for
   // subtraction and division it does, or that's what I thought at least.
   // For some reason it's returning very very wrong results with floating point
   // numbers. I think my logic is sound, but I'm starting to doubt it though.
   nr_to_track = eval(`${node.right.num} ${operation} ${node.left.num}`);
   
   // Recursively call the function with the next node and the new tracked number.
   return track_human_path(humn_side, nr_to_track);
}
                        ///////////////////////////////
                        ////// PROBLEM AREA ENDS //////
                        ///////////////////////////////


// Same thing as part 1, but instead of only tracking the number values on the 
// tree, we also track the path of the human and pass the whole object back up
// the recursion stack. Then we call track_human_path() with the tree object
// and the number to match. This function will then recursively traverse the
// tree back to humn and reverse the operations to get the number that humn
// would have had to enter to get to the root node.
function solve_part2(input, node_name) {
   let curr_line = input[input.findIndex(line => line[0] === node_name)];
   let [num, operation, left_name, right_name] = [-Infinity, '', '', ''];

   if (curr_line.length == 2) num = Number(curr_line[1]);
   else [operation, left_name, right_name] = [curr_line[2], curr_line[1], curr_line[3]];

   let node = {
      name: node_name, 
      num: num,
      operation: operation,
      left: {name: left_name},
      right: {name: right_name},
      has_human: false
   };
   
   if (node.num > -Infinity) {
      if (node.name === 'humn') node.has_human = true;
      return node;
   } else {
      node.left = solve_part2(input, node.left.name);
      node.right = solve_part2(input, node.right.name);
      //console.log(node.left, operation, node.right)
      node.num = Number(eval(`${node.left.num} ${operation} ${node.right.num}`));
      if (node.left.has_human || node.right.has_human) {
         node.has_human = true;
      }
      
      if (node.name === 'root') {
         // Verified that the function returns the correct number for part 1 if I
         // log the number here. So the problem is somewhere in the recursion that
         // we do in track_human_path().

         // We need to match the number of the node that doesn't contain humn.
         let nr_to_match = node.left.has_human ? node.right.num : node.left.num;
         let humn_branch = node.left.has_human ? node.left : node.right;
         return track_human_path(humn_branch, nr_to_match);
      }
      return node
   }
}


// Solved. Simple recursion to build a tree and evaluate it bottom-up
function solve_part1(input, name) {
   let tree = {};
   let node = input[input.findIndex(line => line[0] === name)];
   let [num, operation, left, right] = [-Infinity, '', '', ''];

   if (node.length == 2) num = Number(node[1]);
   else  [operation, left, right] = [node[2], node[1], node[3]];

   tree[name] = {
      num: num,
      operation: operation,
      left: left,
      right: right
   };
   
   if (tree[name].num > -Infinity) {
      return tree[name].num;
   } else {
      tree[name].left = solve_part1(input, left);
      tree[name].right = solve_part1(input, right);
      console.log(tree[name].left, operation, tree[name].right)
      tree[name].num = Number(eval(`${tree[name].left} ${operation} ${tree[name].right}`));
      return tree[name].num
   }
}

// ----------------------------- Helper functions ----------------------------
// Parse the input data into a more convenient format
function parse_input(input) {
   let output = [];
   for (let i = 0; i < input.length; i++) {
      let line = input[i].trim();
      line = line.split(': ');
      let name = line[0];
      let operation = line[1].split(' ');
      output.push([name, ...operation]);
   }
   return output;
}