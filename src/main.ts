import lint from './commands/lint'
import build from './commands/build'
import serve from './commands/serve'
import test from './commands/test'

const commands: {
  [key: string]: [(args: string[]) => Promise<void>, string]
} = {
  serve: [serve, 'Starts a HTTP server with live builds.'],
  lint: [lint, 'Runs linter.'],
  build: [build, 'Generates a complete build.'],
  release: [async () => {
    await lint([]);
    await build([]);
  }, 'Alias for lint and build'],
  test: [test, 'Run unit tests'],
}

async function main(args: string[]) {
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
