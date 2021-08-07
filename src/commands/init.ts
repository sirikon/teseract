import { writeFile, mkdir, stat } from 'fs/promises'
import * as pathUtils from 'path'

export default async function () {

  write('src/main.ts', lines([
    'console.log("Hello World");'
  ]))

  write('src/index.html', `
<html>
  <head>
    <title>Example</title>
    <meta charset="utf-8">
    <!-- teseract:css -->
  </head>
  <body>
    <div id="app"></div>
    <!-- teseract:js -->
  </body>
</html>
  `.trim())

}

function lines(content: string[]): string {
  return content.join('\n');
}

async function write(path: string, content: string) {
  const fullPath = pathUtils.join(process.cwd(), path);
  await mkdir(pathUtils.dirname(fullPath), { recursive: true });
  await writeFile(pathUtils.join(process.cwd(), path), content)
}
