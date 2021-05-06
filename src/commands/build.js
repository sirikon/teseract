const fs = require('fs').promises;
const crypto = require('crypto');

const { buildEntrypoint, getIndex, getStyle } = require('../builders.js');

module.exports = async function() {
    await resetDist();

    const entrypointFilename = await generateEntrypoint();
    const styleFilename = await generateStyle();

    await generateIndex({
        entrypoint: entrypointFilename,
        style: styleFilename
    });
}

async function resetDist() {
    await fs.rm('./dist', { recursive: true, force: true });
    await fs.mkdir('./dist');
}

async function generateEntrypoint() {
    const initialJSPath = './dist/main.js';
    const initialSourcemapPath = './dist/main.js.map';

    await buildEntrypoint({ outfile: initialJSPath, production: true });
    const jsHash = await md5File(initialJSPath);

    const jsFilename = `main.${jsHash}.js`;
    const sourcemapFilename = `main.${jsHash}.js.map`;

    await fs.rename(initialJSPath, `./dist/${jsFilename}`);
    await fs.rename(initialSourcemapPath, `./dist/${sourcemapFilename}`);
    await fs.appendFile(`./dist/${jsFilename}`, `\n//# sourceMappingURL=${sourcemapFilename}\n`);

    return jsFilename;
}

async function generateStyle() {
    const initialCSSPath = './dist/style.css';

    await fs.writeFile(initialCSSPath, await getStyle(), { encoding: 'utf-8' });
    const cssHash = await md5File(initialCSSPath);

    const cssFilename = `style.${cssHash}.css`;
    await fs.rename(initialCSSPath, `./dist/${cssFilename}`);

    return cssFilename;
}

async function generateIndex({ entrypoint, style }) {
    await fs.writeFile('./dist/index.html', await getIndex({ entrypoint, style }));
}

async function md5File(filePath) {
    return crypto.createHash('md5')
        .update(await fs.readFile(filePath, { encoding: 'utf-8' }))
        .digest("hex")
        .toLowerCase();
}
