import { TextEncoder } from 'util'
import * as pathUtils from "path";
import { stat, readFile } from "fs/promises";

import * as esbuild from "esbuild";
import sassPlugin from 'esbuild-plugin-sass'

import { PipelineParams, ResourceProviders } from "./types";

export default async function (params: PipelineParams): Promise<ResourceProviders> {
  const fileExists = _fileExists(params);

  const result: ResourceProviders = [];

  await fileExists(["src", "main.ts"]) && result.push(async () => {
    const result = await esbuild.build({
      entryPoints: [`${params.workDir}/src/main.ts`],
      entryNames: '[dir]/[name]-[hash]',
      target: "es2016",
      sourcemap: true,
      outdir: '/',
      minify: true,
      bundle: true,
      write: false,
      plugins: [
        sassPlugin()
      ]
    });

    return result.outputFiles.map(f => ({
      path: f.path,
      data: f.contents
    }))
  })

  await fileExists(["src", "index.html"]) && result.push(async (resources) => {
    const cssFiles = resources.filter(r => r.path.endsWith('.css'));
    const jsFiles = resources.filter(r => r.path.endsWith('.js'));

    const index = (await readFile(p([params.workDir, 'src', 'index.html']), { encoding: 'utf-8' }))
      .replace('<!-- teseract:css -->', cssFiles.map(c => `<link rel="stylesheet" href="${c.path}" />`).join(''))
      .replace('<!-- teseract:js -->', jsFiles.map(c => `<script type="text/javascript" src="${c.path}"></script>`).join(''));

    const enc = new TextEncoder();
    return [{
      path: '/index.html',
      data: enc.encode(index)
    }]
  })

  return result;
}

const _fileExists = (params: PipelineParams) =>
  async (chunks: string[]) => {
    try {
      return (await stat(p([params.workDir, ...chunks]))).isFile();
    } catch (_) {
      return false;
    }
  };

const p = (chunks: string[]) => pathUtils.join(...chunks);
