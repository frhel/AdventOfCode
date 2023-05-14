// ----------------------------------------------------------------------------
// Problem description: https://adventofcode.com/2022/day/15
// Solution by: https://github.com/frhel (Fry)
// ----------------------------------------------------------------------------

// -------------------------------- Imports -----------------------------------
const fs = require('fs');
// Read in the contents of the data file and store it as an array of strings
// where each string is obtained by splitting the input string on the newline 
// character
const input = fs.readFileSync('../data', 'utf-8')
    .replace(/\r/g, "").trim().split('\n');


// --------------------------------- Setup ------------------------------------
// Convert the x, y coordinate pairs to an object and add the distance
// between the sensor and the distress beacon as a property
const sensor_map = parse_input(input);

// Just for fun - let's see how long it takes to run the solution
let start_time = new Date().getTime();
// ------------------------------- Solution -----------------------------------
// -------------------------------- Part 1 ------------------------------------
let test_row = 2000000;
let filtered_sensors = calculate_margin(sensor_map, test_row);
let covered_cells = calculate_covered_cells(filtered_sensors, test_row);
console.log(`Part 1: ${covered_cells} cells covered`);

// -------------------------------- Part 2 ------------------------------------
let limit = 4000000;
let beacon_location = find_distress_beacon(sensor_map, limit)

// Returning the x, y coordinate pair as a string, so we need to split it
let result = (typeof beacon_location === 'string')
    ? beacon_location.split(',') : ['', ''];

// Calculate the tuning frequency according to the problem description
let calc_result = Number(result[0]) * 4000000 + Number(result[1]);
console.log(`Part 2: ${calc_result} is the  tuning frequency of the distress beacon`);

// Just for fun - let's see how long it took to run the solution
let delta = new Date().getTime() - start_time;
console.log(`Time taken: ${delta / 1000}s`)


// ------------------------------ Functions -----------------------------------
// ----------------------------------------------------------------------------
// Run through all the rows to find the one with the beacon in it
function find_distress_beacon(sensor_map, limit) {
    for (let i = 0; i < limit; i++) {
        // Clone the sensor map so we don't modify the original on
        // each iteration because we're going to be removing sensors
        let sensors = sensor_map.slice();
        // Just throw away the sensors that are outside the range of
        // the current row
        sensors = calculate_margin(sensors, i);

        // if no beacon found, continue to the next row
        let beacon_location = check_for_beacon(sensors, i);
        if (typeof beacon_location === 'string') {
            return beacon_location;
        }
    }
    return '';
}

// ----------------------------------------------------------------------------
// Check if there is a beacon in the current row by comparing the x coordinates
// of the sensors for the given row to test. Limit tells us the upper bound of
// the x coordinate
function check_for_beacon(sensors, test_row, limit) {
    // Sort the sensors by their starting x coordinate
    sensors = sensors.sort((a, b) => (a.x - a.margin) - (b.x - b.margin))

    for (let i = 0; i < sensors.length; i++) {
        let sensor = sensors[i];
        let next = (sensors[i + 1] !== undefined) ? sensors[i + 1] : null;
        let [start, end] = [sensor.x - sensor.margin, sensor.x + sensor.margin];
        let [next_start, next_end] = (next !== null)
            ? [next.x - next.margin, next.x + next.margin] : [null, null];

        // Throw away the sensors that are outside the range of the current row
        if ((start < 0 && end < 0) || (start > limit && end > limit))
            continue;
        // Adjust the start and end coordinates if they are outside the range
        start = (start < 0) ? 0 : start;
        end = (end > limit) ? limit : end;

        // Gotta check if we're at the end of the row or not to make the check
        // against next sensor
        if (next_start !== null) {
            if (end > next_end) {
                sensors[i + 1] = sensors[i];
                continue;
            }
            else if (end < next_start)
                return [end + 1, test_row].join(',');
        }

        // If we're here, we're at the end of the row and we have one final
        // check to see if the beacon is on the edge of the row
        if (end < next_start)
            return [end + 1, test_row].join(',');
    }
    return false;
}

// This is basically the same as above, except we're not looking for a beacon
// but rather the number of cells covered by the sensors in the given row
// Works basically the same.
function calculate_covered_cells(filtered_sensors, test_row) {
    filtered_sensors = filtered_sensors
        .sort((a, b) => (a.x - a.margin) - (b.x - b.margin))

    let accumulator = 0;
    let sensors = filtered_sensors.slice();
    for (let i = 0; i < sensors.length; i++) {
        let sensor = sensors[i];
        let next = (sensors[i + 1] !== undefined) ? sensors[i + 1] : null;
        let [start, end] = [sensor.x - sensor.margin, sensor.x + sensor.margin];
        let [next_start, next_end] = (next !== null)
            ? [next.x - next.margin, next.x + next.margin] : [null, null];

        // If we're at the end of the row, we just add the remaining cells
        // to the accumulator and return it
        if (next_start === null)
            return accumulator + Math.abs(end - start);

        // If the next sensor is completely inside the current sensor, we
        // just skip it by setting the next sensor to the current one
        if (end > next_end) {
            sensors[i + 1] = sensors[i];
            continue;
        }

        // If the end of the current sensor is inside the start of the next
        // sensor, we set the end of the current sensor to the start of the
        // next sensor so we don't add the same cells twice
        if (end > next_start)
            end = end - (Math.abs(next_start - end));

        accumulator += Math.abs(end - start);
    }
}


// --------------------------- Setup Functions --------------------------------
// ----------------------------------------------------------------------------
// For a given row, calculate the margin of influence each sensor has in that
// row, given the distance from the beacon
function calculate_margin(sensor_map, test_row) {
    // We also filter out any sensors that do not cover the given row
    let filtered_sensors = sensor_map.filter(sensor => {
        let diff = Math.abs(sensor.y - test_row);
        if (diff < sensor.beacon.distance) {
            sensor.margin = Math.abs(diff - sensor.beacon.distance);
            return true;
        }
        return false;
    });
    return filtered_sensors;
}

// Just a ridiculous mess of maps to get the data into a nice format
function parse_input(input) {
    input = input.map(line => line.split(': '))
        .map(line => line.map(x => x.split(' '))
            .map(x => x.slice(-2)
                .map(x => parseInt(x.split('=')[1]))
            ))
        .map((line, i) => {
            return build_sensor(line, i)
        })
    return input;
}

// The object. Root is sensor. Beacon is the beacon.
function build_sensor(line, i) {
    return {
        id: i,
        x: line[0][0],
        y: line[0][1],
        beacon: {
            x: line[1][0],
            y: line[1][1],
            distance: Math.abs(line[0][0] - line[1][0])
                + Math.abs(line[0][1] - line[1][1])
        }
    }
}