import * as pathUtils from "path";
import http from 'http'

import chokidar from 'chokidar'
import mime from 'mime-types'

import builder from "../builder";
import { BuildResult, Resource } from "../types";
import { ChildProcess, spawn } from "child_process";

export default async function () {

  const watcher = await watch(p([process.cwd(), 'src']))

  watcher.on('all', () => {
    resourcesPromise = null;
  })

  const server = http.createServer(async (req, res) => {
    if (req.url == null) {
      res.statusCode = 404
      res.end();
      return
    }

    const path = req.url.endsWith('/')
      ? `${req.url}index.html`
      : req.url

    const { resources, errors } = await getResources();
    if (errors.length > 0) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.end(errors.map(e => `${e.file}\n\n${e.text}\n\n\n`).join(''))
      return
    }

    const matchingResources = resources.filter(r => r.path === path)
    if (matchingResources.length === 0) {
      res.statusCode = 404
      res.end();
      return
    }

    const matchingResource = matchingResources[0];
    res.setHeader('Content-Type', mime.lookup(path) || 'application/octet-stream')
    res.end(matchingResource.data);
  });
  
  server.listen(8080, '0.0.0.0', () => {
    console.log(`Server running`);
  });

  const tscProcess = startTSCProcess();
  await waitTSC(tscProcess);
  await closeHttpServer(server);
  watcher.close();
}

let resourcesPromise: Promise<BuildResult> | null = null
async function getResources(): Promise<BuildResult> {
  if (resourcesPromise) return resourcesPromise;
  return resourcesPromise = buildResources();
}

async function buildResources(): Promise<BuildResult> {
  try {
    return await builder({
      workDir: process.cwd()
    });
  } catch (err) {
    console.log(err)
    return { resources: [], errors: [] };
  }
}

async function watch(path: string): Promise<chokidar.FSWatcher> {
  return new Promise((resolve) => {
    const watcher = chokidar.watch(path)
    watcher.on('ready', () => resolve(watcher));
  })
}

function startTSCProcess() {
  return spawn('tsc', ['--watch', '--noEmit', '--project', '.'], { stdio: 'inherit' });
}

function waitTSC(tscProcess: ChildProcess) {
  return new Promise((resolve, reject) => {
      tscProcess.on('close', () => {
        resolve(null);
      });
  });
}

function closeHttpServer(server: http.Server) {
  console.log('Closing HTTP server...');
  return new Promise((resolve, reject) => {
    server.close((err) => {
          if (err) { reject(err); return }
          console.log('HTTP server closed');
          resolve(null);
      })
  });
}

const p = (chunks: string[]) => pathUtils.join(...chunks);
