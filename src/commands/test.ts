import { spawnSync } from "child_process"
import * as pathUtils from 'path'

export default async () => {
  spawnSync('mocha', ['--require', 'ts-node/register', './**/*.spec.ts'], {
    stdio: 'inherit',
    cwd: pathUtils.join(process.cwd(), 'test')
  })
}
