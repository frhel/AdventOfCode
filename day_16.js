// ----------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/16
// Solution by: https://github.com/frhel (Fry)
// ----------------------------------------------------------------------------

// -------------------------------- Imports -----------------------------------
const fs = require('fs');
const { cloneDeep, find } = require('lodash');
// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline 
// character
const input = fs.readFileSync('./data/day_16', 'utf-8')
    .replace(/\r/g, "").trim().split('\n');

// --------------------------------- Setup ------------------------------------
let valves = generate_valves_map(input);
let start = 'AA';
let rounds = 30;


// Just for fun - let's see how long it takes to run the solution
let _start_time = new Date().getTime();
console.log(`Starting to solve Part 1 at ${new Date().toLocaleTimeString()}`)
// ------------------------------- Solution -----------------------------------
// -------------------------------- Part 1 ------------------------------------
let most_efficient_path = find_most_efficient_path(valves, start, rounds);
console.log(most_efficient_path)
console.log(`Part 1 solution: ${most_efficient_path.total_flow}`)
// Best time so far: 490167ms to run

// -------------------------------- Part 2 ------------------------------------


let delta_time = new Date().getTime() - _start_time;
console.log(`Solution took ${~~(delta_time/1000/60)} minutes and ${delta_time/1000} seconds to run`)
// ------------------------------ Functions -----------------------------------
// ----------------------------------------------------------------------------
function find_most_efficient_path(valves, start, rounds) {
    let valuables = valves.filter((node) => node[1].rate > 0);
    visited = [start]
    let path = [start];
    let depth = 6;
    rounds--;
    while (rounds > 0) {
        let start_node = valves.find((node) => node[0] === path.at(-1));
        if (valuables.length === 0) break;
        let edges = cloneDeep(start_node[1].edges);
        let next_node_name = visit_edges(start_node, valves, depth, visited, valuables);
        visited.push(next_node_name)
        valuables = valuables.filter((node) => node[0] !== next_node_name);
        let distance = edges[next_node_name].length + 1;
        path.push(next_node_name);
        rounds -= distance;
    }
    // console.log(path)
    // path = ['AA', 'DD', 'BB', 'JJ', 'HH', 'EE', 'CC',]
    console.log('['+path.join('] => [').trim()+']')
    let node = valves.find((node) => node[0] === path.at(-1));
    return calculate_steps({ node: node, root: visited.at(-1), depth: 1, visited: path }, valves);
}

function visit_edges(node, valves, depth, visited, valuables) {
    depth = (depth > valuables.length) ? valuables.length : depth;
    let queue = [];
    let garbage = new Set();
    if (valuables.length === 1) {
        return valuables[0][0];
    } else {
        queue.push({ node: node, root: node[0], depth: 1, visited: visited.slice(0, -1), calculated: { steps: 0, flow_rate: 0, total_flow: 0 } });
    }
    let count = 0;
    let winner = { path: ['AAA'], calculated: { steps: 0, flow_rate: 0, total_flow: 0 } };
    while (queue.length > 0 && valuables.length > 1) {
        count++;
        if (count % 10000 === 0) {
            let delta_time = new Date().getTime() - _start_time;
            console.log(`${count} iterations in ${delta_time/1000}s`);
        }

        let current = queue.shift();
        if (current.node[0] === undefined || current.visited.includes(current.node[0])) {
            continue;
        }
        let current_node_edges = valuables
        current.visited.push(current.node[0])
        if (current.depth < depth) {
            for (let edge of current_node_edges) {
                let edge_name = edge[0];
                let edge_node = valves.find((node) => node[0] === edge_name);
                new_root = (current.depth < 2) ? edge_name : current.root;
                let new_depth = current.depth + 1;
                queue.push({ node: edge_node, root: new_root, depth: new_depth, visited: cloneDeep(current.visited) });
            }
        } else {
            current.calculated = calculate_steps(current, valves);
            if (current.calculated.total_flow > winner.calculated.total_flow) {
                winner = current;
            }
        }
    }
    return winner.root
}

function calculate_steps(branch, valves) {
    let steps = 0;
    let flow_rate = 0;
    let total_flow = 0;
    let path_steps = 0;
    let last_step = branch.visited[0];
    for (let step of branch.visited.slice(1)) {
        let last_step_edges = valves.find((node) => node[0] === last_step)[1].edges;
        let last_step_edge = last_step_edges[step];
        let last_step_length = last_step_edge.length + 1;
        if (branch.visited.includes(step))
            path_steps += last_step_length;
        if (steps + last_step_length > rounds) {
            break;
        }
        steps += last_step_length
        total_flow += flow_rate * last_step_length;
        flow_rate += valves.find((node) => node[0] === step)[1].rate;
        last_step = step;
    }
    let steps_increment = rounds - steps;
    total_flow += flow_rate * steps_increment;

    let return_obj = { steps: steps, flow_rate: flow_rate, total_flow: total_flow };
    //console.log(return_obj)

    return return_obj;
}

// --------------------------- Setup Functions --------------------------------
// ----------------------------------------------------------------------------
function generate_valves_map(input) {
    let valves = {};
    for (let line of input) {
        let lineArr = line.split(' ')
        let valve = lineArr[1];
        let rate = parseInt(lineArr[4].split('=')[1].slice(0, -1));
        let tunnels = lineArr.slice(9).map(tunnel => tunnel.replace(/,/g, ''));
        valves[valve] = { rate, tunnels }
    }
    valves = [...Object.entries(valves)].sort((a, b) => b[1].rate - a[1].rate)

    for (let valve of valves) {
        let paths = generate_shortest_paths(valves, valve[0]);
        valve[1].edges = paths;
    }
    return valves
}

function generate_shortest_paths(valves, start) {
    let paths = {};
    for (let valve of valves) {
        if (valve[0] === start || valve[1].rate === 0) continue;
        let visited = [];
        let queue = [start];
        let path = [];
        while (queue.length > 0) {
            let curr_valve = queue.shift();
            let curr = valves.find(valve => valve[0] === curr_valve);
            let curr_tunnels = curr[1].tunnels;
            if (curr_tunnels.includes(valve[0])) {
                paths[valve[0]] = backtrace_path(path, curr_valve, valve[0]);
                break;
            }

            for (let tunnel of curr_tunnels) {
                if (!visited.includes(tunnel)) {
                    path.push([tunnel, curr_valve]);
                    queue.push(tunnel);
                }
            }
            visited.push(curr_valve);
        }
        paths[valve[0]] = paths[valve[0]].slice(1);
    }
    return paths;
}

function backtrace_path(path, curr_valve, end_valve) {
    let return_path = [end_valve, curr_valve];
    while (path.length > 0) {
        let curr = path.pop();
        if (curr[0] === curr_valve) {
            return_path.push(curr[1]);
            curr_valve = curr[1];
        }
    }
    return return_path.reverse();
}