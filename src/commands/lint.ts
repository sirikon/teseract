import { stat } from 'fs/promises'

import { ESLint } from "eslint";

export default async function (args: string[]) {
  const fix = (args || []).indexOf("--fix") >= 0;
  const eslint = new ESLint({
    fix,
    overrideConfigFile: await fileExists('.eslintrc.json') ? ".eslintrc.json" : undefined,
  });

  console.log('Running linter...');
  const results = await eslint.lintFiles([
    "src/**/*.{ts,tsx}",
    "test/**/*.{ts,tsx}",
  ]);

  fix && await ESLint.outputFixes(results);

  const formatter = await eslint.loadFormatter("stylish");
  const resultText = formatter.format(results);
  resultText && console.log(resultText);

  const errorCount = results.reduce((c, r, i) => c + r.errorCount, 0);
  if (errorCount > 0) {
    process.exit(1);
  }
}

const fileExists = async (path: string) => {
  try {
    return (await stat(path)).isFile();
  } catch (_) {
    return false;
  }
}
