import * as pathUtils from "path";
import { rm, mkdir, writeFile } from 'fs/promises'

import builder from "../builder";
import { spawnSync } from "child_process";

export default async function (args: string[]) {

  console.log('Checking with TSC...');
  const result = spawnSync('tsc', ['--noEmit', '--project', '.'], { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status || undefined);
  }

  console.log('Building...');
  const { resources } = await builder({
    workDir: process.cwd()
  });

  const distFolder = p([process.cwd(), 'dist'])
  await rm(distFolder, { recursive: true, force: true })
  await mkdir(distFolder)

  for(const r of resources) {
    await writeFile(p([distFolder, r.path]), Buffer.from(r.data))
  }
}

const p = (chunks: string[]) => pathUtils.join(...chunks);
