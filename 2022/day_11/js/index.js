// ----------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/11
// Solution by: https://github.com/frhel (Fry)
// ----------------------------------------------------------------------------

// -------------------------------- Imports -----------------------------------
const fs = require('fs');
// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline 
// character
const input = fs.readFileSync('../data', 'utf8').split('\n');

// ------------------------------- Solution -----------------------------------
// -------------------------------- Part 1 ------------------------------------
let monkeys_after_business 
    = execute_monkey_business(parse_input(input), 20, false);
let monkey_business_level = calc_monkey_business_level(monkeys_after_business);
console.log('Part 1: Monkey business level: ' + monkey_business_level);

// -------------------------------- Part 2 ------------------------------------
monkeys_after_business 
    = execute_monkey_business(parse_input(input), 10000, true);
monkey_business_level= calc_monkey_business_level(monkeys_after_business);
console.log('Part 2: Monkey business level: ' + monkey_business_level);


// ------------------------------ Functions -----------------------------------
// ----------------------------------------------------------------------------
function execute_monkey_business(monkeys, rounds, panic) {
    for (let i = 0; i < rounds; i++) {
        for (let monkey of monkeys.values()) {
            // Honestly, the only reason I split the function into two is
            // because I'm uncomfortable with too much nesting >_>
            execute_monkey_turn(monkey, monkeys, panic);
        }
    }
    return monkeys;
}

// ----------------------------------------------------------------------------
function execute_monkey_turn(monkey, monkeys, panic) {
    for (let item of monkey.items) {
        let [worry_level, next_monkey] = [0, 0];
        let test_multiple = [...monkeys.values()].reduce((acc, curr) => acc * curr.test, 1);

        
        /*  Parsed the input to use item as a variable in the eval function so
            that we can use the item value in the operation directly

            Took me about 4 hours and a lot of googling to figure out that I
            needed to use a multiple of all the test values to keep the worry
            level within the bounds of the max safe integer. Spent a lot of time
            writing a lot of different solutions that didn't work because I
            didn't understand the problem properly. I'm still not sure why
            this works, but it does, so I'm not going to question it. */        
        worry_level = eval(monkey.operation) % test_multiple;
        
        monkey.inspection_counter += 1;

        // I like to use ~~ to round down because it's shorter than Math.floor
        // and it's faster than Math.floor, and it looks more aesthetically
        // pleasing to me :D
        if (panic !== true)
            worry_level = ~~(worry_level / 3);

        // For clarification, next_monkey becomes a pointer to the next monkey 
        // object in the map, not a copy of the object, so we can modify it
        // directly without having to save it back to the map
        next_monkey = (worry_level % monkey.test === 0) ? 
            monkeys.get(monkey.cases.true) : monkeys.get(monkey.cases.false);

        next_monkey.items.push(worry_level);
    }
    // Because we are going through all the items in the array on every turn,
    // we need to clear the array after we are done with it because the items
    // have been passed on to the next monkey
    monkey.items = [];
    return monkeys;
}

// ----------------------------------------------------------------------------
function calc_monkey_business_level(monkeys) {
    // I like to use the spread operator to convert a map to an array.
    // Then I can use the map function to get the inspection counter for each
    // monkey, sort them in descending order, slice the first two elements,
    // and reduce them to a single value by multiplying them together
    return [...monkeys.values()]
        .map(monkey => monkey.inspection_counter)
        .sort((a, b) => b - a)
        .slice(0, 2)
        .reduce((acc, curr) => acc * curr, 1);        
}



// ------------------------------- Parsers ------------------------------------ 
// ----------------------------------------------------------------------------
function parse_input(input) {
    const monkeys_arr = split_monkeys_by_blank_line(input);
    const monkeys = new Map();
    for (let monkey of monkeys_arr) {
        // Wanted to use an object to hold all the monkey data
        monkey = parse_monkey_notes_into_object(monkey);
        // But a Map to hold all the monkey objects for easier access by
        // integer keys
        monkeys.set(monkey.nr, monkey);
    }
    return monkeys;
}

// ----------------------------------------------------------------------------
// Just a helper function to split the monkeys into separate arrays by the 
// blank line between them
function split_monkeys_by_blank_line(input) {
    let [monkeys, monkey] = [[], []];
    for (let line of input) {
        if (line === '') 
            monkeys.push(monkey), monkey = [];
        else
            monkey.push(line);
    }
    monkeys.push(monkey)
    return monkeys;
}

// ----------------------------------------------------------------------------
// Here is where we parse each monkey into an object
function parse_monkey_notes_into_object(monkey) {
    if (monkey.length !== 6) 
        // Who doesn't love a good error message, even if it's not needed?
        throw new Error('Invalid notes. Expected 6 lines, got ' + monkey.length);

    // The format is always the same, so it's fairly straightforward to parse
    const monkey_obj = {
        nr: parseInt(monkey[0].split(' ')[1].slice(0, -1)),
        items: parse_held_monkey_items(monkey[1]),
        operation: parse_monkey_operation(monkey[2]),
        test: parseInt(monkey[3].split(': ')[1].split(' ').at(-1)),
        cases: {
            true: parseInt(monkey[4].split(': ')[1].split(' ').at(-1)),
            false: parseInt(monkey[5].split(': ')[1].split(' ').at(-1))
        },
        inspection_counter: 0
    };
    return monkey_obj;
}

// ----------------------------------------------------------------------------
// The following functions didn't fit into one line, so I split them out
// of the parse_monkey_notes_into_object function to make it more readable
// and cleaner looking
function parse_held_monkey_items(items) {
    const items_arr = items
        .split(': ')[1]
        .split(', ')
        .map(item => parseInt(item.trim()));
    return items_arr;
}

// ----------------------------------------------------------------------------
function parse_monkey_operation(operation) {
    operation = operation.split(': ')[1];
    operation = operation
        .replace('new = ', '')
        .replace(/old/g, 'item')
    return operation;
}