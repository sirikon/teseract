export type InitParams = {
  workDir: string
}

export type ResourceAliases = { [path: string]: string }
export type ResourceList = { paths: string[], provider: (aliases: ResourceAliases) => Promise<Uint8Array[]> }[]
