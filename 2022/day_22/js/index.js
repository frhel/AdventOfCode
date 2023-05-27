// ----------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/22
// Solution by: https://github.com/frhel (Fry)
// ----------------------------------------------------------------------------

// -------------------------------- Imports -----------------------------------
const fs = require('fs');

// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline
// character
const file_data = '../data';
const _input = fs.readFileSync(file_data, 'utf-8')
   .replace(/\r/g, "").split('\n');

// ------------------------------ Setup ---------------------------------------
const _instructions = parse_instructions(_input.pop());
const _map = parse_input(_input);
const _dir_keys = ['r', 'd', 'l', 'u'];
const dir_increments = [[0, 1], [1, 0], [0, -1], [-1, 0]];


// ------------------------------ Part 1 --------------------------------------
let part1_answer = solve_part_1(_map.slice(), _instructions.slice());
console.log(`Part 1 answer: ${part1_answer}`);
// Answer: 123046

// Takes the map and the instructions
function solve_part_1(map, instr) {
   // Starting position and direction, top right corner facing right.
   // Doesn't matter that we start outside the map since we will wrap around
   // to find the first available position anyway
   let pos = [0, 0];
   let dir = 'r';
   // Reversing the instructions makes it so I can just pop off the last
   instr = instr.reverse();
   
   // While there are still instructions to execute 
   while (instr.length > 0) {
      // The amount to move
      let move = instr.pop();

      // Move in the current direction until we hit a wall, wrapping around the
      // map if necessary
      while (--move >= 0) {
         let next = dir_increments[_dir_keys.indexOf(dir)]
            .map((x, i) => x + pos[i]);        
         // If our next move is outside the map, we need to find the next
         // available position wrapping around the map in the appropriate
         // direction
         if (next[0] < 0 || next[0] >= map.length || next[1] < 0 || next[1] >= map[next[0]].length
            || (map[next[0]][next[1]] !== '#' && map[next[0]][next[1]] !== '.')
          ) {           
            if (dir === 'r') 
               // If we're moving off the right side of the map, the next position will be the first
               // available position in the row. Whichever comes first, a wall or an empty space
               // hence the Math.min
               next = [pos[0], Math.min(map[pos[0]].indexOf('.'), map[pos[0]].indexOf('#'))];
            else if (dir === 'l')
               // Same as above but for the left side of the map and wrapping around to the
               // back of the row
               next = [pos[0], Math.max(map[pos[0]].lastIndexOf('.'), map[pos[0]].lastIndexOf('#'))];
            else 
               next = wrap_col(map, pos, dir);
         }

         // If we hit a wall, we need to stop moving
         if (map[next[0]][next[1]] === '#') break;
         pos = next;
      }

      // Rotate the actor if there is a rotation instruction
      let rota = instr.pop();
      dir = rota !== undefined ? rotate_actor(dir, rota) : dir;
   }
   // Draw the final position of the actor on the map for reference
   map = draw_actor(map, pos, dir);
   //draw_map(map);
   return (1000 * (pos[0] + 1)) + (4 * (pos[1] + 1)) + _dir_keys.indexOf(dir); 
}

// Rotate the actor in the specified direction
function rotate_actor (dir, rota) {
   // grab the index of the current direction from the _dir_keys array
   let dir_index = _dir_keys.indexOf(dir);

   // Check which direction we are rotating and increment or decrement the index
   let incr = rota === 'R' ? 1 : -1;

   // If the index is out of bounds, wrap around the array
   if (dir_index + incr >= _dir_keys.length) return _dir_keys[0];
   if (dir_index + incr < 0) return _dir_keys[_dir_keys.length-1];  

   // Otherwise, return the new direction
   return _dir_keys[dir_index + incr];
}

// Wrap around the map in the specified direction and return the new position on
// the opposite side of the map
function wrap_col(map, pos, dir) {
   // The column we are wrapping around
   const col = pos[1];

   // The new row we are wrapping to, starting at the current row
   let new_row = pos[0];

   // If we're moving down, we need to decrement the row until we hit the edge
   // and vice versa for moving up
   let incr = dir === 'd' ? -1 : 1;

   // Keep decrementing or incrementing the row until we hit the edge
   while (new_row + incr >= 0 && new_row + incr < map.length
      && (map[new_row + incr][col] === '#' || map[new_row + incr][col] === '.')
   ) {
      new_row += incr;
   }
   // Return a new pos array
   return [new_row, col];
}

// ----------------------------- Helper functions -----------------------------
// Draw the actor on the map in the right rotation
function draw_actor(map, pos, dir) {
   const dir_chevron = ['>', 'v', '<', '^'];
   map[pos[0]][pos[1]] = dir_chevron[_dir_keys.indexOf(dir)];
   return map;
}

// Draw the map to the console
function draw_map(map) {
   console.log([...Array(map[0].length).keys()].join(' '));
   map.map(row => console.log(row.join(' ')));  
}

// Parse the instructions into a more convenient format
function parse_instructions(x) {
   // Sample input: 10R5L5R10L4R5L5
   let output = [];
   let count = '';
   for (let i = 0; i < x.length; i++) {
      if (x[i].match(/\d/)) {
         count += x[i];
      } else {
         output.push(parseInt(count));
         count = '';
         output.push(x[i]);
      }
   }
   output.push(parseInt(count));
   return output;
}

// Parse the input data into a more convenient format
function parse_input(input) {
   // pop the last element off the array, which is empty
   input.pop();
   let output = [];
   for (let i = 0; i < input.length; i++) {
      output.push(input[i].split(''));
   }
   return output;
}