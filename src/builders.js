import esbuild from 'esbuild';
import * as fs from 'fs/promises';

export async function getEntrypoint({ production = false }) {
    const res = await esbuild.build({
        entryPoints: ['src/main.ts'],
        target: 'es2016',
        sourcemap: production,
        minify: production,
        bundle: true,
        write: false
    })
    return res.outputFiles[0].contents;
}

export async function getIndex() {
    const index = await fs.readFile('src/index.html', { encoding: 'utf-8' });
    return index
        .replace(
            '<!-- teseract:entrypoint -->',
            '<script src="main.js" type="text/javascript"></script>');
}
