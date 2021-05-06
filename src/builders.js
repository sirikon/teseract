const esbuild = require('esbuild');
const sass = require('sass');
const Fiber = require('fibers');
const fs = require('fs').promises;

async function getIndex({ entrypoint, style }) {
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

async function getStyle() {
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

async function getEntrypoint({ production = false } = {}) {
    const res = await esbuild.build({
        ...esbuildOptions({ production }),
        write: false
    })
    return Buffer.from(res.outputFiles[0].contents);
}

async function buildEntrypoint({ outfile, production = false } = {}) {
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

module.exports = {
    getIndex,
    getStyle,
    getEntrypoint,
    buildEntrypoint
}
