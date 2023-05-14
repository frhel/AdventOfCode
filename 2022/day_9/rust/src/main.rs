use std::fs::File;
use std::io::{BufRead, BufReader};
use std::collections::HashMap;
use std::collections::HashSet;

fn main() {
    // open the file or panic if it doesn't exist
    let file = File::open("../data").unwrap_or_else(|error| {
        panic!("Error opening file: {}", error);
    });

    // Parse the file into a vector of moves
    let instructions = parse_file_into_moves(file);
    // Parse the instruction vector into a vector of coordinates that the head must visit in order
    let moves = translate_input_moves(instructions);

    
// -------------------------------------------Solution------------------------------------------
    // --------------------------------------- Part 1 ------------------------------------------
    let part_1_tail_moves = collect_tail_moves(moves.clone(), 2);
    let part_1_visited_nodes = extract_unique_nodes(part_1_tail_moves);
    let part_1_num_visited_nodes = part_1_visited_nodes.len();
    println!("Part 1: {}", part_1_num_visited_nodes);

    // --------------------------------------- Part 2 ---------------------------------------
    let part_2_tail_moves = collect_tail_moves(moves.clone(), 10);
    let part_2_visited_nodes = extract_unique_nodes(part_2_tail_moves);
    let part_2_num_visited_nodes = part_2_visited_nodes.len();
    println!("Part 2: {}", part_2_num_visited_nodes);
     
}

// ----------------------------------------------------------------------------------------------
/// Run through all the links and process their moves to get the tail's moves
fn collect_tail_moves(head_moves: Vec<(i32, i32)>, chain_size: usize) -> Vec<(i32, i32)> {
    if chain_size < 2 { panic!("Chain size must be greater than 1"); }
    let starting_point = head_moves[0].clone();

    // For each move of the head, calculate the next link's position in relation to the
    // new head position
    let link_moves: Vec<(i32, i32)> = head_moves.into_iter().skip(1).fold(vec![starting_point], |link_moves, head_move| {
        move_link(link_moves, head_move)
    });

    
    // Recursively call collect_tail_moves until we reach the tail of the chain
    if chain_size > 2 {
        collect_tail_moves(link_moves, chain_size - 1)
    } else {
        link_moves
    }
}

// -------------------------------------------------------------------------------------------
/// Move the link 1 unit in the direction of the head(2 units if the step is diagonal)
/// and return the new link_moves vector
fn move_link(mut link_moves: Vec<(i32, i32)>, head_move: (i32, i32)) -> Vec<(i32, i32)> {
    let (hx, hy) = head_move; // The current head position (the last move in the instructions)
    let (lx, ly) = link_moves.last().unwrap().to_owned(); // The last known position of the link

    // Return early if the link is already 1 unit or less away from the head in any direction
    if (hx - lx).abs() <= 1 && (hy - ly).abs() <= 1 {
        return link_moves;
    }

    // If the link is more than 1 unit in any direction away from the head, move it 1 unit
    // in the direction of the head(2 units if the link is diagonal from where it needs to move)
    let mut new_link_move: (i32, i32) = (lx, ly);
    if hx != lx { new_link_move.0 = if hx > lx { new_link_move.0 + 1 } else { new_link_move.0 - 1 }; }
    if hy != ly { new_link_move.1 = if hy > ly { new_link_move.1 + 1 } else { new_link_move.1 - 1 }; }

    // push the new link move onto the link_moves vector and return it
    link_moves.push(new_link_move);
    link_moves
}

// -------------------------------------------------------------------------------------------
/// Parse a vector of steps into a vector of unique nodes that the tail has visited
fn extract_unique_nodes(input_vec: Vec<(i32, i32)>) -> Vec<(i32, i32)> {
    // This function gave me a lot of headache... I'm sure there's a better way to do this?
    // Basically I'm converting the input vector into a HashSet to remove duplicates, then
    // converting the HashSet back into a vector to return
    let unique_nodes: Vec<(i32, i32)> = input_vec.into_iter()
        .collect::<HashSet<(i32, i32)>>().into_iter().collect();
    let output_nodes: Vec<(i32, i32)> = unique_nodes.into_iter().map(|node| node).collect();
    output_nodes
}

// -------------------------------------------------------------------------------------------
/// Parse the file into a vector of steps, represented as a tuple of the x, y coordinates
/// for each step
fn translate_input_moves(moves: Vec<(String, i32)>) -> Vec<(i32, i32)> {
    let mut translated_moves: Vec<(i32, i32)> = Vec::new();
    translated_moves.push((0, 0)); // Head starting position
    let dir_map = DirMap::new();
    for (dir, dist) in moves {
        // Get the x and y increments for the direction of the move
        let (x, y) = dir_map.get(dir.as_str()).unwrap_or_else(|| {
            // Already validated in parse_file_into_moves, so this should never happen
            panic!("Invalid direction: {}", dir);
        });

        for _ in 0..dist {
            // Add the next coordinate to the list of moves by incrementing the previous coordinate
            // by 1 in the direction of the move
            translated_moves.push((translated_moves.last().unwrap().0 + x, translated_moves.last().unwrap().1 + y));
        }
    }
    translated_moves
}

// -------------------------------------------------------------------------------------------
/// Parse the file into a vector of moves (direction, distance)
/// Example: "R 5" -> ("R", 5)
fn parse_file_into_moves(file: File) -> Vec<(String, i32)> {
    let mut moves: Vec<(String, i32)> = Vec::new();
    let reader = BufReader::new(file);
    let dir_map = DirMap::new();
    for line in reader.lines() {
        let line = line.unwrap_or_else(|error| {
            panic!("Error reading line: {}", error);
        });
        // To split the line and convert it to a vector of tuples of type (String, i32)
        // Rust requires the line to be converted to an iterator first, and take ownership of it
        // and then deal with each element of the iterator individually with the iterator methods
        // (next, collect, etc.) ... This was a headache to figure out :D
        let mut parts = line.split(" ").to_owned();

        let dir: String = String::from(parts.next().unwrap());
        if dir_map.get(dir.as_str()).is_none() {
            panic!("Invalid direction: {}", dir);
        }
        let steps: i32 = match parts.next().unwrap().parse() {
            Ok(num) => num,
            Err(error) => panic!("Error parsing steps as i32: {}", error),
        };
        moves.push((dir, steps));
    }
    moves
}

// -------------------------------------------------------------------------------------------
// define a hashmap struct to store L, R, U, D directions with their x and y increments
struct DirMap {
    map: HashMap<&'static str, (i32, i32)>,
}
impl DirMap {
    fn new() -> Self {
        DirMap {
            // populate the hashmap with the directions and their x and y increments
            map: {
                let mut m = HashMap::new();
                m.insert("L", (0, -1));
                m.insert("R", (0, 1));
                m.insert("U", (1, 0));
                m.insert("D", (-1, 0));
                m                
            },
        }
    }
    fn get(&self, key: &str) -> Option<&(i32, i32)> {
        self.map.get(key)
    }
}
