import init from "./pipeline";
import { PipelineParams, Resource } from "./types";

export default async function (params: PipelineParams): Promise<Resource[]> {
  const providers = await init(params);
  const resources: Resource[] = [];
  for(const provider of providers) {
    resources.push(...await provider(resources));
  }
  return resources;
}
