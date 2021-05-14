import { ESLint } from "eslint";

export default async function(args) {
    const fix = (args || []).indexOf('--fix') >= 0;
    const eslint = new ESLint({ fix, baseConfig: {
        'env': {
            'browser': true,
            'es2021': true
        },
        'extends': [
            'eslint:recommended',
            'plugin:@typescript-eslint/recommended'
        ],
        'parser': '@typescript-eslint/parser',
        'parserOptions': {
            'ecmaVersion': 12,
            'sourceType': 'module'
        },
        'plugins': [
            '@typescript-eslint'
        ],
        'rules': {
            'indent': [
                'error',
                'tab'
            ],
            'linebreak-style': [
                'error',
                'unix'
            ],
            'quotes': [
                'error',
                'single'
            ],
            'semi': [
                'error',
                'always'
            ]
        }
    }});

    const results = await eslint.lintFiles([
        "src/**/*.ts"
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
