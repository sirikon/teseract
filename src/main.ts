import lint from './commands/lint'
import build from './commands/build'

async function main() {
  await lint(['--fix']);
  await build();
}

main().then(() => {}, (err) => console.log(err));
