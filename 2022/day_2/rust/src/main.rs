use std::fs::File;
use std::io::{BufRead, BufReader};

fn main() {
    // -----------------------------------------------------------------------------------------------
    // define all the codexes
    let score_table = ScoreTable {a: 1, b: 2, c: 3, win: 6, draw: 3, loss: 0};
    let moves_codex = MovesCodex {x: "a".to_string(), y: "b".to_string(), z: "c".to_string(),};
    let strategy_codex = StrategyCodex {a: "lose".to_string(), b: "draw".to_string(), c: "win".to_string(),};
    let win_states = WinStates {a: "c".to_string(), b: "a".to_string(), c: "b".to_string(),};
    let lose_states = LoseStates {a: "b".to_string(), b: "c".to_string(), c: "a".to_string(),};

    // open the file or panic if it doesn't exist
    let file = File::open("../data").unwrap_or_else(|error| {
        panic!("Error opening file: {}", error);
    });

    // -----------------------------------------------------------------------------------------------
    // create a vector of games from the file. Each game is a tuple of (opponent_move, my_move)
    let games = create_vec_of_games(file);

    // -----------------------------------------------------------------------------------------------
    // translate my moves to be a, b, or c instead of x, y, or z
    let translated_games = translate_moves(games, moves_codex);

    // -----------------------------------------------------------------------------------------------
    // calculate the total score for part 1
    let total_scores = calculate_total_scores(&translated_games, &score_table, &win_states);
    println!("Part 1 score is {}", total_scores);

    // -----------------------------------------------------------------------------------------------
    // calculate the total score for part 2
    // translate my moves to be what they need to be based on the strategy codex
    let translated_games = translate_strategy_to_moves(&translated_games, &strategy_codex, &win_states, &lose_states);
    let total_scores = calculate_total_scores(&translated_games, &score_table, &win_states);
    println!("Part 2 score is {}", total_scores);

}

// -----------------------------------------------------------------------------------------------
// translate my moves to be representative of the strategy codex's rules
fn translate_strategy_to_moves(translated_games: &Vec<(String, String)>, strategy_codex: &StrategyCodex, win_states: &WinStates, lose_states: &LoseStates) -> Vec<(String, String)> {
    let mut translated_moves: Vec<(String, String)> = Vec::new();
    for game in translated_games {
        let (opponent_move, my_move) = game;
        let mut my_move = my_move.to_string();
        if strategy_codex.get(&my_move) == "lose" {
            my_move = win_states.get(&opponent_move).to_string();
        } else if strategy_codex.get(&my_move) == "draw" {
            my_move = opponent_move.to_string();
        } else {
            my_move = lose_states.get(&opponent_move).to_string();}
        translated_moves.push((opponent_move.to_string(), my_move));
    }
    translated_moves
}

// -----------------------------------------------------------------------------------------------
// translate my moves to be a, b, or c instead of x, y, or z
fn translate_moves(moves: Vec<(String, String)>, moves_codex: MovesCodex) -> Vec<(String, String)> {
    let mut translated_moves: Vec<(String, String)> = Vec::new();
    for game in moves {
        let (opponent_move, my_move) = game;
        let translated_my_move = moves_codex.get(&my_move).to_string();
        translated_moves.push((opponent_move, translated_my_move));
    }
    translated_moves
}

// -----------------------------------------------------------------------------------------------
/// Calculates the total score for all games
fn calculate_total_scores(games: &Vec<(String, String)>, score_table: &ScoreTable, win_states: &WinStates) -> i32 {
    let mut accumulator = 0;

    // iterate through the games vector
    for game in games {
        let (opponent_move, my_move) = game;
        let score = calculate_game_score(&opponent_move, &my_move, &score_table, &win_states);
        accumulator += score;
    }
    accumulator
}

// -----------------------------------------------------------------------------------------------
/// Calculates the score for a single game
fn calculate_game_score(opponent_move: &str, my_move: &str, score_table: &ScoreTable, win_states: &WinStates) -> i32 {
    let mut score: i32;
    if opponent_move == my_move {
        score = score_table.draw;
    } else if win_states.get(&opponent_move) == my_move {
        score = score_table.loss;
    } else {
        score = score_table.win;
    }
    score += score_table.get(&my_move);
    score
}

// -----------------------------------------------------------------------------------------------
/// Creates a vector of game outcomes from an input file
fn create_vec_of_games(file: File) -> Vec<(String, String)> {
    let mut games: Vec<(String, String)> = Vec::new();
    let reader = BufReader::new(file);
    for line in reader.lines() {
        let line = line.unwrap_or_else(|error| {
            panic!("Error reading line: {}", error);
        });

        // split string and trim whitespace from each element and convert to lowercase if needed
        let mut game = line.split_whitespace().map(|s| s.trim().to_lowercase());

        let opponent_move = game.next().unwrap_or_else(|| {
            panic!("Error reading opponent move");
        });
        let my_move = game.next().unwrap_or_else(|| {
            panic!("Error reading my move");
        });

        games.push((opponent_move.to_owned(), my_move.to_owned()));
    }
    games
}


// -----------------------------------------------------------------------------------------------
// Create a struct to hold the score table
struct ScoreTable {
    a: i32, b: i32, c: i32, win: i32, draw: i32, loss: i32,
}
impl ScoreTable {
    fn get(&self, key: &str) -> i32 {
        match key {
            "a" => self.a, "b" => self.b, "c" => self.c,
            "win" => self.win, "draw" => self.draw, "loss" => self.loss,
            _ => 0,
        }
    }
}

// -----------------------------------------------------------------------------------------------
// Create a struct to holds translations so I can use the same code for both players
struct MovesCodex {
    x: String, y: String, z: String,
}
impl MovesCodex {
    fn get(&self, key: &str) -> &String {
        match key {
            "x" => &self.x, "y" => &self.y, "z" => &self.z,
            _ => &self.x,
        }
    }
}

// -----------------------------------------------------------------------------------------------
// Create a struct to hold the strategy codex
struct StrategyCodex {
    a: String, b: String, c: String,
}
impl StrategyCodex {
    fn get(&self, key: &str) -> &String {
        match key {
            "a" => &self.a, "b" => &self.b, "c" => &self.c,
            _ => &self.a,
        }
    }
}

// -----------------------------------------------------------------------------------------------
// Create a struct to hold a rock paper scissor win / lose matrix based on the following rules:
// Opponent: A = rock, B = paper, C = scissors
// Me:       X = rock, Y = paper, Z = scissors
// A beats Z, B beats X, C beats Y
struct WinStates {
    a: String, b: String, c: String,
}
impl WinStates {
    fn get(&self, key: &str) -> &String {
        match key {
            "a" => &self.a, "b" => &self.b, "c" => &self.c,
            _ => &self.a,
        }
    }
}
struct LoseStates {
    a: String, b: String, c: String,
}
impl LoseStates {
    fn get(&self, key: &str) -> &String {
        match key {
            "a" => &self.a, "b" => &self.b, "c" => &self.c,
            _ => &self.a,
        }
    }
}
