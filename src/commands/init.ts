import { writeFile, mkdir, stat } from 'fs/promises'
import * as pathUtils from 'path'

import config from '../config'

export default async function () {

  write('tsconfig.json', json({
    "compilerOptions": {
      "esModuleInterop": true,
      "strict": true,
      "jsx": "react"
    },
    "include": ["src/**/*"]
  }))

  write('.eslintrc.json', json({
    "env": {
      "browser": true,
      "es2021": true,
    },
    "extends": [
      "eslint:recommended",
      "plugin:@typescript-eslint/eslint-recommended",
      "plugin:@typescript-eslint/recommended",
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
      "ecmaVersion": 12,
      "sourceType": "module",
    },
    "plugins": [
      "@typescript-eslint",
    ],
    "rules": {
      "quotes": ["error", config.quotes],
      "indent": ["error", config.tabSize],
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  }))

  write('.vscode/settings.json', json({
    "editor.detectIndentation": false,
    "editor.tabSize": config.tabSize
  }))

  write('.vscode/extensions.json', json({
    "recommendations": [
      "dbaeumer.vscode-eslint"
    ]
  }))

  write('src/index.d.ts', lines(config.extensionsLoadedAsFiles.map((ext) => `
declare module "*.${ext}" {
${tab()}const content: string;
${tab()}export default content;
}
  `.trim())))

}

function json(content: unknown): string {
  return JSON.stringify(content, null, 2)
}

function lines(content: string[]): string {
  return content.join('\n');
}

async function write(path: string, content: string) {
  const fullPath = pathUtils.join(process.cwd(), path);

  try {
    const statResult = await stat(fullPath);
    if (statResult.isFile()) return
  } catch (_) {}
  
  console.log('Writing ' + path);
  await mkdir(pathUtils.dirname(fullPath), { recursive: true });
  await writeFile(pathUtils.join(process.cwd(), path), content)
}

function tab() {
  return Array(config.tabSize+1).join(' ');
}
