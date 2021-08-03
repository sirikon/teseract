import lint from './lint.js';
import build from './build.js';

export default async function() {
    await lint();
    await build();
}
