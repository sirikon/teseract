import { TextDecoder } from 'util'

import build from './build'

async function main() {
  const resources = await build({
    workDir: process.cwd()
  });

  for(const r of resources) {
    var dec = new TextDecoder("utf-8");
    console.log(r.path);
    console.log(dec.decode(r.data));
  }
}

main().then(() => {}, (err) => console.log(err));
