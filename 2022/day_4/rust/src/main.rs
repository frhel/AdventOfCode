use std::fs::File;
use std::io::{BufRead, BufReader, Lines};

fn main() {

    // ------------------------------------------------------------------------
    // open the file or panic if it doesn't exist
    let file = File::open("../data").unwrap_or_else(|error| {
        panic!("Error opening file: {}", error);
    });

    // ------------------------------------------------------------------------
    // Format the file contents into a vector of strings
    let vec_data = format_file_contents(file);

    // ------------------------------------------------------------------------
    // Solve part 1
    let part_1_answer = solve_part_1(vec_data.clone());
    println!("Part 1 solution: {}", part_1_answer);

    // ------------------------------------------------------------------------
    // Solve part 2
    let part_2_answer = solve_part_2(vec_data.clone());
    println!("Part 2 solution: {}", part_2_answer);
}

// ----------------------------------------------------------------------------
// Solve part 1
fn solve_part_1(vec_data: Vec<Vec<i32>>) -> i32 {
    let mut valid_count = 0;
    for v in vec_data.iter() {
        let mut contained = false;
        if v[0] >= v[2] && v[1] <= v[3] {
            contained = true;
        } else if v[2] >= v[0] && v[3] <= v[1] {
            contained = true;
        }
        if contained {
            valid_count += 1;
        }
    }
    valid_count
}


// ----------------------------------------------------------------------------
// Solve part 2
fn solve_part_2(vec_data: Vec<Vec<i32>>) -> i32 {
    let mut valid_count = 0;
    for v in vec_data.iter() {
        let mut contained = false;
        if (v[0] >= v[2] && v[0] <= v[3]) || (v[1] >= v[2] && v[1] <= v[3]) {
            contained = true;
        } else if (v[2] >= v[0] && v[2] <= v[1]) || (v[3] >= v[0] && v[3] <= v[1]) {
            contained = true;
        }
        if contained {
            valid_count += 1;
        }
    }

    valid_count
}



// ----------------------------------------------------------------------------
// Formats the file contents according to the specs
fn format_file_contents(file: File) -> Vec<Vec<i32>> {
    let reader = BufReader::new(file);
    let lines: Lines<BufReader<File>> = reader.lines();

    // split each line into a tuple of 4 i32 value
    let mut vec_data: Vec<Vec<i32>> = Vec::new();
    for line in lines {
        let line = line.unwrap();
        let split: Vec<&str> = line.split(",").collect();
        // split each split by - and parse into i32
        let mut split_line = Vec::new();
        for s in split.iter() {
            let split_dash: Vec<&str> = s.split("-").collect();
            let first: i32 = split_dash[0].parse().unwrap();
            let second: i32 = split_dash[1].parse().unwrap();
            split_line.push(first);        
            split_line.push(second);
        }
        vec_data.push(split_line);    
    }
    
    vec_data
    
}
