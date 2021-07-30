import { ESLint } from "eslint";

export default async function(args) {
    const fix = (args || []).indexOf('--fix') >= 0;
    const eslint = new ESLint({ fix });

    const results = await eslint.lintFiles([
        "src/**/*.ts",
        "test/**/*.ts"
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
