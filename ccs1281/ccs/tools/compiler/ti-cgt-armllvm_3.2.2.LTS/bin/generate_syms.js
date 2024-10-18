const fs = require('fs');

function help() {
  console.error('generate_syms.js: Script to generate ASM symbols and their ' +
                'metadata.\n\nUsage: generate_syms.js input_file output_file' +
                '\n\nInput format:\nsymbol,placement_type,priority/region_id');
  process.exit(1);
}

// Check that 2 arguments are passed
if (process.argv.length < 4 || process.argv.includes('-h') ||
    process.argv.includes('--help'))
  help();

let input = process.argv[2];
let output = process.argv[3];
let file = fs.readFileSync(input).toString().split('\n');

// Open the output file as a new file
try {
  fs.writeFileSync(output, '');
} catch (err) {
  console.error(err);
  process.exit(1);
}

// Process input file and write the output
for (let line of file) {
  const items = line.split(',');
  if (items[0]) {
    // Make sure there are 3 values
    if (!items[1] || !items[2]) {
      console.error(line + '\n^');
      console.error('Expected input format of:\n' +
                    'symbol,placement_type,priority/region_id');
      process.exit(1);
    }

    items[0] = items[0].trim();
    items[1] = items[1].trim();
    items[2] = items[2].trim();
    const placement_vals = ["local", "onchip", "offchip",
                            "fast_local_copy", "do_not_share"];

    // Make sure the first value is a valid ARM asm symbol
    if (!items[0].match(/^[a-zA-Z_.][0-9a-zA-Z_.$]*$/)) {
      console.error(line + '\n' + ' '.repeat(line.indexOf(items[0])) + '^');
      console.error('Invalid ARM asm symbol');
      process.exit(1);
    }

    // Make sure the second value is one of placement_vals
    if (!placement_vals.includes(items[1])) {
      let err = 'Invalid placement_type. Options are:\n';

      for (let placement_val of placement_vals)
        err += placement_val + '\n';
      
      console.error(line + '\n' + ' '.repeat(line.indexOf(items[1])) + '^');
      console.error(err.substring(0, err.length - 1));
      process.exit(1);
    }

    // Make sure last value is an integer >= 0
    if (!Number.isInteger(Number(items[2])) || items[2] < 0) {
      console.error(line + '\n' + ' '.repeat(line.indexOf(items[2])) + '^');
      console.error('Expected an integer >= 0 for priority/region_id');
      process.exit(1);
    }

    const str = '.global ' + items[0] + '\n.sym_meta_info ' + items[0] + 
                ', "of_placement", "' + items[1] + '", ' + items[2] + '\n';

    try {
      fs.writeFileSync(output, str, { flag: 'a' });
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }
}
