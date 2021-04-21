import * as path from 'path';
import { spawnSync } from 'child_process';

export default async function() {
    spawnSync('mocha', ['--require', 'ts-node/register', './**/*.spec.ts'], {
        stdio: 'inherit',
        cwd: path.join(process.cwd(), 'test')
    })
}
