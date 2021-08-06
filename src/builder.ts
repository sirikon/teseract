import { readFile } from 'fs/promises'
import * as pathUtils from 'path'

import pipeline from "./pipeline";
import { BuildError, BuildResult, PipelineParams, Resource } from "./types";

export default async function (): Promise<BuildResult> {
  const params: PipelineParams = {
    workDir: process.cwd(),
    externalDependencies: await getExternalDependencies()
  }
  const providers = await pipeline(params);
  const resources: Resource[] = [];
  const errors: BuildError[] = [];
  for(const provider of providers) {
    const result = await provider(resources);
    resources.push(...result.resources);
    errors.push(...result.errors);
  }
  return { resources, errors };
}

async function getExternalDependencies(): Promise<string[]> {
  const data = JSON.parse(await readFile(pathUtils.join(process.cwd(), 'package.json'), { encoding: 'utf-8' }));
  if (!data.teseract) return [];
  if (!data.teseract.externalDependencies) return [];
  return data.teseract.externalDependencies;
}
