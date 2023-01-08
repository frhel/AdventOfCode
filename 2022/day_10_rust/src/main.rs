use std::fs::File;
use std::io::{BufRead, BufReader};
use std::collections::HashMap;

#[derive(PartialEq)]
enum OutputType {
    SignalStrength,
    PixelData,
}

fn main() {
    let file_path = "../data/day_10";
    // Parse the file into a vector of instructions
    let instructions = parse_file(file_path);
    // parse the instructions into cycles
    let cycles = parse_instructions_to_cycles(instructions);
    // Define cycle check points
    let cycle_check_points: HashMap<&str, i32> = [("start", 20),("step", 40),("end", 220),]
        .into_iter().collect::<HashMap<_, _>>();

    // ------------------------------------ Part 1 ------------------------------------
    let total_signal_strength = execute_commands(cycles.clone(), cycle_check_points.clone(), OutputType::SignalStrength);
    println!("Part 1: {}", total_signal_strength);

    // ------------------------------------ Part 2 ------------------------------------
    let pixel_data = execute_commands(cycles, cycle_check_points, OutputType::PixelData);
    println!("Part 2: {}", pixel_data);

}

/// Execute the commands and return the output
fn execute_commands(cycles: Vec<(String, i32)>, cycle_check_points: HashMap<&str, i32>, output_type: OutputType) -> String {
    let mut cycle_count = 0;
    let mut x_reg_val = 1; // The x register starts at 1 as per the instructions
    let mut signal_strength_list: Vec<i32> = Vec::new();

    // Create a vector of vectors to represent each line on the CRT screen
    let mut crt_pixelmap: Vec<Vec<String>> = vec![Vec::new()];
    let mut next_cycle_checkpoint = cycle_check_points.get("start").unwrap().clone();

    for cycle in cycles {
        cycle_count += 1; // Increment the cycle count at the start of each cycle

        // Drawl a pixel on the CRT for each cycle
        crt_pixelmap = draw_pixel(crt_pixelmap, cycle_count, x_reg_val, cycle_check_points.get("step").unwrap());


        // Check if we need to add the signal strength to the list before we execute the cycle
        if cycle_count == next_cycle_checkpoint && cycle_count <= *cycle_check_points.get("end").unwrap() {
            signal_strength_list.push(cycle_count * x_reg_val);
            next_cycle_checkpoint += cycle_check_points.get("step").unwrap();
        }

        if cycle.0 == "addx" {
            x_reg_val += cycle.1;
        }
    }

    // Create a string to return the output as all the output types are strings
    let mut return_string = String::new();

    // Return the output based on the output type
    if output_type == OutputType::SignalStrength {
        return_string = signal_strength_list.iter().sum::<i32>().to_string();
    } else if output_type == OutputType::PixelData {
        // Start the pixel data with a new line so all the pixel data is lined up
        return_string.push_str("\n\r");
        for line in crt_pixelmap {
            // Join all the pixels in the line together and add a new line to 
            // represent the each line on the CRT screen
            return_string.push_str(&line.into_iter().map(|x| x).collect::<Vec<String>>().join(""));
            return_string.push_str("\n\r");
        }
    }
    return_string
}

/// Draw a pixel on the CRT
fn draw_pixel(crt_pixelmap: Vec<Vec<String>>, cycle_count: i32, x_reg_val: i32, step: &i32) -> Vec<Vec<String>> {
    let mut crt_pixelmap = crt_pixelmap;
    let sprite = x_reg_val;
    // Need to subtract 1 from the cycle count as the pixel_nr starts at 0, not 1 like the cycle count.
    let pixel_nr = (cycle_count - 1) % step;

    // if the sprite overlaps the pixel, draw a #, otherwise draw a .
    if sprite == pixel_nr || sprite + 1 == pixel_nr || sprite - 1 == pixel_nr {
        crt_pixelmap.last_mut().unwrap().push(String::from("\u{2588}"));
    } else {
        crt_pixelmap.last_mut().unwrap().push(String::from(" "));
    }

    // We check if we have reached the end of the line after adding the pixel so we
    // are utilising the full line length before starting a new line.
    if pixel_nr == step - 1 {
        crt_pixelmap.push(Vec::new());
    }

    crt_pixelmap
}

/// Parse the instructions into a vector of cycles
fn parse_instructions_to_cycles(instructions: Vec<(String, i32)>) -> Vec<(String, i32)> {
    let mut cycles: Vec<(String, i32)> = Vec::new();    

    for instruction in instructions {
        if instruction.0 == "addx" {
            // Because addx is a 2 cycle instruction, and only executes on the 2nd cycle
            // we need to add a dummy cycle to the vector to represent the 1st cycle
            cycles.push((String::from("addx"), 0));
        }
        cycles.push(instruction);
    }
    cycles
}

/// Parse the file into a vector of instructions
fn parse_file(file_path: &str) -> Vec<(String, i32)> {
    let file = File::open(file_path).unwrap_or_else(|error| {
        panic!("Error opening file: {}", error);
    });
    let reader = BufReader::new(file);
    let mut moves: Vec<(String, i32)> = Vec::new();

    // for each line, parse the line into a vector of tuples of (command: String, value: i32)
    for line in reader.lines() {
        let line = line.unwrap_or_else(|error| {
            panic!("Error reading line: {}", error);
        });
        let mut line = line.split_whitespace();
        let command = line.next().unwrap().to_string();
        
        // If the value is not present, default to 0 so we can still parse the line
        let value = line.next().unwrap_or("0").parse::<i32>().unwrap();
        moves.push((command, value));
    }
    moves
}