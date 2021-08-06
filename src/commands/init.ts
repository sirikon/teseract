import { writeFile, mkdir, stat } from 'fs/promises'
import * as pathUtils from 'path'

export default async function () {

  const tabSize = 2;
  const quotes = "double";

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
      "quotes": ["error", quotes],
      "indent": ["error", tabSize],
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  }))

  write('.vscode/settings.json', json({
    "editor.detectIndentation": false,
    "editor.tabSize": tabSize
  }))

  write('.vscode/extensions.json', json({
    "recommendations": [
      "dbaeumer.vscode-eslint"
    ]
  }))

}

function json(content: unknown): string {
  return JSON.stringify(content, null, 2)
}

async function write(path: string, content: string) {
  const fullPath = pathUtils.join(process.cwd(), path);

  try {
    const statResult = await stat(fullPath);
    if (statResult.isFile()) return
  } catch (_) {}
  
  await mkdir(pathUtils.dirname(fullPath), { recursive: true });
  await writeFile(pathUtils.join(process.cwd(), path), content)
}
