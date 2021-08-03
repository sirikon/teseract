export type Resource = { path: string, data: Uint8Array }
export type ResourceProviders = ((resources: Resource[]) => Promise<Resource[]>)[]

export type PipelineParams = {
  workDir: string
}
