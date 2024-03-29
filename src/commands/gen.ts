import * as fs from 'fs/promises'
import * as pathUtils from 'path'

import { getConfig } from '../config'

export default async function () {

  const config = await getConfig();
  const tab = () => Array(config.style.indentation + 1).join(' ');
  const json = (data: any) => JSON.stringify(data, null, config.style.indentation);
  const loaderExtensions = () => Object.entries(config.build.loaders)
    .filter(([_, type]) => type === 'file')
    .map(([ext]) => ext);

  const completeFiles: [string, () => string][] = [
    ['tsconfig.json', () => json({
      "compilerOptions": {
        "esModuleInterop": true,
        "strict": true,
        "jsx": "react",
        "paths": {
          "@/*": ["./src/*"]
        }
      },
      "include": ["src/**/*"]
    })],

    ['.eslintrc.json', () => json({
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
        "quotes": ["error", config.style.quotes],
        "indent": ["error", config.style.indentation],
        "@typescript-eslint/explicit-module-boundary-types": "off",
      },
    })],

    ['.prettierrc.json', () => json({
      "tabWidth": config.style.indentation,
      "singleQuote": config.style.quotes === "single"
    })],

    ['.vscode/extensions.json', () => json({
      "recommendations": [
        "dbaeumer.vscode-eslint",
        "amodio.toggle-excluded-files",
        "esbenp.prettier-vscode"
      ]
    })],

    ['.vscode/launch.json', () => json({
      "version": "0.2.0",
      "configurations": [
        {
          "type": "node-terminal",
          "name": "Test",
          "request": "launch",
          "command": "npm exec teseract test && exit",
          "cwd": "${workspaceFolder}"
        }
      ]
    })],

    ['.vscode/settings.json', () => json({
      "editor.detectIndentation": false,
      "editor.tabSize": config.style.indentation,
      "eslint.format.enable": true,
      "[typescript]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode",
      },
      "[typescriptreact]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode",
      },
      "[javascript]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode",
      },
      "[javascriptreact]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode",
      },
      "[json]": {
        "editor.defaultFormatter": "vscode.json-language-features",
        "files.insertFinalNewline": true
      },
      "[jsonc]": {
        "editor.defaultFormatter": "vscode.json-language-features",
        "files.insertFinalNewline": true
      },
      "[scss]": {
        "editor.defaultFormatter": "vscode.css-language-features",
        "files.insertFinalNewline": true
      },
      "[css]": {
        "editor.defaultFormatter": "vscode.css-language-features",
        "files.insertFinalNewline": true
      },
      "[html]": {
        "editor.defaultFormatter": "vscode.html-language-features",
        "files.insertFinalNewline": true
      },
      "files.exclude": {
        "node_modules": true,
        "package-lock.json": true,
        ".vscode": true,
        ...Object.fromEntries(completeFiles.map(([path]) => [path, true]))
      }
    })],
  ]

  for (const [path, content] of completeFiles) {
    await writeCompleteFile(path, content());
  }

  await writePartialFile({
    path: 'src/index.d.ts',
    name: 'definitions',
    commentPrefix: '// ',
    content: lines(loaderExtensions().map((ext) => `
declare module "*${ext}" {
${tab()}const content: string;
${tab()}export default content;
}
        `.trim()))
  })

  await writePartialFile({
    path: '.gitignore',
    name: 'gitignore',
    commentPrefix: '# ',
    content: lines([
      '/node_modules',
      '/dist',
      ...completeFiles.map(([path]) => path)
    ])
  })

}

function lines(content: string[]): string {
  return content.join('\n');
}

async function writeCompleteFile(path: string, content: string) {
  const fullPath = pathUtils.join(process.cwd(), path);
  await fs.mkdir(pathUtils.dirname(fullPath), { recursive: true });
  await fs.writeFile(pathUtils.join(process.cwd(), path), content)
}

async function writePartialFile(args: { path: string, name: string, commentPrefix: string, content: string }) {
  const initialMessage = longComment(
    'This file has been generated by teseract, but can be modified as long as the section between comments GENERATED and END GENERATED (including the comments) is not removed',
    { maxColumn: 80, preLine: args.commentPrefix }
  );

  const delimiterStart = `${args.commentPrefix}GENERATED teseract ${args.name}`
  const delimiterEnd = `${args.commentPrefix}END GENERATED teseract ${args.name}`

  if (!await fileExists(args.path)) {
    await writeCompleteFile(args.path, [
      initialMessage,
      '',
      delimiterStart,
      delimiterEnd
    ].join('\n'))
  }

  const fullContent = await fs.readFile(pathUtils.join(process.cwd(), args.path), { encoding: 'utf-8' });
  const delimiterStartPosition = fullContent.indexOf(delimiterStart);
  const delimiterEndPosition = fullContent.indexOf(delimiterEnd);
  if (delimiterStartPosition === -1 || delimiterEndPosition === -1) {
    throw new Error('Delimiters not found for ' + args.path)
  }

  const contentPosition = delimiterStartPosition + delimiterStart.length + 1;
  const contentLength = delimiterEndPosition - 1 - contentPosition;

  const newFullContent = [
    fullContent.slice(0, contentPosition),
    args.content,
    fullContent.slice(contentPosition + contentLength)
  ].join('');

  await writeCompleteFile(args.path, newFullContent);
}

function longComment(content: string, options: { pre?: string, post?: string, preLine?: string, maxColumn: number }): string {
  const words = content.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  words.forEach((word, i) => {
    if (currentLine.length !== 0) {
      currentLine += ' ';
    }
    currentLine += word;
    if (currentLine.length + (i >= (words.length - 1) ? 0 : words[i].length) >= options.maxColumn - (options.preLine?.length || 0)) {
      lines.push(currentLine);
      currentLine = '';
    }
  })
  lines.push(currentLine);
  return [
    options.pre || null,
    ...lines.map(l => `${options.preLine}${l}`),
    options.post || null
  ].filter(l => l !== null).join('\n');
}

async function fileExists(path: string) {
  try {
    const statResult = await fs.stat(path);
    if (statResult.isFile()) return true
  } catch (_) {
    return false
  }
}
