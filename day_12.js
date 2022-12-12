// ----------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/12
// Solution by: https://github.com/frhel (Fry)
// ----------------------------------------------------------------------------

// -------------------------------- Imports -----------------------------------
const fs = require('fs');
const { start } = require('repl');
// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline 
// character
const input = fs.readFileSync('./data/day_12', 'utf8').split('\r\n');

// --------------------------------- Setup ------------------------------------
const start_pos = find_pos('S', input);
const GOAL_POS = find_pos('E', input);
const GRID = convert_letters_to_numbers(input);
const DIR_MAP = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const GRID_BOUNDS = [GRID[0].length, GRID.length];



// ------------------------------- Solution -----------------------------------
// -------------------------------- Part 1 ------------------------------------
let path = find_shortest_path(start_pos);
console.log(`Part 1: Steps to goal: ${path.size - 1}`);


let l_grid = convert_numbers_to_letters(GRID);
console.log(l_grid.map(row => row.join('')).join('\r\n'))

// -------------------------------- Part 2 ------------------------------------

// ------------------------------ Functions -----------------------------------
// ----------------------------------------------------------------------------
function find_shortest_path(start_pos, no_recursion = false, visited = []) {
    let path = populate_start_pos(start_pos, visited);
    
    while (path.size > 0) {
        let [curr_pos, node] = [...path.entries()].at(-1);
        if (!visited.includes(curr_pos))     
            visited.push(curr_pos);
        let [x, y] = curr_pos.split(',').map(Number);
        curr_pos = curr_pos.split(',').map(Number);
        let node_edges = node.get('edges');
        let viable_edges = [];
        for (let edge of node_edges) {
            let [x, y] = edge.split(',').map(Number);
            if (x == GOAL_POS[0] && y == GOAL_POS[1]) {
                path.set(edge, new Node([x, y], visited));
                return path;
            }
            let edge_node = path.get(edge);
            if (edge_node) {
                continue;
            } else {
                edge_node = new Node([x, y], visited);
                viable_edges.push(edge_node);
            }
        }

                
        let most_viable_edge = new Map();
        let most_viable_key = '';
        let steps = 0;
        if (no_recursion === false) {       
            for (let edge of viable_edges) {           
                let [x, y] = [...edge.keys()][0].split(',').map(Number);
                let key = [x, y].join(',');         
                node.get('edges').delete(key);
                let coords = [x, y];
                let edge_path = find_shortest_path(coords, true);
                // get the last node in the path and check if it is the goal
                // if it is, then we have found the shortest path 
            
                let last_node = (edge_path.size > 0) ? [...edge_path.keys()].at(-1) : '';
                console.log(last_node)
                if (edge_path.size > 0 && last_node === GOAL_POS.join(',')) {
                    if (most_viable_edge.size === 0 || edge_path.size < most_viable_edge.size) {
                        steps++;
                        console.log(visited)
                        console.log(last_node === GOAL_POS.join(','))
                        most_viable_edge.set(key, edge.get(key));
                        most_viable_key = key;
                    }
                }
            }
        }

        if (most_viable_edge.size === 0 && viable_edges.length > 0) {
            most_viable_edge = [...viable_edges.entries()]
                .sort((a, b) => a[1].get('distance') - b[1].get('distance'))[0][1];
            most_viable_key = most_viable_edge.keys().next().value;
        }
        if (visited.includes('10,19'))
        if (most_viable_edge.size > 0 && !path.get(most_viable_key)) {
            let value = most_viable_edge.get(most_viable_key);
            //console.log(most_viable_key, value)
            node.get('edges').delete(most_viable_key);
            path.set(most_viable_key, value);
        } else {
            path.delete(curr_pos.join(','));
        }
    }
    

    return path;
}

function find_edges(x, y, visited) {
    let edges = new Set();
    // Go through all possible directions and check if they are valid moves
    // A valid move is defined as a move that does not go out of bounds and 
    // is equal to current position or a space value, 1 greater or 1 less.
    for (let [dx, dy] of DIR_MAP) {
        let [nx, ny] = [x + dx, y + dy];
        let [curr, edge] = [0, 0];
        if (nx >= 0 && nx < GRID_BOUNDS[0] && ny >= 0 && ny < GRID_BOUNDS[1])
            [curr, edge] = [GRID[y][x], GRID[ny][nx]];
        else 
            continue;

        if ((edge <= curr + 1 && !visited.includes([nx, ny].join(',')))
            || (nx == GOAL_POS[0] && ny == GOAL_POS[1])) {
                if (nx == GOAL_POS[0] && ny == GOAL_POS[1] && curr !== 25)
                   continue;
            edges.add([x + dx, y + dy].join(','));
        }
    }
    return edges;
}

function Node(curr_pos, visited) {
    return new Map([
        [curr_pos.join(','), new Map([
            ['distance', find_distance(curr_pos, GOAL_POS)],
            ['edges', find_edges(curr_pos[0], curr_pos[1], visited)]
            ])
        ]
    ]);
}

function find_distance(start_pos) {
    return Math.abs(start_pos[0] - GOAL_POS[0]) + Math.abs(start_pos[1] - GOAL_POS[1]);
}

// --------------------------- Setup Functions --------------------------------
// ----------------------------------------------------------------------------
function populate_start_pos(start_pos, visited) {
    let path = new Node(start_pos, visited);
    let node = path.get(start_pos.join(','));
    let node_edges = node.get('edges');
    for (let [dx, dy] of DIR_MAP) {
        let [x, y] = start_pos;
        if (x + dx >= 0 && x + dx < GRID_BOUNDS[0]
            && y + dy >= 0 && y + dy < GRID_BOUNDS[1]) {
            node_edges.add([x + dx, y + dy].join(','));
        }
    }
    path.set(start_pos.join(','), node);
    return path;
}

function letter(char) {
    return String.fromCharCode(char + 97);
}

function convert_numbers_to_letters(input) {
    let grid = [];
    for (let line of input) {
        let row = [];
        for (let num of line)
            if (num !== '#')
                row.push(String.fromCharCode(num + 97));
            else
                row.push(num);
        grid.push(row);
    }
    return grid;
}

function convert_letters_to_numbers(input) {
    let grid = [];
    input = input.map(line => line.replace('S', 'a').replace('E', 'z'));
    for (let line of input) {
        let row = [];
        for (let char of line)
            row.push(char.charCodeAt(0) - 97);
        grid.push(row);
    }
    return grid;
}

function find_pos(symbol) {
    let pos = [];
    for (let y = 0; y < input.length; y++)
        for (let x = 0; x < input[y].length; x++)
            if (input[y][x] == symbol)
                pos = [x, y];
    return pos;
}