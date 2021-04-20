import esbuild from 'esbuild';
import * as fs from 'fs/promises';
import http from 'http';

const hostname = '0.0.0.0';
const port = 8080;

const server = http.createServer(async (req, res) => {
    if (req.url === '/') {
        res.setHeader('content-type', 'text/html');
        res.end(await getIndex());
        return;
    }

    if (req.url === '/main.js') {
        res.setHeader('content-type', 'text/javascript');
        res.end(await getMain());
        return;
    }
    
    res.statusCode = 404;
    res.end();
});

server.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}/`);
});

async function getMain() {
    const res = await esbuild.build({
        entryPoints: ['src/main.ts'],
        bundle: true,
        write: false
    })
    return res.outputFiles[0].contents;
}

async function getIndex() {
    const index = await fs.readFile('src/index.html', { encoding: 'utf-8' });
    return index
        .replace(
            '<!-- teseract:entrypoint -->',
            '<script src="main.js" type="text/javascript"></script>');
}
