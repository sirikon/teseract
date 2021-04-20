import * as fs from 'fs/promises';
import * as crypto from 'crypto';

import { buildEntrypoint, getEntrypoint, getIndex } from '../builders.js';

export default async function() {
    await fs.rm('./dist', { recursive: true, force: true });
    await fs.mkdir('./dist');
    await buildEntrypoint({ outfile: './dist/main.js', production: true });
    const entrypointHash = crypto.createHash('md5')
        .update(await fs.readFile('./dist/main.js', { encoding: 'utf-8' }))
        .digest("hex")
        .toLowerCase();
    await fs.rename('./dist/main.js', `./dist/main.${entrypointHash}.js`);
    await fs.rename('./dist/main.js.map', `./dist/main.${entrypointHash}.js.map`);
    await fs.appendFile(`./dist/main.${entrypointHash}.js`, `\n//# sourceMappingURL=main.${entrypointHash}.js.map\n`);
    await fs.writeFile('./dist/index.html', await getIndex({ entrypoint: `main.${entrypointHash}.js` }));
}
