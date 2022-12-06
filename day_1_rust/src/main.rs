use std::fs::File;
use std::io::{BufRead, BufReader};
use std::collections::HashMap;

// -----------------------------------------------------------------------------------------------
/// This program reads a file containing a list of integer clusters and calculates the sum of
/// each cluster. The clusters are separated by a blank line. The program attributes each cluster
/// sum to an elf and then delivers the value of the largest sum as a solution for part 1
/// and the sum of the top 3 elves as a solution for part 2.
/// 
/// # Arguments
/// * None
/// 
/// # Returns
/// * None
///     
/// # Panics
/// * `panic!` - If the file cannot be opened
/// * `panic!` - If a line cannot be read from the file
fn main() {
    // open the file or panic if it doesn't exist
    let file = match File::open("../data/day_1") {
        Ok(file) => file,
        Err(error) => panic!("Error opening file: {}", error),
    };   

    // Save the file contents into a hashmap where the key is the elf designation number
    // and the value is the sum of the calories for that elf
    let elf_map = create_hashmap_from_file(file);

    // Sort the hashmap by value and return a vector of tuples
    let sorted_calories = sort_hashmap_desc(elf_map);

    // -----------------------------------------------------------------------------------------------
    // Part 1 solution - print only the first calorie entry in the sorted vector
    let (key, value) = sorted_calories[0];
    println!("Elf {} has the highest calorie count of {}", key, value);

    // -----------------------------------------------------------------------------------------------
    // Part 2 solution  - print the sum of the first 3 calorie entries in the sorted vector
    let mut sum = 0;
    for i in 0..3 {
        let (_key, value) = sorted_calories[i];
        sum += value;
    }
    println!("The sum of the top 3 elves is {}", sum);

}


// -----------------------------------------------------------------------------------------------
/// Sorts a hashmap by value in descending order
///
/// # Arguments
/// * `map` - A hashmap of i32 keys and i32 values
/// 
/// # Returns
/// * `vec` - A vector of tuples where the first element is the key and the second element is 
/// the value
fn sort_hashmap_desc(map: HashMap<i32, i32>) -> Vec<(i32, i32)> {
    // create a vector of tuples from the hashmap and take ownership of the values
    let mut vec: Vec<_> 
        = map
            .iter()
            .map(|(k, v)| (k.to_owned(), *v))
            .collect();

    // sort the vector by the value in descending order
    vec.sort_by(|a, b| b.1.cmp(&a.1));

    // return the sorted vector
    vec
    
}

// -----------------------------------------------------------------------------------------------
/// Creates a hashmap from the input file where the key is the elf designation number 
/// and the value is the sum of the calories for that elf
/// 
/// # Arguments
/// * `file` - A file object
/// 
/// # Returns
/// * `elf_map` - A hashmap of i32 keys and i32 values
/// 
/// # Panics
/// * `panic!` - If the file cannot be opened
/// * `panic!` - If a line cannot be read from the file
fn create_hashmap_from_file(file: File) -> HashMap<i32, i32> {    
    // create a buffered reader to read the file line by line
    // BufReader is a wrapper around the file that implements the BufRead trait
    // BufRead is a trait that provides the lines() method to read the file line by line
    let reader = BufReader::new(file);

    // create a counter to keep track of which elf is reading the file
    let mut elf_counter: i32 = 1;

    // create a hashmap to store the calorie sum for each elf
    let mut elf_map = HashMap::new();

    // Iterate over each line in the file
    for line in reader.lines() {
        // unwrap the line to a string or panic if there is an error
        let line = line.unwrap_or_else(|error| panic!("Error reading line: {}", error));
        
        // match the parsed line to an i32 value on success
        // on error, update the elf_counter and skip to the next line
        let val: i32 = match line.parse() {
            Ok(num) => num,
            // on error, update the elf_counter and skip to the next line
            Err(_) => {
                elf_counter += 1;
                continue;
            }
        };
        // Add the value to the sum for the current elf or create a new entry
        // if we haven't seen this elf before
        elf_map
            .entry(elf_counter)
            .and_modify(|e| *e += val)
            .or_insert(val);
    }

    elf_map
}