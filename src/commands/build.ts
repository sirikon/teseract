import * as pathUtils from "path";
import { rm, mkdir, writeFile } from 'fs/promises'

import builder from "../builder";
import { spawnSync } from "child_process";
import { dirname } from "path";

export default async function (args: string[]) {

  console.log('Checking with TSC...');
  const result = spawnSync('tsc', ['--noEmit', '--project', '.'], { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status || undefined);
  }

  console.log('Building...');
  const { resources } = await builder();

  const distFolder = p([process.cwd(), 'dist'])
  await rm(distFolder, { recursive: true, force: true })
  await mkdir(distFolder)

  for (const r of resources) {
    const destination = p([distFolder, r.path])
    await mkdir(dirname(destination), { recursive: true })
    await writeFile(destination, Buffer.from(r.data))
  }
}

const p = (chunks: string[]) => pathUtils.join(...chunks);
