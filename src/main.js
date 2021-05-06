const serve = require('./commands/serve.js');
const build = require('./commands/build.js');
const test = require('./commands/test.js');

const commands = {
    serve: [serve, 'Starts a HTTP server with live builds.'],
    build: [build, 'Generates a complete build.'],
    test: [test, 'Runs all the tests.']
}

async function main(args) {
    if (args.length === 0) return printHelp();

    const [command, ...commandArgs] = args;

    if (!commands[command]) {
        console.log(`Unknown command '${command}'`);
    }

    await commands[command][0](commandArgs);
}

function printHelp() {
    console.log('Usage: teseract <command>');
    console.log('');
    console.log('Available commands:');
    Object.keys(commands).forEach(command => {
        console.log(`  ${command}: ${commands[command][1]}`);
    })
}

main(process.argv.splice(2))
    .then(() => {}, (err) => console.log(err));
