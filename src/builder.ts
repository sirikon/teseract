import { getConfig } from './config';

import pipeline from "./pipeline";
import { BuildError, BuildResult, PipelineParams, Resource } from "./types";

export default async function (): Promise<BuildResult> {
  const config = await getConfig();
  const params: PipelineParams = {
    workDir: process.cwd(),
    externalDependencies: config.build.externalDependencies
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
