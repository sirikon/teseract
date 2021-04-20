import esbuild from 'esbuild';
import sass from 'sass';
import Fiber from 'fibers';
import * as fs from 'fs/promises';

export async function getIndex({ entrypoint, style }) {
    const index = await fs.readFile('src/index.html', { encoding: 'utf-8' });
    return index
        .replace(
            '<!-- teseract:entrypoint -->',
            `<script src="${entrypoint}" type="text/javascript"></script>`
        )
        .replace(
            '<!-- teseract:style -->',
            `<link rel="stylesheet" href="${style}">`
        );
}

export async function getStyle() {
    return new Promise((resolve, reject) => {
        sass.render({
            file: './src/style.scss',
            fiber: Fiber
        }, (err, result) => {
            if (err) { return reject(err); }
            resolve(result.css);
        });
    });
}

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
