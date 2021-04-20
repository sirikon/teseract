import http from 'http';
import { spawn } from 'child_process';

import { getEntrypoint, getIndex, getStyle } from '../builders.js';

const hostname = '0.0.0.0';
const port = 8080;

export default async function () {
    const httpServer = await startHttpServer();
    const tscProcess = startTSCProcess();
    await waitTSC(tscProcess);
    await closeHttpServer(httpServer);
}

async function requestHandler(req, res) {
    switch (req.url) {
        case '/': await reply(res, 'text/html', getIndex({ entrypoint: 'main.js', style: 'style.css' })); break
        case '/main.js': await reply(res, 'text/javascript', getEntrypoint()); break
        case '/style.css': await reply(res, 'text/css', getStyle()); break
        default: replyNotFound(res);
    }
}

function startHttpServer() {
    return new Promise((resolve) => {
        const server = http.createServer(requestHandler);
        server.listen(port, hostname, () => {
            console.log(`http://${hostname}:${port}/`);
            resolve(server);
        });
    });
}

function closeHttpServer(httpServer) {
    console.log('Closing HTTP server...');
    return new Promise((resolve, reject) => {
        httpServer.close((err) => {
            if (err) { reject(err); return }
            console.log('HTTP server closed');
            resolve();
        })
    });
}

function startTSCProcess() {
    return spawn('tsc', ['--watch', '--noEmit', '--project', '.'], { stdio: 'inherit' });
}

function waitTSC(tscProcess) {
    return new Promise((resolve, reject) => {
        tscProcess.on('close', (code) => {
            if (code === 0) { resolve(); return; }
            reject(new Error('TSC ended with status code ' + code));
        });
    });
}

async function reply(res, contentType, contentPromise) {
    try {
        const content = await contentPromise;
        res.setHeader('content-type', contentType);
        res.end(content);
    } catch (err) {
        console.log(err);
        res.statusCode = 500;
        res.end();
    }
}

function replyNotFound(res) {
    res.statusCode = 404;
    res.end();
}
