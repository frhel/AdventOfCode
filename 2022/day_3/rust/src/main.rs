use std::fs::File;
use std::io::{BufRead, BufReader, Lines};

fn main() {

    // -----------------------------------------------------------------------------------------------
    // open the file or panic if it doesn't exist
    let file = File::open("../data").unwrap_or_else(|error| {
        panic!("Error opening file: {}", error);
    });

    // -----------------------------------------------------------------------------------------------
    // Format the file contents into a vector of strings
    let vec_data = format_file_contents(file);

    // -----------------------------------------------------------------------------------------------
    // Solve part 1
    let part_1_answer = solve_part_1(vec_data.clone());
    println!("Part 1 solution: {}", part_1_answer);

    // -----------------------------------------------------------------------------------------------
    // Solve part 2
    let part_2_answer = solve_part_2(vec_data.clone());
    println!("Part 2 solution: {}", part_2_answer);

}



// -----------------------------------------------------------------------------------------------
// Solve part 1 by finding the common characters in each string, then converting them to their
// ASCII values, shifting the values and summing them.
fn solve_part_1(vec_data: Vec<String>) -> i32 {
    let data = vec_data
        .iter()
        // Split each string into a tuple of (left, right)
        .map(|s| s.split_at(s.len() / 2))
        // Co through each tuple and find the common character
        .map(|(left, right)| {
            left
            // For each char in the left string
            .chars()
            // Find the first matching char in the right string
            .find(|c1| right.chars().any(|c2| c1 == &c2))
        })
        .collect::<Vec<_>>();

    // Return the sum of the data
    sum_data(data)
}

// -----------------------------------------------------------------------------------------------
// Solve part 2 by dividing the Vec into sets of 3, then finding the common characters in each
// string, then converting them to their ASCII values, shifting the values and summing them.
fn solve_part_2(vec_data: Vec<String>) -> i32 {
    let data = vec_data
        // Grab every 3 strings
        .chunks(3)
        // Find the only common character between all 3 strings
        .map(|chunk| {
            // Split the Vec into chunks of 3
            chunk[0]
                // For each char in the first string
                .chars()
                // Filter out any chars that aren't in the second string
                .filter(|c1| chunk[1].chars().any(|c2| c1 == &c2))
                // Then Find the char that is also in the third string
                .find(|c1| chunk[2].chars().any(|c2| c1 == &c2))
                // Return the char
        })
        .collect::<Vec<_>>();

    // Return the sum of the data
    sum_data(data)

}

// -----------------------------------------------------------------------------------------------
// Sum the data by converting the chars to their ASCII values, shifting the values and summing them.
fn sum_data(data: Vec<Option<char>>) -> i32 {
    data
        .into_iter()
        // unwrap the option to get the string and convert it to an i32
        .map(|c| c.unwrap() as i32)
        // Convert the char to an i32  and subtract 96 to get the value of the char
        // where 'a' = 1, 'b' = 2, etc and subtract 38 to get the value of the char
        // where 'A' = 27, 'B' = 28, etc
        .map(|c| if c - 96 < 1 { c - 38 } else { c - 96 })

        // Sum all the results
        // Omit the ; to return tdirectly from the closure
        .sum()
}


// -----------------------------------------------------------------------------------------------
/// Creates a vector of game outcomes from an input file
fn format_file_contents(file: File) -> Vec<String> {
    let reader = BufReader::new(file);
    let lines: Lines<BufReader<File>> = reader.lines();

    // Return the lines as a Vec
    lines
        // For each line
        .map(|line| {
            // Unwrap the line
            line.unwrap_or_else(|error| {
                panic!("Error reading line: {}", error);
            })
        })
        // Return the Vec
        .collect::<Vec<_>>()
}
