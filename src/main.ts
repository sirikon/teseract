import lint from './commands/lint'
import build from './commands/build'
import serve from './commands/serve'

async function main() {
  // await lint(['--fix']);
  // await build();
  await serve();
}

main().then(() => {}, (err) => console.log(err));
