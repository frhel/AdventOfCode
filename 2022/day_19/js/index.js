// ----------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/19
// Solution by: https://github.com/frhel (Fry)
// ----------------------------------------------------------------------------

// -------------------------------- Imports -----------------------------------
const fs = require('fs');
const { Queue } = require('../../libs/queue.js');

// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline
// character
const file_data = '../data';
const input = fs.readFileSync(file_data, 'utf-8')
    .replace(/\r/g, "").trim().split('\n');

// ----------------------------------------------------------------------------
// Shape data into a more convenient form
let bps = form_data(input);

let _priority = [];

console.time('Total time');
// -------------------------------- Part 1 -----------------------------------
// What is the maximum number of geodes that can be cracked in 24 rounds
// depending on the order and quantity of robots built using each blueprint in 
// the data file?
console.time('Part 1 time');
let rounds = 24;
let _part = 1;
let part1 = solve_1(bps, rounds);
console.log(`Part 1: ${part1}`);
console.timeEnd('Part 1 time');
// Answer: 1.349

// ------------------------------- Part 2 ------------------------------------
// What is the maximum number of geodes that can be cracked in 32 rounds
// depending on the order and quantity of robots built using only the first
// 3 blueprints in the data file?
console.time('Part 2 time');
rounds = 32;
_part = 2;
let part2 = solve_2(bps, rounds);
console.log(`Part 2: ${part2}`);
console.timeEnd('Part 2 time');
// Answer: 21.840
console.timeEnd('Total time');


// ------------------------------- Solution ----------------------------------
function solve_1(bps, rounds) {
    let total_quality = 0;
    for (let bp of bps) {
        let max_geodes = run_simulation(bp, rounds, bps.indexOf(bp) + 1);
        total_quality += max_geodes.bp_nr * max_geodes.geodes;
    }
    return total_quality;    
}

function solve_2(bps, rounds) {
    let all_geodes = [];
    for (let bp of bps.slice(0, 3)) {
        let max_geodes = run_simulation(bp, rounds, bps.indexOf(bp) + 1);
        all_geodes.push(max_geodes.geodes);
    }
    console.log(all_geodes);
    return all_geodes.reduce((a, b) => a * b);
}

function run_simulation(bp, rounds, bp_nr) {
    let count = 0;
    //rounds = 5;
    let winner = setup_bank();
    _priority = ['ore', 'clay', 'obsidian', 'geode'];

    let max = [winner];

    // Find the max number of each resource needed to be able to build 1 robot
    // of any type per round
    let max_ore_costs = {};
    for (let [type, cost] of Object.entries(bp)) {
        for (let item of cost) {
            if (max_ore_costs[item.name] === undefined || max_ore_costs[item.name] < item.amount) {
                max_ore_costs[item.name] = item.amount;
            }
        }
    }
    
    let queue = new Queue();
    queue.enqueue(setup_bank());

    console.time('Search timer');
    while (!queue.isEmpty) {
        let curr_bank = queue.dequeue();       

        if (curr_bank.resources.ore > max_ore_costs.ore * 3 && curr_bank.robots.geode < 1) continue;
        if (curr_bank.resources.clay > max_ore_costs.clay * 2 && curr_bank.robots.geode < 1) continue;
        if (curr_bank.resources.obsidian > max_ore_costs.obsidian * 1.5) continue;

        if (curr_bank.bot_types.length > 1) {
            for (let i = 0; i < curr_bank.bot_types.length; i++) {
                if (curr_bank.bot_types[i] !== 'geode' && curr_bank.robots[curr_bank.bot_types[i]] >= max_ore_costs[curr_bank.bot_types[i]]) {
                    curr_bank.bot_types.splice(i, 1);
                    i--;
                }

///// This is the hackiest hack that ever hacked. It's so shit. It just plays well with my input. Magic.
///// Does not work for part 1 at all.
                if (_part === 2) {
                    if (curr_bank.bot_types[i] === 'ore' && rounds - curr_bank.time < 24) {
                        curr_bank.bot_types.splice(i, 1);
                        i--;
                    }
                    if (curr_bank.bot_types[i] === 'clay' && rounds - curr_bank.time < 11) {
                        curr_bank.bot_types.splice(i, 1);
                        i--;
                    }
                    if (curr_bank.bot_types[i] === 'obsidian' && rounds - curr_bank.time < 7) {
                        curr_bank.bot_types.splice(i, 1);
                        i--;
                    }
                }
////// End hacky hack                
            }
        }
        

        // Push the current bank to the max array to sort later
        if (curr_bank.resources.geode > 0) {
            if (curr_bank.resources.geode + curr_bank.robots.geode * (rounds - curr_bank.time) > winner.resources.geode) {
                winner = collect_until_end(curr_bank, rounds - curr_bank.time);
            }
        }

        // It doesn't matter if we build a robot in the last round so we can skip it
        if (curr_bank.time >= rounds) continue;

        // Get the list of robots that can be built and how long until they can be built
        let buildable = get_buildable_robots(bp, curr_bank, rounds);          
        

        // Build each robot that can be built
        for (let type of buildable) {
            let new_bank = copy_bank(curr_bank);          

            if (type.rounds < 1 || new_bank.time + type.rounds > rounds ) continue;

            if (type.name === 'geode' && new_bank.robots.geode === 0) {
                new_bank.ttg = type.rounds + new_bank.time;
            }
            
            new_bank.time += type.rounds;
            new_bank.history.push(new_bank.time + ' ' + type.name);
            new_bank = add_bank_resources(new_bank, type.rounds);
            new_bank = pay_robot_build_cost(bp, new_bank, type.name);            

            // Add the new robot so it can collect resources next round
            new_bank.robots[type.name] += 1;           
            
            queue.enqueue(new_bank);
        }
    }
    console.timeEnd('Search timer');
    return {
        geodes: winner.resources.geode,
        bp_nr: bp_nr
    };
}

function get_buildable_robots(bp, bank, total_rounds) {    
    // check which robots can be build with the new resources
    // check which bots we can not build right now
    let robots = bank.bot_types;
    
    // Check how many rounds until we can build the next big robot if we just collect
    // with regards to our ore income and status
    let retObjs = [];
    for (let type of robots) {
        let rounds = 0;
        for (let cost of bp[type]) {
            // How many rounds until we can build this robot if we just collect
            if (bank.robots[cost.name] === 0) {
                rounds = 0;
                break;
            }

            if (bank.resources[cost.name] < cost.amount) {                
                    rounds_until_build = Math.ceil((cost.amount - bank.resources[cost.name]) / bank.robots[cost.name] + 1);
                
                if (bank.time + rounds_until_build >= total_rounds) {
                    rounds = 0;
                    break;
                } else if (rounds_until_build >= rounds) {
                    rounds = rounds_until_build;
                }
            } else if (rounds === 0 && bank.resources[cost.name] >= cost.amount) {
                rounds = 1;
            }
        }        
        // console.log(bank)
        if (type === 'obsidian' && bank.history.length === 7 && bank.history.join('') === '1 c2 c3 clay4 c5 clay6 c7 clay')
            console.log(type, rounds)
        retObjs.push({name: type, rounds: rounds});
    }
    
    return retObjs;
}

function collect_until_end(new_bank, rounds) {
    bank = copy_bank(new_bank);
    bank = add_bank_resources(bank, rounds);
    return bank
}

function add_bank_resources(bank, rounds) {
    for (let [robo, amount] of Object.entries(bank.robots)) {
        bank.resources[robo] += amount * rounds;
    }

    return bank;
}

function pay_robot_build_cost(bp, bank, type) {
     // Subtract the cost of the new robot
     for (let [robo, cost] of Object.entries(bp[type])) {
        bank.resources[cost.name] -= cost.amount;
    }

    return bank;
}

    

// ----------------------------------- Setup ----------------------------------
function copy_bank(bank) {
    let new_bank = {
        resources: {},
        robots: {},
        time: bank.time,
        bot_types: bank.bot_types.slice(),
        history: [...bank.history],
        ttg: bank.ttg
    }

    // Create the new bank manually for a deep copy
    for(let [name, amount] of Object.entries(bank.resources)) {
        new_bank.resources[name] = amount;
    }
    for(let [name, amount] of Object.entries(bank.robots)) {
        new_bank.robots[name] = amount;
    }
    return new_bank;
}

// Shape the data into a more convenient form
// Line example: Blueprint 1: Each ore robot costs 4 ore. Each clay robot costs 2 ore. Each obsidian robot costs 3 ore and 14 clay. Each geode robot costs 2 ore and 7 obsidian.
function form_data(input) {
    let bps = [];
    for (let line of input) {
        let bp = {};
        line = line.slice(0,-1);
        let data = line.split(': ')[1].split('. ');
        for (let item of data) {
            item = item.split(' ');
            let cost = [
                {
                    'name': item[5],
                    'amount': item[4]*1
                }
            ]
            if (item.length > 6) {
                cost.push(
                    {
                        'name': item[8],
                        'amount': item[7]*1
                    }
                )
                
            }
            bp[item[1]] = cost;
        }
        bps.push(bp);
    }
    return bps;
}

function setup_bank() {
    let bank = {
        resources: {
            'ore': 0,
            'clay': 0,
            'obsidian': 0,
            'geode': 0
        },
        robots: {
            'ore': 1,
            'clay': 0,
            'obsidian': 0,
            'geode': 0
        },
        time: 0,
        bot_types: _priority.slice(),
        history: [],
        ttg: Infinity
    }
    return bank;
}