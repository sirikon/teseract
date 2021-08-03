import { TextEncoder } from 'util'
import * as pathUtils from "path";
import { stat } from "fs/promises";

import * as esbuild from "esbuild";
import sassPlugin from 'esbuild-plugin-sass'

import { PipelineParams, ResourceProviders } from "./types";

export default async function (params: PipelineParams): Promise<ResourceProviders> {
  const fileExists = _fileExists(params);

  const result: ResourceProviders = [];

  await fileExists(["src", "main.ts"]) && result.push(async () => {
    const result = await esbuild.build({
      entryPoints: [`${params.workDir}/src/main.ts`],
      target: "es2016",
      sourcemap: 'external',
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

  result.push(async (resources) => {
    const enc = new TextEncoder();
    return [{
      path: '/index.html',
      data: enc.encode(resources.map(r => r.path).join(', '))
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
