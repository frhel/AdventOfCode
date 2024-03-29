const fs = require('fs');

// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline character
const input = fs.readFileSync('../data', 'utf8').split('\n');

// ------------------------------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/5
// ------------------------------------------------------------------------------------------------

// Extract the initial stack of instructions by splitting the input on the empty line.
// We can skip the numbering of the stacks as we can just infer the number of stacks
// from the the number of items per row of input.
let stacksInput = input.splice(0, input.indexOf('')-1);

// Extract the instructions from the input using the same method as above
let instructions = input.splice(input.indexOf('')+1);

// ----------------------------------------------------------------------------------
// Build the solution for part 1
console.log(`Part 1 solution: ${solve(stacksInput, instructions)}`);

// ----------------------------------------------------------------------------------
// Build the solution for part 2
console.log(`Part 2 solution: ${solve(stacksInput, instructions, true)}`);

// ----------------------------------------------------------------------------------
// fn: solve() moves the items between stacks according to the given instructions
//     and returns the solution based on the mutated stacks.
//     We have a preserveOrder parameter to allow us to move the items between stacks 
//     with either a first-in-first-out or last-in-first-out approach.
function solve(stacks, instructions, preserveOrder = false) {
    // Start by converting the stacks input into a map of actual stacks that we can
    // manipulate and return at the end of the function.
    stacks = buildStacksMap(stacks);

    // Iterate over the instructions
    for (let i = 0; i < instructions.length; i++) {
        // Extract the instruction by splitting on the space
        let instruction = instructions[i].split(' ');

        // Save the numeric parts of the instruction to variables and throw away the rest.
        // We do this by using map() to convert the array of strings into an array of numbers
        // and then filtering out the NaN values. Then we can use the destructuring assignment
        // to save the values to variables.
        let [moves, stackName, targetName] = instruction.map(Number).filter(n => !isNaN(n));

        // Get the stack and target we are working with in this iteration of the loop
        let stack = stacks.get(stackName), target = stacks.get(targetName);

        // If we are preserving the order of the items, we will use a temporary stack to
        // hold the items we are moving. This is because we will be using the Array.pop()
        // method to move the items, which will reverse the order of the items in the stack.
        let tempStack = [];

        // Execute the moves
        while (moves > 0) {
            // If we are preserving the order of the items, we will save the items to a temporary array
            // and then push them onto the target stack in reverse order. Otherwise we can just push
            // the items onto the target stack directly.
            if (preserveOrder) 
                tempStack.push(stack.pop());
            else 
                target.push(stack.pop());
            moves--;
        }
        // If we saved the items to a temporary array, we will now push them onto the target stack
        // in reverse order.
        if (preserveOrder) {
            while (tempStack.length > 0)
                target.push(tempStack.pop());
        }        
        /*  
            The Array.pop() method does 2 things for us at the same time. It removes the last item
            from an array AND returns its value to us. This allows us to simplify the process of
            moving the items between stacks, as we can just push the value of the result of the
            pop() method onto the target stack directly.
        */
    }

    // Return the solution string
    return buildSolutionString(stacks);
}

// ----------------------------------------------------------------------------------
// fn: buildSolutionString() builds the solution string
function buildSolutionString(stacks) {
    // Destructure the stacks map into an array of stacks and then pop the last element
    // off each stack with the .map() method. Finish off by joining the values of the
    // resulting array to build and return the solution string.
    return [...stacks.values()].map(stack => stack.pop()).join('');
}

// ----------------------------------------------------------------------------
// fn: buildStacksMap() converts the stacks input into a numbered map of stacks
function buildStacksMap(stacksInput) {
    // We can use a map to store the stacks so we are able to access them
    // directly by stack name, or number in this case.
    let stacks = new Map();

    /*
        Because we're building stacks from the input, we are going to build 
        them in reverse order. This is because the stacks are a last in first 
        out data structure, so we want the bottom items to be the first items in.
        This is the reason why we are counting backwards from the length of the
        stacksInput array instead of the usual 0 to length.

        This means we can simplify our operations later when it is time to
        move the items around, because we will only have to worry about
        using the Array.push() and Array.pop() methods to manipulate the stacks.
    */
    for (let i = stacksInput.length-1; i >= 0; i--) {
        // Get the current row of the input to work with
        let line = stacksInput[i];
        
        // Declare a counter to keep track of which stack we're currently on
        // during the loop where we process the row of items to push onto each stack
        let stackNumber = 1;

        // Now we will chop the current row's string representation up into individual 
        // items and push them onto their respective stacks until the string is empty
        while (line.length > 0) {
            // We know each item is 1 characters long, with 1 bracket on each side, so we can use
            // the substr() method to get the 2nd character of the string and push it onto the 
            // relevant stack
            let item = line.substr(1, 1);

            // We already saved the current item to a variable, so we can remove it from the string
            // by using the substring method again, but this time we use the length of the item(1) 
            // plus the surrounding brackets(2) as well as the length of the whitespace(1) that is used
            // to separate items of each row. This will yeet the part of the string we have already
            // processed so we can work from the start of the string again in the next iteration of the loop.
            line = line.slice(4);

            // Check if the input is empty. Move on to the next stack if it is.
            if (item !== ' ') {
                // Get the current stack from the map, or create a new one if it doesn't exist
                let stack = stacks.get(stackNumber) || [];

                // Push the item onto the stack
                stack.push(item);
                
                // Save the stack back to the map  
                stacks.set(stackNumber, stack);
            }

            // The counter is only here to keep track of which stack we're on
            // so we will increment it no matter if the item is empty or not
            stackNumber++; 
        }
    }
    return stacks;
}