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
// ------------------------------- Solution -----------------------------------
// -------------------------------- Part 1 ------------------------------------
console.log(`Starting to solve Part 1 at ${new Date().toLocaleTimeString()}`)
// let most_efficient_path = find_most_efficient_path(valves, start, rounds, 1);
// console.log(most_efficient_path)
// console.log(`Part 1 solution: ${most_efficient_path.total_flow}`)
// // Best time so far: 490167ms to run

// // -------------------------------- Part 2 ------------------------------------
rounds = 26;
let most_efficient_paths = find_most_efficient_path(valves, start, rounds, 2)
console.log(`Part 2 solution: ${most_efficient_paths.total_flow}`)
// // 2532 too low


let delta_time = new Date().getTime() - _start_time;
console.log(`Solution took ${~~(delta_time/1000/60)} minutes and ${delta_time/1000} seconds to run`)
// ------------------------------ Functions -----------------------------------
// ----------------------------------------------------------------------------
function find_most_efficient_path(valves, start, rounds, path_count) {
    let unopened = valves.filter((node) => node[1].rate > 0);
    let visited = [];
    for (let i = 0; i < path_count; i++) {
        visited.push([start]);
    }
    let depth = 6
    let distance_travelled = 0;
    rounds--;
    while (rounds > distance_travelled) {
        let best_nodes = [];
        if (unopened.length === 0) {
            console.log('here')
            break
        }
        for (let i = 0; i < path_count; i++) {            
            for (let open of unopened) {
                let node = valves.find((node) => node[0] === open[0]);
                let path = visit_edges(node, valves, depth, unopened, rounds);
                best_nodes.push(cloneDeep(path));
            }
            best_nodes = best_nodes.map((best_node) => {
                let temp = cloneDeep(best_node);
                temp.visited = visited[i].concat(temp.visited);
                let real_flow = calculate_steps(temp, valves);
                best_node.calculated = real_flow;
                return best_node;
            });
            
            best_nodes = best_nodes.sort((a, b) => b.calculated.total_flow - a.calculated.total_flow).slice(0, 1 + i)
            unopened = unopened.filter((node) => node[0] !== best_nodes[0].root);
            console.log(best_nodes)
        }
        let total_distance = 0;
        break



        // let combined_best = [];
        // for (let i = 0; i < path_count; i++) {
        //     for (let node of best_nodes) {
        //         let temp_node = cloneDeep(node);
        //         temp_node.visited = visited[i].concat(temp_node.visited);
        //         let real_flow = calculate_steps(temp_node, valves);
        //         temp_node.calculated = real_flow;
        //         combined_best.push(temp_node)
        //     }
        // }

        // // sort by max flow so we don't remove the best nodes later
        // combined_best = combined_best.sort((a, b) => b.calculated.total_flow - a.calculated.total_flow);
        // // now filter the nodes so we keep only the best nodes with the same root
        // combined_best = combined_best.filter((node, index, self) => self.findIndex((n) => n.root === node.root) === index);
        // console.log(combined_best)
        // for (let i = 0; i < path_count; i++) {
        //     let new_best_path = combined_best[i].visited;
        //     // only grab the first nodes up to and including the root node
        //     let new_best = new_best_path.slice(0, new_best_path.indexOf(combined_best[i].root)+1);
        //     visited[i] = new_best;

        //     let distance = calc_path_length(new_best, valves);
        //     if (distance > total_distance) {
        //         total_distance = distance;
        //     }
        //     unopened = unopened.filter((node) => node[0] !== new_best);
        // }
        console.log(visited)
        
        distance_travelled = total_distance;
    }
    // console.log(path)
    //path = ['AA', 'DD', 'BB', 'JJ', 'HH', 'EE', 'CC',]
    let total_flow = 0;
    for (let i = 0; i < path_count; i++) {
        console.log('['+visited[i].join('] => [').trim()+']')
        let node = valves.find((node) => node[0] === visited[i].at(-1));
        let flow = calculate_steps({ node: node, root: visited[i].at(-1), depth: 1, visited: visited[i] }, valves, rounds);
        total_flow += flow.total_flow;
    }
    return { path: visited, total_flow: total_flow };
}

function calc_path_length(path, valves) {
    let length = 0;
    for (let i = 1; i < path.length; i++) {
        let node = valves.find((node) => node[0] === path[i-1]);
        let edge = [...Object.entries(node[1].edges)].find((edge) => edge[0] === path[i]);
        length += edge[1].length;
    }
    return length;
}

function visit_edges(node, valves, depth, unopened, rounds) {
    depth = (depth > unopened.length) ? unopened.length : depth;
    let stack = [];
    stack.push({ node: node, root: node[0], depth: 1, visited: [], calculated: { steps: 0, flow_rate: 0, total_flow: 0 } });
    let count = 0;
    let winner = stack[0];
    while (stack.length > 0 && unopened.length > 1) {       

        let current = stack.pop();
        if (current.node[0] === undefined || current.visited.includes(current.node[0])) {
            continue;
        }
        let current_node_edges = unopened
        current.visited.push(current.node[0])
        if (current.depth < depth) {
            for (let edge of current_node_edges) {
                let edge_name = edge[0];
                let edge_node = valves.find((node) => node[0] === edge_name);
                let new_depth = current.depth + 1;
                stack.push({ node: edge_node, root: current.root, depth: new_depth, visited: cloneDeep(current.visited) });
            }
        } else {
            count++;
            if (count % 100000 === 0) {
                let delta_time = new Date().getTime() - _start_time;
                console.log(`${count} iterations in ${delta_time/1000}s`);
            }
            current.calculated = calculate_steps(current, valves);
            if (current.calculated.total_flow > winner.calculated.total_flow) {
                winner = current;
            }
        }
    }
    return winner
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
        console.log(last_step, step)
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