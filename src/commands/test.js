const path = require('path');
const { spawnSync } = require('child_process');

module.exports = async function() {
    spawnSync('mocha', ['--require', 'ts-node/register', './**/*.spec.ts'], {
        stdio: 'inherit',
        cwd: path.join(process.cwd(), 'test')
    })
}
