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

const _inverse = {
   '-': '+',
   '+': '-',
   '*': '/',
   '/': '*'
}

// ---------------------------- Solution -------------------------------------
const solution_start = performance.now();
let answer = solve(input.slice(), node_name);
// -------------------------------- Part 1 -----------------------------------
console.log(`Part 1 answer: ${answer.part1}`);
// Answer: 155708040358220

// -------------------------------- Part 2 -----------------------------------
console.log(`Part 2 answer: ${answer.part2}`);
// Answer: 3342154812537

console.log(`Solution completed in ${(performance.now() - solution_start).toFixed(2)}ms`);

// ------------------------------ Main logic ----------------------------------
// Solve both parts of the problem in one go. The solve() function returns an
// object with the answers for both parts.
// Recursively builds a tree of objects from the input array. Each node in the
// tree represents one line(monkey) from the input array. The tree is built
// from the top down, starting with the root node. Each node has a name, a
// number, an operation, and a left and right node. The left and right nodes
// are objects with the same properties as the parent node. The tree is built
// recursively by calling the solve() function with the name of the left and
// right nodes as arguments. The solve() function returns the node object for
// the current node. The solve() function also evaluates the operand of the
// current node and assigns the result to the current node. The solve() function
// also keeps track of whether the current branch of the tree has humn in it.
// This is used later to solve part 2.
// The solve() function returns the node object for the root node. The root
// node has the answer for part 1 as its number property. The solve() function
// also calls the track_human_path() function to get the answer for part 2.
// The track_human_path() function traverses the tree back to the humn node
// and reverses the operations to get the number that humn would have had to

function solve(input, node_name) {
   let curr_line = input[input.findIndex(line => line[0] === node_name)];

   // Check if we have reached a leaf node. Leaf nodes have a length of 2
   // node name and a value. Non-leaf nodes have a length of 4:
   // node name, left node name, operation, right node name
   let leaf = curr_line.length === 2;

   // creating the node object for the current node of the tree
   let node = {
      name: node_name, 
      num: leaf ? Number(curr_line[1]) : -Infinity,
      operation: leaf ? '' : curr_line[2],
      left: {name: leaf ? '' : curr_line[1]},
      right: {name: leaf ? '' : curr_line[3]},
      has_human: false
   };

   // If the node has a number, we have reached a leaf node and can return it.
   if (node.num > -Infinity) {
      // Gotta check if we have reached humn so we can track the path back to it later
      if (node.name === 'humn') node.has_human = true;
      return node;
   } else {
      // Recursive call to get the left and right nodes of the current node
      node.left = solve(input, node.left.name);
      node.right = solve(input, node.right.name);
      
      // use eval() to evaluate the operation and assign the resulting value to the current node
      node.num = Number(eval(`${node.left.num} ${node.operation} ${node.right.num}`));

      // Keep track of whether the current branch has humn in it
      if (node.left.has_human || node.right.has_human) {
         node.has_human = true;
      }
      
      // If we're back to the root node, we can call track_human_path() to get the answer for part 2
      // Or just return the value for Part 1. Since we can reuse the output from Part 1 for Part 2,
      // we can just save the value for Part 1 in a return object, continue on solving for Part 2,
      // and then return the object with both answers at the end.
      if (node.name === 'root') {
         // Save the part 1 answer
         let answers = {part1: node.num}
         
         // Solve for part 2 with the tree object we have built
         let nr_to_match = node.left.has_human ? node.right.num : node.left.num;
         let humn_branch = node.left.has_human ? node.left : node.right;

         // Save the result of track_human_path() in the return object and return it
         answers.part2 = track_human_path(humn_branch, nr_to_match);
         return answers;
      }
      return node
   }
}


// This is where we traverse the tree back to humn and reverse the operations
// to get the number that humn would have had to enter to get to the root node
function track_human_path(node, tracked_number) {
   // If we have reached the humn node, return the answer.
   if (node.name === 'humn') {
      return tracked_number;
   }

   // Check which node in the tree we need to evaluate next.
   let humn_side = node.left.has_human ? node.left : node.right;
   // console.log(node.left.has_human, node.left.num, node.operation, node.right.num, node.right.has_human)

   // Check which side of the node we need to evaluate next.
   let side = node.left.has_human ? 'left' : 'right';

   if (side === 'left') {
      // If the tracked_number is substituted for the left number, we can just invert
      // the operation and evaluate it against the right number in the same order as
      // the original operation.
      node.operation = _inverse[node.operation]
      node.left.num = tracked_number;
      tracked_number = eval(`${node.left.num} ${node.operation} ${node.right.num}`);
   } else {
      node.right.num = tracked_number;
      
      // If the tracked_number is substituted for the right number, we have to invert
      // the whole operand, along with the operation, unless the operation is a
      // subtraction, in which case we can just substitute the tracked_number for
      // the right number and evaluate the operand in the same order as the original
      if (node.operation !== '-') {
         node.operation = _inverse[node.operation];
         tracked_number = eval(`${node.right.num} ${node.operation} ${node.left.num}`);
      } else {
         tracked_number = eval(`${node.left.num} ${node.operation} ${node.right.num}`);
      }
   }


   
   // Recursively call the function with the next node and the new tracked number.
   return track_human_path(humn_side, tracked_number);
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