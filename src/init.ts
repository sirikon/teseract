import { TextEncoder } from 'util'
import * as pathUtils from "path";
import { stat } from "fs/promises";
import { InitParams, ResourceList } from "./types";
import * as esbuild from "esbuild";

export default async function (params: InitParams): Promise<ResourceList> {
  const fileExists = _fileExists(params);

  const result: ResourceList = [];

  await fileExists(["src", "main.ts"]) && result.push({
    paths: ["main.js", "main.js.map"],
    provider: async () => {
      const result = await esbuild.build({
        entryPoints: [`${params.workDir}/src/main.ts`],
        target: "es2016",
        sourcemap: 'external',
        outdir: '/',
        minify: true,
        bundle: true,
        write: false
      });

      const jsFileContents = result.outputFiles.filter(f => f.path.endsWith('.js'))[0].contents;
      const mapData = JSON.parse(result.outputFiles.filter(f => f.path.endsWith('.js.map'))[0].text);
      mapData.sources = ['src/main.ts'];
      const enc = new TextEncoder();
      const mapFileContents = enc.encode(JSON.stringify(mapData, null, 2));

      return [
        jsFileContents,
        mapFileContents
      ];
    },
  });

  return result;
}

const _fileExists = (params: InitParams) =>
  async (chunks: string[]) => {
    try {
      return (await stat(p([params.workDir, ...chunks]))).isFile();
    } catch (_) {
      return false;
    }
  };

const p = (chunks: string[]) => pathUtils.join(...chunks);
