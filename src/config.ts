import * as fs from 'fs/promises'
import * as p from 'path'
import { number, object, string, Infer, union, literal, record, assert, array } from "superstruct"

const ConfigStruct = object({
  style: object({
    indentation: number(),
    quotes: union([literal("double"), literal("single")]),
  }),
  build: object({
    loaders: record(string(), union([literal("file"), literal("other")])),
    externalDependencies: array(string())
  })
})
export type Config = Infer<typeof ConfigStruct>

const defaultConfig: Config = {
  style: {
    indentation: 2,
    quotes: "double",
  },
  build: {
    loaders: {
      '.jpg': 'file',
      '.jpeg': 'file',
      '.png': 'file',
      '.gif': 'file',
      '.svg': 'file',
      '.ttf': 'file',
    },
    externalDependencies: []
  }
}

export async function getConfig(): Promise<Config> {
  const packageFilePath = p.join(process.cwd(), 'package.json');
  if (!await fileExists(packageFilePath)) return defaultConfig;
  const packageFileData = JSON.parse(await fs.readFile(packageFilePath, { encoding: 'utf-8' }));
  if (!packageFileData.teseract) return defaultConfig;
  const config = merge(packageFileData.teseract, defaultConfig);
  assert(config, ConfigStruct)
  return config;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    return (await fs.stat(path)).isFile()
  } catch (_) { return false }
}

function merge(data: any, base: any) {
  const result:any = {};
  const keys = Array.from(new Set([ ...Object.keys(data), ...Object.keys(base) ]));
  for(const key of keys) {
    if (data[key] == null) {
      result[key] = base[key]
    } else {
      if (typeof base[key] === "object" && typeof data[key] === "object" && !Array.isArray(base[key])) {
        result[key] = merge(data[key], base[key])
      } else {
        result[key] = data[key];
      }
    }
  }
  return result;
}
