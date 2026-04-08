//  @ts-check

/** @type {import('prettier').Config} */
const config = {
  tabWidth: 2,
  semi: true,
  singleQuote: false,
  trailingComma: 'es5',
  endOfLine: 'lf',
  printWidth: 100,
  arrowParens: 'always',
  bracketSpacing: true,
  bracketSameLine: false,
  jsxSingleQuote: false,
  quoteProps: 'as-needed',
  plugins: ['prettier-plugin-tailwindcss'],
}

export default config
