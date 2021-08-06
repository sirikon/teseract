export type Resource = {
  path: string
  data: Uint8Array
}
export type BuildError = {
  file: string
  text: string
}

export type BuildResult = {
  resources: Resource[],
  errors: BuildError[]
}

export type ResourceProviders = ((resources: Resource[]) => Promise<BuildResult>)[]

export type PipelineParams = {
  workDir: string
  externalDependencies: string[]
}
