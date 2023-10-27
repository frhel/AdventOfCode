// ----------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/16
// Solution by: https://github.com/frhel (Fry)
// ----------------------------------------------------------------------------

// -------------------------------- Imports -----------------------------------
const fs = require('fs');
let { Queue } = require('../../libs/queue.js');
let { PQueue } = require('../../libs/priority_queue.js');

// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline
// character
const file_data = '../data';
const file_ex = './data/example'; // Keeping the example data in a separate file
const input = fs.readFileSync(file_data, 'utf-8')
    .replace(/\r/g, "").trim().split('\n');

// --------------------------------- Setup ------------------------------------
const start_node_name = 'AA';
const valves = generate_valves_map(input);
const start_node = valves.find(valve => valve.name === start_node_name);
let rounds = 30;

// ----------------------------------------------------------------------------
// ------------------------------ Functions -----------------------------------
// ----------------------------------------------------------------------------

// The solution to Part 2. It uses the same function as Part 1, but it runs
// it with all possible combinations of the unopened valves and then returns
// the highest value of the best 2 paths that don't share any valves.
// ----------------------------------------------------------------------------
function find_best_multiple_paths(unopened, start_node, rounds) {
    unopened = unopened.filter(valve => valve.name !== start_node.name);
    // We are going to generate all possible combinations of the unopened
    // valves, but only half of them (rounded up) because we're going to
    // combine each of those combinations with the other half of the
    // original set of valves.
    let split_count = ~~(unopened.length / 2);
    let split_mod = unopened.length % 2;
    let splits = combinations(unopened, split_count + split_mod);
    // We're going to combine each of the splits with the remaining unopened
    splits = splits.map(split => [split, unopened.slice().filter(valve => !split.includes(valve))])

    // We're just going to dump the results of the combinations function into
    // an array and then sort it by value at the end to get the highest value.
    const best_flow = new Array(splits.length).fill(0);
    let best_flow_index = 0;
    // Loop through each of the combinations and run the find_most_efficient_path
    // function on each of the combinations.
    for (let i = 0; i < splits.length; i++) {
        // Run the find_most_efficient_path function on each group and
        // then add the results together to get the total flow for that
        // combination.
        best_flow[best_flow_index++] = (
            find_most_efficient_path(
                splits[i][0]
            )
            + find_most_efficient_path(
                splits[i][1]
            )
        );
    }

    return best_flow.sort((a, b) => b - a)[0];
}

// This is the solution to Part 1. It uses a depth first search to find the
// most efficient path through the valves. It returns the total flow of the
// most efficient path. Because this function is being called thousands of
// times, it's important to keep it as fast as possible. I've tried many ways
// to optimize it, and this is the best that I've come up with so far.
// ----------------------------------------------------------------------------
function find_most_efficient_path(valves) {
    let queue = new Queue();
    queue.enqueue({
        node: start_node,
        visited: [],        
        steps: 0,
        flow_rate: 0,
        flow: 0,
        total_flow: 0,
        priority: 0
    });

    const winner = queue.peek();
    while (!queue.isEmpty) {
        const current = queue.dequeue();
        const curr_visited = current.visited;
        
        // Using a visited array on the current node object because we want
        // each branch to track its own visited nodes. We want to be able to
        // visit the same node multiple times if it's on different branches.
        curr_visited.push(current.node.name)

        // Just a simple if statement to check if we are on the winning node.
        if (current.total_flow > winner.total_flow) {
            winner.visited = curr_visited;
            winner.node = current.node;
            winner.steps = current.steps;
            winner.flow_rate = current.flow_rate;
            winner.flow = current.flow;
            winner.total_flow = current.total_flow;
            winner.priority = current.priority;
        }

        for (const edge of valves) {
            // Skip the edge if it's the current node
            if (edge.name === current.node.name) continue;
            const edge_name = edge.name;
            const edge_obj = current.node.edges[edge_name];
            const steps = current.steps + edge_obj.steps;
           
            // We don't want to visit a node that we've already visited
            // and we don't want to visit a node that is outside of the
            // number of rounds that we're allowed to visit.
            if (curr_visited.includes(edge_name) || steps > rounds) continue;

            // Start by calculating the flow for the current node by multiplying
            // the flow rate by the number of steps that we've taken since the
            // last valve and then adding that with the flow from the previous
            // node.
            const flow = (current.flow_rate * edge_obj.steps) + current.flow;

            // Increment the flow rate by the rate of the current node.. AFTER
            // we've calculated the flow between the last valve and the current
            // node.
            const flow_rate = current.flow_rate + edge.rate;

            // Calculate the total flow we would have for the remaining rounds
            // if we were to stop at this node. This is the final weight that
            // we will use to compare and determine winners.
            const total_flow = flow_rate * (rounds - steps) + flow
            
            const priority = (current.total_flow + total_flow) - (edge_obj.flow * (rounds / valves.length) / 1.4)

            // Kill the branch if the total flow is less than the current
            // winner and the number of steps is greater than the number of
            // steps for the current winner. This is a pretty big optimization
            // that I kind of stumbled upon while I was trying to optimize
            // the runtime of this function.
            if (priority <= winner.priority)
                break;


            // Push the node onto the stack. Make sure to pass the visited
            // array by value, not by reference. Otherwise, we'll end up
            // with a bunch of nodes that have the same visited array.
            queue.enqueue({
                node: edge,
                visited: curr_visited.slice(),
                flow_rate,
                flow,
                steps,
                total_flow,
                priority
            });
        }
    }
    return winner.total_flow
}

// ----------------------------------------------------------------------------
// --------------------------- Helper Functions -------------------------------
// ----------------------------------------------------------------------------
// This is a recursive function that generates all combinations of a
// given length from an array by taking the first element and then generating
// all combinations of the remaining elements of the array of length one less
// than the desired length. It then does the same for the second element and
// so on until it has generated all combinations of the desired length.
function combinations(arr, len) {
    if (len === 0) return [[]];
    const result = [];
    for (let i = 0; i <= arr.length - len; i++) {
        const sub_result = combinations(arr.slice(i + 1), len - 1);
        for (const combination of sub_result) {
            result.push([arr[i], ...combination]);
        }
    }
    return result;
}



// ----------------------------------------------------------------------------
// --------------------------- Setup Functions --------------------------------
// ----------------------------------------------------------------------------
// Generate a map of all the valves and their connections, but throw out the
// ones that don't have any rate (they don't actually matter)
function generate_valves_map(input) {
    let valves = {};
    for (let line of input) {
        let lineArr = line.split(' ')
        let valve = lineArr[1];
        let rate = parseInt(lineArr[4].split('=')[1].slice(0, -1));
        let tunnels = lineArr.slice(9).map(tunnel => tunnel.replace(/,/g, ''));
        valves[valve] = { rate, tunnels }
    }
    valves = [...Object.entries(valves)]

    // Generate the shortest paths from each node to all other nodes
    for (let valve of valves) {
        let paths = generate_shortest_paths(valves, valve[0]);
        valve[1].edges = paths;
        valve[1].name = valve[0];
    }

    // Remove the valves that don't have any rate since they dont matter
    valves = valves
        .filter(valve => valve[1].rate > 0 || valve[1].name === 'AA')
        .map(valve => valve[1])
        .map((valve) => {
            valve.edges = [...Object.entries(valve.edges)].map(edge => { 
                edge[1].flow = valve.rate * edge[1].steps;
                return edge;
            }).sort((a, b) => b[1].weight - a[1].weight);
            valve.edges = Object.fromEntries(valve.edges);
            valve.max_weight = valve.edges[Object.keys(valve.edges)[0]].weight;
            return valve;
        })
    valves = valves.sort((a, b) => b.max_weight - a.max_weight);
    return valves
}

// Using BFS to find the shortest path from a given node to all other nodes in
// the graph so we can access the most valuable nodes in the shortest amount of
// time. This function does not take long at all to run with the given input and
// saves a lot of time in the long run.
// ----------------------------------------------------------------------------
function generate_shortest_paths(valves, start) {
    let paths = {};
    for (let valve of valves) {
        // Skip if the valve is the start node or has no flow rate
        if (valve[0] === start || valve[1].rate === 0) continue;

        let visited = [];
        let queue = new Queue();
        queue.enqueue(start);
        let path = [];
        while (!queue.isEmpty) {
            let curr_valve = queue.dequeue();
            let curr = valves.find(valve => valve[0] === curr_valve);
            let curr_tunnels = curr[1].tunnels;

            // If we found the end valve, we can stop the BFS and backtrace the
            // path.
            if (curr_tunnels.includes(valve[0])) {
                const path_length = backtrace_path(path, curr_valve, valve[0]);
                paths[valve[0]] = {
                    name: valve[0],
                    steps: path_length,
                    weight: valve[1].rate / path_length
                }
                break;
            }

            // Add all the availables tunnels that the current valve can go to
            // to the queue if they have not been visited yet.
            for (let tunnel of curr_tunnels) {
                if (visited.includes(tunnel)) continue;
                path.push([tunnel, curr_valve]);
                queue.enqueue(tunnel);
            }
            
            visited.push(curr_valve);
        }
    }
    return paths;
}


// This function is used to backtrace the path from the end valve to the start
// valve as a part of the BFS algorithm. It takes the path array that was
// used in the BFS to hold node pairs that visited each other and the current
// valve we were on when we found the end valve.
// ----------------------------------------------------------------------------
function backtrace_path(path, curr_valve, end_valve) {
    // We're gonna add the path back to the start valve in reverse order so we
    // start with the end valve and work our way back to the start valve.
    let return_path = [end_valve, curr_valve];
    while (path.length > 0) {
        let curr = path.pop();
        // Just pop everything off the path until we find the node where the
        // current valve is the first element in the node pair. That means
        // that the second element in the node pair is valve we need to go to
        // next to get closer to the start valve because that is the valve that
        // we visited before we visited the current valve.
        if (curr[0] === curr_valve) {
            return_path.push(curr[1]);
            curr_valve = curr[1];
        }
    }
    // We just return the length of the path because we don't need the actual
    // path. The weight of the path is the length of the path.
    return return_path.length;
}


// ------------------------------- Solution -----------------------------------
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// -------------------------------- Part 1 ------------------------------------
// ============================================================================
// Timers were a big thing in this one...
let _start_time = new Date().getTime();
console.log(`Starting to solve Part 1 at ${new Date().toLocaleTimeString()}`)
// ============================================================================

// Actually solve part 1
let most_efficient_path = find_most_efficient_path(valves.filter(valve => valve.name !== start_node.name));
console.log(`Part 1 solution: ${most_efficient_path}`)

// ============================================================================
// Timer to see how long it took to solve part 1
let delta_time = new Date().getTime() - _start_time;
console.log(`Part 1 solution finished in ${delta_time / 1000}s`)
// Best time so far: 0.079s
// ============================================================================

// ----------------------------------------------------------------------------
// -------------------------------- Part 2 ------------------------------------
// ============================================================================
// More timers...
let _start_time_2 = new Date().getTime();
console.log(`Starting to solve Part 2 at ${new Date().toLocaleTimeString()}`)
// ============================================================================

// Actually solve part 2
rounds = 26;
let best_multiple_paths = find_best_multiple_paths(valves, start_node, rounds)
console.log(`Part 2 solution: ${best_multiple_paths}`)
// Best time so far: 8,8s

// ============================================================================
// Timer to see how long it took to solve part 2
delta_time = new Date().getTime() - _start_time_2;
console.log(`Part 2 solution finished in ${delta_time / 1000}s`)
// ============================================================================
// ============================================================================
// Timer to see how long it took to solve both parts
delta_time = new Date().getTime() - _start_time;
console.log(`Total time to run: ${delta_time / 1000} seconds`)
// ============================================================================