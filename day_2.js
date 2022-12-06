const fs = require('fs');
// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline character
const input = fs.readFileSync('./data/day_2', 'utf8').split('\r\n');

// Define the scoring to a map for easy access
const scoreGuide = new Map([
    ['X', 1],['Y', 2],['Z', 3],
    ['win', 6],['lose', 0],['draw', 3]
]);

// Define the strategy guide for part 2
const strategyGuide = new Map([['X', 'lose'],['Y', 'draw'],['Z', 'win']]);

// Define the win / lose / draw states to maps for easy access
const loseStates = new Map([['A', 'Z'],['B', 'X'],['C', 'Y'],]);
const drawStates = new Map([['A', 'X'],['B', 'Y'],['C', 'Z'],]);
const winStates = new Map([['A', 'Y'],['B', 'Z'],['C', 'X'],]);

// ---------------------------------------------------------------------------------------------
// The answer to part 1
console.log(`The answer to part 1 is: ${solveChallenge(input)}`);

// ---------------------------------------------------------------------------------------------
// The answer to part 2
console.log(`The answer to part 2 is: ${solveChallenge(convertStrategyGuideToResults(input))}`);

// ---------------------------------------------------------------------------------------------
// fn: Solve challenge with game results as input
function solveChallenge(gameResults) {
    // Create a map of the scores for each game
    let scoreMap = scoreGames(gameResults);

    // Return a sum of all the scores
    return sumAllScores(scoreMap); 
}

// ---------------------------------------------------------------------------------------------
// fn: Convert the map to array and sum all the values using the reduce method
function sumAllScores(m) {
    return [...m.values()].reduce((a, b) => a + b);
}

// ---------------------------------------------------------------------------------------------
// fn: Convert the strategy guide to a list of game results
function convertStrategyGuideToResults(arr) {
    let resultArr = [];
    for (let i = 0; i < arr.length; i++) {
        // Split the current line into the opponent's choice and my choice
        let [oppChoice, myChoice] = arr[i].split(' ');

        // Get the strategy for the current line from the guide and use it to change it
        // from a score guide to a game result
        switch (strategyGuide.get(myChoice)) {
            case 'win':
                resultArr[i] = oppChoice + ' ' + winStates.get(oppChoice); break;
            case 'draw':
                resultArr[i] = oppChoice + ' ' + drawStates.get(oppChoice); break;
            case 'lose':
                resultArr[i] = oppChoice + ' ' + loseStates.get(oppChoice); break;
        }
    }
    // Pass in the new array with game results to the scoreGames function and return the result
    return resultArr;
}

// ---------------------------------------------------------------------------------------------
// fn: Run through the all the results and map each score to the game number(0 indexed)
function scoreGames(arr) {
    let resultMap = new Map();

    // Iterate through all the games
    for (let i = 0; i < arr.length; i++) {
        // Split the current line into the opponent's choice and my choice
        let [oppChoice, myChoice] = arr[i].split(' ');

        // Get the score for my choice from the guide
        let myPoints = scoreGuide.get(myChoice);
        switch (myChoice) {
            // Check my choice against the win / lose / draw states using the opponent's
            // choice as the key to get the result. Then match my choice against the score
            // guide to get the score for my choice. Add the score for my choice to the
            // score for the result to get the total score for the game and store it in
            // the map with the game number as the key
            case drawStates.get(oppChoice): 
                resultMap.set(i, scoreGuide.get('draw') + myPoints); break;
            case loseStates.get(oppChoice): 
                resultMap.set(i, scoreGuide.get('lose') + myPoints); break;
            case winStates.get(oppChoice): 
                resultMap.set(i, scoreGuide.get('win') + myPoints); break;
        }
    }
    return resultMap;
}