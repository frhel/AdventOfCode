// Read in the contents of the data file
const fs = require('fs');
const input = fs.readFileSync('./data/day_2', 'utf8').split('\r\n');

// Define the scoring to a map for easy access
const scoreGuide = new Map([
    ['X', 1],['Y', 2],['Z', 3],
    ['win', 6],['lose', 0],['draw', 3]
]);
const strategyGuide = new Map([['X', 'lose'],['Y', 'draw'],['Z', 'win']]);
// Define the win / lose / draw states to maps for easy access
const loseStates = new Map([['A', 'Z'],['B', 'X'],['C', 'Y'],]);
const drawStates = new Map([['A', 'X'],['B', 'Y'],['C', 'Z'],]);
const winStates = new Map([['A', 'Y'],['B', 'Z'],['C', 'X'],]);

/*******-----------------------------********/
/*******(((((((((( Results ))))))))))********/
/*******-----------------------------********/
let part_1_resultMap = mapAllScores(input);
const part_1_answer = sumAllScores(part_1_resultMap); // Sum all the scores
console.log(part_1_answer); // Log the Part 1 answer

let part_2_resultMap = convertStrategyGuideToResults(input);
const part_2_answer = sumAllScores(part_2_resultMap); // Sum all the scores
console.log(part_2_answer); // Log the Part 2 answer
/*******-----------------------------********/
/*******-----------------------------********/
/*******-----------------------------********/

// fn: Convert the map to array and sum all the values using the reduce method
function sumAllScores(m) {
    return [...m.values()].reduce((a, b) => a + b);
}

// fn: Create a results array from the strategy guide and return a map of the scores
//     by calling the mapAllScores function
function convertStrategyGuideToResults(arr) {
    let resultArr = [];
    for (let i = 0; i < arr.length; i++) {
        // Split the current line into the opponent's choice and my choice
        let [oppChoice, myChoice] = arr[i].split(' ');
        // Get the strategy for the current line from the guide
        switch (strategyGuide.get(myChoice)) {
            case 'win': // If the strategy is to win then change my choice to the state I win to
                resultArr[i] = oppChoice + ' ' + winStates.get(oppChoice); break;
            case 'draw': // If the strategy is to draw then change my choice to the state I draw to
                resultArr[i] = oppChoice + ' ' + drawStates.get(oppChoice); break;
            case 'lose': // If the strategy is to lose then change my choice to the state I lose to
                resultArr[i] = oppChoice + ' ' + loseStates.get(oppChoice); break;
        }
    }
    // Pass in the new array with game results to the mapAllScores function and return the result
    return mapAllScores(resultArr);
}

// fn: Run through the all the results and map each score to the game number(0 indexed)
function mapAllScores(arr) {
    let resultMap = new Map();
    for (let i = 0; i < arr.length; i++) {
        // Split the current line into the opponent's choice and my choice
        let [oppChoice, myChoice] = arr[i].split(' ');
        // Get the score for my choice from the guide
        let myPoints = scoreGuide.get(myChoice);
        switch (myChoice) {
            case drawStates.get(oppChoice): // If the opponent chose the same as me I get 3 points plus the points for my choice
                resultMap.set(i, scoreGuide.get('draw') + myPoints); break;
            case loseStates.get(oppChoice): // If the opponent chose the state I lose to I get 0 points plus the points for my choice
                resultMap.set(i, scoreGuide.get('lose') + myPoints); break;
            case winStates.get(oppChoice): // If the opponent chose the state I win toI get 6 points plus the points for my choice
                resultMap.set(i, scoreGuide.get('win') + myPoints); break;
        }
    }
    return resultMap;
}