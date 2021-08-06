import init from "./pipeline";
import { BuildError, BuildResult, PipelineParams, Resource } from "./types";

export default async function (params: PipelineParams): Promise<BuildResult> {
  const providers = await init(params);
  const resources: Resource[] = [];
  const errors: BuildError[] = [];
  for(const provider of providers) {
    const result = await provider(resources);
    resources.push(...result.resources);
    errors.push(...result.errors);
  }
  return { resources, errors };
}
