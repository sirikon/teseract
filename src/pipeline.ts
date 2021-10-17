import { TextEncoder } from 'util'
import * as pathUtils from "path";
import { stat, readFile, readdir } from "fs/promises";

import * as esbuild from "esbuild";
import sassPlugin from 'esbuild-plugin-sass'

import { PipelineParams, ResourceProviders } from "./types";
import { getConfig } from './config';

export default async function (params: PipelineParams): Promise<ResourceProviders> {
  const fileExists = _fileExists(params);
  const directoryExists = _directoryExists(params);

  const result: ResourceProviders = [];

  await directoryExists(['src', 'static']) && result.push(async () => ({
    resources: (await Promise.all((await getFilesRecursively(p([params.workDir, 'src', 'static'])))
      .map(path => (async (p) => ({
        path: p,
        data: new Uint8Array(await readFile(p))
      }))(path))))
      .map(o => ({ ...o, path: '/' + pathUtils.relative(p([params.workDir, 'src', 'static']), o.path) })),
    errors: []
  }))

  await fileExists(["src", "main.ts"]) && result.push(async () => {
    const config = await getConfig();
    const activeProfile = process.env.TESERACT_PROFILE
      ? config.profiles[process.env.TESERACT_PROFILE]
      : {}
    try {
      const result = await esbuild.build({
        entryPoints: [`${params.workDir}/src/main.ts`],
        entryNames: '[dir]/[name]-[hash]',
        define: activeProfile,
        target: "es2016",
        sourcemap: true,
        outdir: '/',
        minify: true,
        bundle: true,
        write: false,
        logLevel: 'silent',
        external: params.externalDependencies,
        loader: toObject<esbuild.Loader>(Object.entries(config.build.loaders).filter(([_, type]) => type === 'file').map(([ext]) => ext).map((ext) => ([
          ext,
          'file'
        ]))),
        plugins: [
          sassPlugin()
        ]
      });

      return {
        resources: result.outputFiles.map(f => ({
          path: f.path,
          data: f.contents
        })),
        errors: []
      }
    } catch (err: any) {
      return {
        resources: [],
        errors: err.errors.map((e: any) => ({
          file: e.detail && e.detail.file
            ? pathUtils.relative(params.workDir, e.detail.file)
            : `${e.location.file}:${e.location.line}:${e.location.column}`,
          text: e.text
        }))
      }
    }
  })

  await fileExists(["src", "index.html"]) && result.push(async (resources) => {
    const cssFiles = resources.filter(r => r.path.endsWith('.css'));
    const jsFiles = resources.filter(r => r.path.endsWith('.js'));

    const index = (await readFile(p([params.workDir, 'src', 'index.html']), { encoding: 'utf-8' }))
      .replace('<!-- teseract:css -->', cssFiles.map(c => `<link rel="stylesheet" href="${c.path}" />`).join(''))
      .replace('<!-- teseract:js -->', jsFiles.map(c => `<script type="text/javascript" src="${c.path}"></script>`).join(''));

    return {
      resources: [{
        path: '/index.html',
        data: new TextEncoder().encode(index)
      }],
      errors: []
    }
  })

  return result;
}

async function getFilesRecursively(directory: string): Promise<string[]> {
  const result: string[] = []
  
  const files = await readdir(directory, { withFileTypes: true });
  for (const file of files) {
    const filePath = pathUtils.resolve(directory, file.name);
    if (file.isDirectory()) {
      result.push(...await getFilesRecursively(filePath))
    } else {
      result.push(filePath)
    }
  }

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

const _directoryExists = (params: PipelineParams) =>
  async (chunks: string[]) => {
    try {
      return (await stat(p([params.workDir, ...chunks]))).isDirectory();
    } catch (_) {
      return false;
    }
  };

const toObject = <T>(data: [string, T][]): { [key: string]: T } => {
  const result:{ [key: string]: T } = {};
  for(const entry of data) {
    result[entry[0]] = entry[1];
  }
  return result;
}

const p = (chunks: string[]) => pathUtils.join(...chunks);
