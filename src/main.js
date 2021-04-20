import esbuild from 'esbuild';
import * as fs from 'fs';
import http from 'http';

const hostname = '0.0.0.0';
const port = 8080;

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile('src/index.html', { encoding: 'utf-8' }, (err, data) => {
            res.end(data
                .replace('<!-- teseract:entrypoint -->', '<script src="main.js" type="text/javascript"></script>'));
        });
        return;
    }

    if (req.url === '/main.js') {
        esbuild.build({
            entryPoints: ['src/main.ts'],
            bundle: true,
            outfile: '.teseract/temp/main.js'
        }).then((v) => {
            fs.readFile('.teseract/temp/main.js', { encoding: 'utf-8' }, (err, data) => {
                res.end(data);
            });
        })
        return;
    }
    console.log(req.url);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hola Mundo');
});

server.listen(port, hostname, () => {
  console.log(`http://${hostname}:${port}/`);
});
