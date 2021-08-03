import build from './commands/build'

async function main() {
  await build();
}

main().then(() => {}, (err) => console.log(err));
