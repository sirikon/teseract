import esbuild from 'esbuild';
import * as fs from 'fs/promises';

export async function getEntrypoint({ production = false } = {}) {
    const res = await esbuild.build({
        ...esbuildOptions({ production }),
        write: false
    })
    return res.outputFiles[0].contents;
}

export async function buildEntrypoint({ outfile, production = false } = {}) {
    await esbuild.build({
        ...esbuildOptions({ production }),
        outfile
    })
}

function esbuildOptions({ production = false }) {
    return {
        entryPoints: ['src/main.ts'],
        target: 'es2016',
        sourcemap: production ? 'external' : false,
        minify: production,
        bundle: true,
    }
}

export async function getIndex({ entrypoint }) {
    const index = await fs.readFile('src/index.html', { encoding: 'utf-8' });
    return index
        .replace(
            '<!-- teseract:entrypoint -->',
            `<script src="${entrypoint}" type="text/javascript"></script>`);
}
