import { TextDecoder } from 'util'
import init from "./init";

async function main() {
  const list = await init({
    workDir: process.cwd(),
  });

  for(const item of list) {
    var dec = new TextDecoder("utf-8");
    for(const file of await item.provider({})) {
      console.log(dec.decode(file))
    }
  }
}

main().then(() => {}, (err) => console.log(err));
